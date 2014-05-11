/*
 * Copyright (C) 2012-2014 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
