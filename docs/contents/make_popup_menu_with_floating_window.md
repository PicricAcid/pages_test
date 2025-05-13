---
title: "NeoVimのFloating WindowでPopup Menuを作ってみた"
author: PircicAcid
date: 2025-05-13
tags: [vim, NeoVim, Lua]
---

最近VimからNeoVimに移行しまして、Luaに慣れるべくFloating WindowでPopup Menuを作ってみました。

## Floating Window
NeoVimにはFloating Windowと呼ばれる標準ウィンドウの上に描画可能なウィンドウがあります。これにより、ウィンドウを複数重ねることができるようになりました。

Floating Windowは以下のようにAPIから利用することがあります。

```Lua
local win_id = vim.api.nvim_open_win(buffer, enter, config)
```

bufferはFloating Windowに表示するバッファ、enterはウィンドウにカーソルを移動するかどうか、configはウィンドウの設定テーブルです。そして返り値としてウィンドウ番号を返します。

## Popup Menu
NeoVimでFloating Windowが登場するまで、VimではPopup機能を用いてウィンドウを重ねて描画していました(補完の出力やballoonはまた別の仕組み？のようですが)。Popup機能はVim8から搭載されています。

PopupにはPopup Menuというリスト専用機能があります。

```VimScript
popup_menu(list, config)
```

Popup Menuはlistの内容を表示し、選択したlistの項目をconfig中で指定したcallbackに渡し、処理を実行できる、というものです。

このPopup Menuはかなり便利なのですが、NeoVimのFloating Windowにはこの機能はありません。
そこで、今回はLuaの勉強がてらPopup Menuを作ってみました。

## コード

全コードは以下です。
```Lua
local M = {}
local api = vim.api

vim.cmd("highlight PopupMenuFloatBorder guifg=#006db3")
vim.cmd("highlight PopupMenuFloatTitle guifg=#6ab7ff")
vim.cmd("highlight PopupMenuText guifg=#abb2bf")
vim.cmd("highlight PopupMenuTextSelected guifg=#abb2bf guibg=#383c44")

---@param popup_table table<string>
---@param opt table<T>
---@param callback function()
---@return callback(string)
function M.popup_menu(popup_table, opt, callback)
    local buffer = api.nvim_create_buf(false, true)

	if opt == nil then
	    opt = {
		    start_index = 1,
		    relative = 'cursor',
		    row = 0,
		    col = 0,
		    width = 40,
		    height = 5,
		    border = 'rounded',
			title = 'popup_menu',
		    zindex = 1,
		}
    end

    opt.title = { { opt.title, 'PopupMenuFloatTitle' } }

    local start_index = opt.start_index
    local cursor_pos = opt.start_index
    local height = math.min(opt.height, #popup_table)

    -- popup_windowを作成
    local window = api.nvim_open_win(buffer, true, {
		relative = opt.relative,
		row = opt.row,
		col = opt.col,
		width = opt.width,
		height = height,
		focusable = true,
		border = opt.border,
		title = opt.title,
		title_pos = 'left',
		noautocmd = true,
		zindex = opt.zindex,
    })
    
    api.nvim_win_set_option(window, 'number',  false)
    api.nvim_win_set_option(window, 'relativenumber', false)
    api.nvim_win_set_option(window, 'wrap',  false)
    api.nvim_win_set_option(window, 'cursorline',  false)
    api.nvim_win_set_option(window, 'winhighlight',  'FloatBorder:PopupMenuFloatBorder,NormalFloat:PopupMenuText')
    
    -- ハイライト用のnamespace, extmarkを作成
    local ns_id = api.nvim_create_namespace("popup_menu_ns")
    local current_extmark = nil

    -- 選択カーソル表示(cursor_posの位置にハイライト)
    ---@param cursor_pos number 
    ---@param buffer number
    local function window_update(cursor_pos, buffer)
		if current_extmark then
		    api.nvim_buf_del_extmark(buffer, ns_id, current_extmark)
		end

		current_extmark = api.nvim_buf_set_extmark(buffer, ns_id, cursor_pos - 1, 0, {
		    end_row = cursor_pos,
		    hl_group = "PopupMenuTextSelected",
		    priority = 100,
			hl_eol = true,
		})
    end

    -- popup_menu描画関数
    local function popup_menu_render()
		-- スクロール表示部分をdisplay_tableに格納
		local end_index = math.min(start_index + height - 1, #popup_table)
		local display_table = {}

		for i = start_index, end_index do
		    table.insert(display_table, popup_table[i])
		end

		-- popup_windowを更新
		api.nvim_buf_set_lines(buffer, 0, -1, true, display_table)
		window_update(cursor_pos, buffer)
    end

    -- cursor制御関数(スクロール処理も行う)
    ---@param direction number
    local function popup_menu_move_cursor(direction)
		if direction == "down" then
		    if cursor_pos < height and (start_index + cursor_pos - 1) < #popup_table then
			cursor_pos = cursor_pos + 1
			
		    elseif (start_index + height - 1) < #popup_table then
				start_index = start_index + 1
		    end
		elseif direction == "up" then
		    if cursor_pos > 1 then
				cursor_pos = cursor_pos - 1
		    elseif start_index > 1 then
				start_index = start_index - 1
		    end
		end
		popup_menu_render()
    end

    --選択した要素をcallbackで返す
    local function popup_menu_select()
		local select_index = start_index + cursor_pos - 1
		
		if popup_table[select_index] then
		    api.nvim_win_close(window, false)
		    if callback then
				callback(popup_table[select_index])
		    end
		end
    end

    -- キーマッピング
    vim.tbl_map(function(buf)
		vim.keymap.set('n', '<ESC>', function()
		    api.nvim_win_close(window, false)
		end, { buffer = buf })

		vim.keymap.set('n', '<Down>', function() popup_menu_move_cursor("down") end, { buffer = buf })
		vim.keymap.set('n', '<Up>', function() popup_menu_move_cursor("up") end, { buffer = buf })
		vim.keymap.set('n', '<CR>', function() popup_menu_select() end, { buffer = buf })
    end, { buffer })

    -- 初期表示
    popup_menu_render()
end

return M
```
`
以下、コードの部分について説明です。

```Lua
local M = {}
-- 中略
function M.popup_menu(popup_table, opt, callback)
--中略
return M
```

これは公開関数を作成している部分です。Luaではテーブルに関数を入れておくことで外部に公開する関数として扱えます。


```Lua
local ns_id = api.nvim_create_namespace("popup_menu_ns")
local current_extmark = nil

local function window_update(cursor_pos, buffer)
	if current_extmark then
		api.nvim_buf_del_extmark(buffer, ns_id, current_extmark)
	end

	current_extmark = api.nvim_buf_set_extmark(buffer, ns_id, cursor_pos - 1, 0, {
		end_row = cursor_pos,
		hl_group = "PopupMenuTextSelected",
		priority = 100,
		hl_eol = true,
	})
end
```

これは選択した項目のみハイライトを変更する処理です。ここではextmark機能を使用しています。

extmark機能とは指定した範囲のマーカー機能で、hl_groupにハイライトを指定することで、指定範囲のハイライトのみを変更することができます。

また、namespace機能でハイライトを管理しやすくまとめています。

```Lua
vim.tbl_map(function(buf)
	vim.keymap.set('n', '<ESC>', function()
		api.nvim_win_close(window, false)
	end, { buffer = buf })

	vim.keymap.set('n', '<Down>', function() 
		popup_menu_move_cursor("down") 
	end, { buffer = buf })
	
	vim.keymap.set('n', '<Up>', function() 
		popup_menu_move_cursor("up") 
	end, { buffer = buf })
	
	vim.keymap.set('n', '<CR>', function() 
		popup_menu_select()
	end, { buffer = buf })
end, { buffer })

```

この箇所はキーマップを指定しているところです。
vim.tbl_map(func, table)で囲わずともいちいちvim.keymap.set()で指定できますが、処理のかたまりとしてみやすいようにmapにしています。

また、vim.keymap.set()のcallbackに直接関数を指定できるので、function() ~ endで囲わずともpopup_menu_select()を呼び出すことは可能です。

```Lua
vim.keymap.set('n', '<CR>', popup_menu_select, { buffer = buf })
```

ただし、引数をcallbackに渡す場合は直接指定できないため、function() ~ endで無名関数に包むか関数を返すクロージャを作ってcallbackに指定する必要があります。


## 結果
以上のソースを~/.config/nvim/lua/utils下などに置き、以下のように使用します。

```Lua
local popup_menu = require("utils.popup_menu")

local table = { "Item1", "Item2", "Item3" }
local opt = {
  start_index = 1,
  relative = "cursor",
  row = 0,
  col = 0,
  width = 40,
  height = 2,
  border = "rounded",
  title = "popup_menu",
  zindex = 1,
}

popup_menu.popup_menu(table, opt, function(result)
  print(result)
end)
```

以下のようにpopup_menuが表示されます。

表示されていない分はスクロールして表示されます。

## まとめ
車輪の再発明ではありますが、Floating WindowとLuaに慣れるにはいい教材でした。
また、Floating WindowはVimのときのPopupのような制限がなく、さらにAPI化されており大変便利でした。
今回乗り換えるまで、NeoVimについて少し食わず嫌いしていた節がありましたが、Vimの機能がより洗練された部分が多く、思っていたよりいいものでした。今後も使っていきたいと思います。
