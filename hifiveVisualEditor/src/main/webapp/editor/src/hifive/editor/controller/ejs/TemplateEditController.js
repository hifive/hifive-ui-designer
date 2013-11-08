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

	var getComponentCreator = hifive.editor.u.getComponentCreator;

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

	var templateEditController = {
		/**
		 * @memberOf hifive.editor.controller.ejs.TemplateEditController
		 */
		__name: 'hifive.editor.controller.ejs.TemplateEditController',

		__meta: {
			_sourceEditorController: {
				rootElement: '.sourceText'
			}
		},

		_previewController: hifive.editor.controller.ejs.PreviewController,

		_sourceEditorController: hifive.editor.controller.ejs.SourceEditorController,

		_targetWaitDeferred: null,

		_isCloseConfirmationSet: false,

		__ready: function() {
			var that = this;

			h5.u.obj.expose('hifive.editor', {
				highlightDropTarget: function(pageX, pageY) {
				//that._highlightDropTarget(pageX, pageY);
				},

				hideDropTarget: function() {
				//					this.$find('.editInfoOverlay .cellArea').each(function() {
				//						$(this).remove();
				//					});
				},

				dropComponent: function(componentId, pageX, pageY) {
					var creator = getComponentCreator(componentId);
					if (!creator) {
						this.log.warn('componentが見つからない。key={0}', componentId);
						return;
					}

					var $view = creator.createView();

					var html = $view[0].outerHTML;

					$(that._sourceEditorController.rootElement).focus();

					document.execCommand('insertText', false, html);

					that._applyTemplate();
				}
			});




			this._previewController.setTarget(this.$find('.templateApplicationRoot'));

			if (window.opener) {
				this._targetWaitDeferred = h5.async.deferred();
				var promise = this._targetWaitDeferred.promise();

				this.indicator({
					target: document.body,
					promises: promise,
					block: true,
					message: 'ロード中...'
				}).show();

				var that = this;
				setTimeout(function() {
					if (that._targetWaitDeferred.state() === 'pending') {
						alert('テンプレートの適用先の設定に失敗しました。');
						that._targetWaitDeferred.resolve();
					}
				}, 2000);

				return promise;
			}
		},

		setTarget: function(element) {
			this._previewController.setTarget(element);

			if (this._targetWaitDeferred) {
				this._targetWaitDeferred.resolve();
				this.$find('.result').css('display', 'none');
			}
		},

		setTemplateText: function(text) {
			this._sourceEditorController.setText(text);
		},

		setDataText: function(json) {
			this.$find('.dataText').val(json);
		},

		setTemplateId: function(templateId) {
			this.$find('.templateIdText').text('テンプレートID:' + templateId);
		},

		'.applyTemplateBtn click': function() {
			this._applyTemplate();
		},

		'{rootElement} textChange': function() {
			//this._setCloseConfirmation();
			this._applyTemplate();
		},

		_applyTemplate: function() {
			var template = this._sourceEditorController.getText();

			var json;

			this._clearMessage();

			try {
				var data = this._getData();
				if (!data || data === '') {
					json = null;
				} else {
					json = $.parseJSON(data);
				}
			} catch (e) {
				this._setMessage('データオブジェクトが不正です：' + e.message);
				return;
			}

			this._previewController.setData(json);

			try {
				this._previewController.preview(template);
			} catch (e) {
				this._setMessage(e.message);
			}
		},

		_setCloseConfirmation: function() {
			if (this._isCloseConfirmationSet) {
				return;
			}
			this._isCloseConfirmationSet = true;

			window.addEventListener('beforeunload', function(ev) {
				var msg = '※※注意※※\n' + 'ページ遷移しようとしています。内容をコピーしていない場合はキャンセルしてください。';

				ev.returnValue = msg;
				return msg;
			});
		},

		_clearMessage: function() {
			this._setMessage('');
		},

		_setMessage: function(text) {
			this.$find('.statusMessage').text(text);
		},

		_getData: function() {
			var data = this.$find('.dataText').val();
			return data;
		}

	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(templateEditController);

})(jQuery);
