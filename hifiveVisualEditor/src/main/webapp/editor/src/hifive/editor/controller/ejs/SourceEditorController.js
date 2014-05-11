/*
 * Copyright (C) 2013 NS Solutions Corporation, All Rights Reserved.
 */
(function($) {

	// =========================================================================
	//
	// 外部定義のインクルード
	//
	// =========================================================================

	// TODO 別ファイルで定義されている定数・変数・関数等を別の名前で使用する場合にここに記述します。
	// 例：var getDeferred = h5.async.deferred;

	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================

	// =========================================================================
	//
	// スコープ内静的プロパティ
	//
	// =========================================================================

	// =============================
	// スコープ内静的変数
	// =============================

	// TODO このスコープで共有される変数（クラス変数）を記述します。
	// 例：var globalCounter = 0;

	// =============================
	// スコープ内静的関数
	// =============================

	// =========================================================================
	//
	// スコープ内クラス
	//
	// =========================================================================



	// =========================================================================
	//
	// メインコード（コントローラ・ロジック等）
	//
	// =========================================================================

	var sourceEditorController = {
		/**
		 * @memberOf hifive.editor.controller.ejs.SourceEditorController
		 */
		__name: 'hifive.editor.controller.ejs.SourceEditorController',

		__init: function() {
			$(this.rootElement).attr('contentEditable', true);
		},

		setText: function(text) {
			var converted = text.replace(/\x09/g, '    ').replace(/\x0D/g, '');

			$(this.rootElement).text('').focus();

			document.execCommand('insertText', false, converted);
		},

		getText: function() {
			//TODO textContent, text()だと改行コードがなくなる。
			var raw = $(this.rootElement)[0].innerText; //.text();

			var text = raw.replace(/\xA0/g, ' ');
			return text;
		},

		'{rootElement} keydown': function(context) {
			var ev = context.event.originalEvent;
			var keyCode = ev.keyCode;

			var needsPreventDefault = false;

			switch (keyCode) {
			case 9:
				//Chromeの場合、連続する空白文字は強制的に"&nbsp;\x20"の組で表現される。
				//そのため、getText()時に&nbsp;を通常のスペースに置換して返している
				document.execCommand('insertText', false, '    ');
				needsPreventDefault = true;
				break;
			}

			if (needsPreventDefault) {
				context.event.preventDefault();
			}

		},

		'{rootElement} keyup': function() {
			this.trigger('textChange');

		},

		'{rootElement} paste': function(context) {
			var ev = context.event.originalEvent;

			var raw = ev.clipboardData.getData('Text');

			var text = raw.replace(/\x09/g, '    ').replace(/\x0D/g, '');

			document.execCommand('insertText', false, text);
			context.event.preventDefault();
		},

	//コピー時にSpace -> Tab変換する、等
	//		'{rootElement} copy': function(context) {
	//			var ev = context.event.originalEvent;
	//		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(sourceEditorController);

})(jQuery);
