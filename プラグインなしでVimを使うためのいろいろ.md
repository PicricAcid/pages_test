#vim #vimscript 

共用の開発マシンでの開発など、Vimをアップデートできなかったりプラグインを入れられなかったりする場合に、vimrcだけでやっていることをまとめました。

## 1. タブラインのバッファ化
Vimにはタブをエディタ上部に表示するタブライン機能がありますが、タブ自体使うことがまずないのではないため、そのままでは無用の長物です。そこで、vim-airlineなどでタブの代わりに開いているバッファを表示するようにするのが一般的です。タブでなくバッファを表示すれば、基本的にファイルと一対一で対応しているので、開いているファイルがわかりやすいです。

これをプラグインなしで実装すると以下のようになります。

```VimScript
function! BufferTabLine() 
	let buffer_tabline = '' 
	let sep = '|' 
	let s:buffer_info = s:GetBufferName() 
	for i in s:buffer_info 
		if i[3] == 1 
			let buffer_tabline = buffer_tabline . '%#TabLineSel#' 
		else 
			let buffer_tabline = buffer_tabline . '%#TabLine#' 
		endif 
	
		let buffer_tabline = buffer_tabline . i[0] . ': ' . i[1] 
	
		if i[2] == 1 
			let buffer_tabline = buffer_tabline . ' +' 
		endif 
	
		let buffer_tabline = buffer_tabline . sep 
	endfor 

	let buffer_tabline = buffer_tabline . '%#TabLineFill#%T' 
	let buffer_tabline = buffer_tabline . '%=buffers' 
	return buffer_tabline 
endfunction 

function! s:GetBufferName() 
	let s:buffers = execute('ls') 
	let s:result = [] 
	let s:buffer_list = split(s:buffers, "\n") 
	for b in s:buffer_list 
		let s:buffer_line = split(b) 
		let s:buffer_num = s:buffer_line[0] 
		let s:buffer_name = '' 
		let s:current_buffer = 0 
		let s:edit_flag = 0
		let s:unmodifiable = 0 
		
		for i in s:buffer_line 
			if i == '%a' 
				let s:current_buffer = 1 
			elseif i == '+' 
				let s:edit_flag = 1 
			elseif i == 'a-' || i == '%a-'
				let s:unmodifiable = 1
			elseif i[0] == '"' 
				let s:path = substitute(i, '"', '', 'g') 
				let s:name_path = split(s:path, '/') 
				let s:buffer_name = s:name_path[len(s:name_path) - 1]
			else 
			endif 
		endfor 
	
		if s:unmodifiable != 1
			let s:result = add(s:result, [s:buffer_num, s:buffer_name, s:edit_flag, s:current_buffer]) 
		endif
	endfor 
	return s:result 
endfunction 

set tabline=%!BufferTabLine()
set showtabline=2
```

仕組みとしては、:lsコマンドでバッファ一覧を取得し、quickfixなどの非変更バッファを除いてtablineを構築しています。
また、Vim8以前ではexecute()を使えないため、:lsの結果を取得するには、

```
redir => s:buffers
	silent ls
redir END
```

として、一旦ダミーバッファにリダイレクトします。

## 2. Grepの高速化、結果のQuickfixへの流し込み
Vim上でファイル検索する機能としてVimGrepがありますが、かなり重く使い勝手が良くありません。
VimGrepと同等の機能はshellコマンドのfindとgrepを組み合わせれば作れるため、置き換えて高速化します。

まずfindで検索するファイルを絞ります。カレントディレクトリ以下の全てのファイルを探してもいいですが、ファイルの形式(.cとか.vimとか)がわかっていることが多いと思いますので、引数で指定できるようにしています。
```
$ find [検索ディレクトリ] -name [ファイル形式] -type f ! -path *.git/*
```

findで探したファイルの内部をgrepで検索します。
```
$ cat [find結果] | xargs grep -n [キーワード] /dev/null
```
findの結果をパイプでgrepに渡すとき、量が多いとバッファが溢れて渡せない場合があります。そこで、find結果を一度テンポラリファイルに書き出し、catした結果をgrepで渡しています。

これらのshellをVimScriptに組み込みます。
```
command! -nargs=* Grep call s:grep_all(<f-args>)
let g:searched_dir = ""
let g:searched_filetype = ""
 
function s:grep_all(...) abort
	if a:0 < 1
		call s:find_dir("\"*.*\"", "\./")
		call s:grep(expand('<cword>'))
	elseif a:0 == 1
		call s:find_dir("\"*.*\"", "\./")
		call s:grep(a:1)
	elseif a:0 == 2
		call s:find_dir(a:2, "\./")
		call s:grep(a:1)
	elseif a:0 == 3
		call s:find_dir(a:2, a:3)
		call s:grep(a:1)
	else
	endif
endfunction

function s:find_dir(filetype, search_dir) abort
	if stridx(a:search_dir, g:searched_dir) == -1 || stridx(a:filetype,   g:searched_filetype) == -1 || !exists("g:find_dir_tmp")
		let g:searched_dir = a:search_dir
		let g:searched_filetype = a:filetype
		let l:find_sh = "find " . a:search_dir . " -name " . a:filetype . " -type f ! -path \"*.git/*\""
		let g:find_dir_tmp = tempname()
		call writefile(split(system(l:find_sh), "\n"), g:find_dir_tmp)
	endif
endfunction

function s:grep(text) abort
	let l:grep_sh = "cat " . g:find_dir_tmp . " | xargs grep -n " . a:text . " /dev/null"
	cexpr system(l:grep_sh) | cw
endfunction
```
find結果を保持するテンポラリファイルはtempname()で作成しています。さらに、一度取得したfind結果を保持しておき、検索の条件(ファイル形式や検索ディレクトリ)が同じであればfind結果を使い回すことで高速化を図っています。

また、grepの結果を取得する際、以下のようにしています。
```
cexpr system(l:grep_sh) | cw
```
cexprは演算結果をquickfixに渡すことができるコマンドで、cwはquickfixウィンドウの起動コマンドです。こうすることで、検索結果をそのままquickfixリストとして表示することができます。


## 3. ファイラ
強がって強がって出すやつではなく、ディレクトリやファイルを表示するツールです。
Vimにはnetrwという標準のファイラが組み込まれており、ちょっと使いづらさはありますが、設定次第でかなり改善します。

netrwの設定はg:netrw~という変数でまとまっているため、.vimrcで設定します。

```
" バナーを表示しない(分割ウィンドウで表示すると邪魔になる)
let g:netrw_banner = 0
" ファイラウィンドウのサイズ、お好みに
let g:netrw_winsize = 20
" ファイラウィンドウを垂直分割で表示(水平分割のときは0)
let g:netrw_preview = 1
" ツリー形式で表示する
let g:netrw_liststyle = 3
" 選択ファイルを開く(ファイラ以外のウィンドウで開く)
let g:netrw_browse_split = 4
" 開いたディレクトリに移動する
let g:netrw_keepdir = 0
```

さらに、起動時にファイラを表示するように以下の設定をします。
```
autocmd! VimEnter * Ve | wincmd w
```

netrwではjキー、kキーで上下選択、Enterでディレクトリ、ファイルを開きます。また、"-"で一つ上のディレクトリに移動します。他にもキーがありますが、ひとまずこれだけ知っていれば十分です。

### ディレクトリ移動の注意点
netrwでディレクトリ移動しても、Vim自体のカレントディレクトリは起動時のディレクトリに留まったままになります(g:netrw_keepdirの設定によりnetrwウィンドウのディレクトリは移動します)。
これではgrepの際に不便なので、バッファで開いているファイルの場所にカレントディレクトリを変更するように設定します。
```
set autochdir
```


## 4. 組み合わせ
今まで紹介した機能を組み合わせると、以下のような画面を作ることができます。ちょっとモダンなエディタっぽくなったのではないでしょうか。
![[スクリーンショット 2024-12-08 8.38.55.png]]

## 5. まとめ
以上のように、.vimrcとshellのみでそこそこ使えるエディタが構築できます。
やろうとすればいくらでも拡張できるのもVimのいいところですし、Vimの理解にもつながります。なにより自分のVimを育ててる感がありますので、ぜひお試しください。

## 関連記事
[[Vimメモ]]
