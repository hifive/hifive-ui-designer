(function() {

	var getFocusedPageController = hifive.editor.u.getFocusedPageController;


	/**
	 * @class hifive.editor.controller.CSSEditorController
	 */
	var CSSEditorController = {
		__name: 'hifive.editor.controller.CSSEditorController',

		__ready: function() {
		// CSSライブ編集用のテキストボックス表示。
		// TODO とりあえず動作確認用でhtmlに直接書いて仮置きしている
		},

		'{#editCSSPanel .apply} click': function(context, $target) {
			this._applyCss($('#styleDef').val());
		},

		'{#styleDef} keydown': function(context, $target) {
			var that = this;

			h5.ext.u.execSlippery('CSSEditor_keydown', function(){
				that._applyCss($target.val());
			}, 200);
		},

		_applyCss: function(str) {
			try {
				var pageController = getFocusedPageController();
				if (pageController) {
					pageController.setCustomCss(str);
				}
			} catch (e) {
				// エラーメッセージの表示
				this.view.update($('#cssErrorMessage'), 'tmp-cssErrorMessage', e);
				return;
			}
			// エラーメッセージの消去
			$('#cssErrorMessage').html('');
		}
	};

	h5.core.expose(CSSEditorController);

})();
