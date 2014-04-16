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

	var appController = {
		__name: 'hifive.editor.controller.AppController',

		_fileStoreLogic: hifive.editor.logic.FileStoreLogic,

		_nodePathController: hifive.editor.controller.NodePathController,

		_isPreview: false,

		'[name="export"] click': function(context) {

			var pageController = this._getPageController();

			var popup = h5.ui.popupManager.createPopUp('default');

			var form = this.view.get('export');

			popup.setTitle('エクスポート');
			popup.setContents(form);

			var html = pageController.exportPage();

			$(popup.contents).find('textarea').val(html);

			popup.show();

			var $btn = $('button.download').attr('disabled', 'disabled').text('アップロード中…');
			// exportをクリックした時点でuploadする
			// ダウンロードボタンクリック時の動作はpageControlControllerに記述してあります
			// TODO urlはとりあえず動作確認用
			this._fileStoreLogic.upload('test.html', html).done(function(url) {
				$btn.removeAttr('disabled');
				$btn.data('download-url', url);
				$btn.text('ダウンロード');
			});
		},

		'.livePreview click': function() {
			this._isPreview = !this._isPreview;

			this._setPreview(this._isPreview);
		},

		'.previewNewWindow click': function() {
			this.trigger('previewNewWindow');
		},

		'#testForm submit': function(context) {
			context.event.preventDefault();
			context.event.stopPropagation();
		},

		'{rootElement} cancelPreview': function(context) {
			this._setPreview(false);
		},


		'{document} loadPage': function(context) {
			var templateUrl = context.evArg.url;

			var savePath = context.evArg.savePath;

			this.log.debug('loadpage templateUrl={0}, savePath={1}', templateUrl, savePath);

			this._getPageController().newPage(templateUrl, savePath);

			this._nodePathController.clear();

			//			setTimeout(
			//					function() {
			/*
			var link = $('#if')[0].contentDocument.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('href', '/hifiveVisualEditor/editor/editorStyles.css');

			$('#if')[0].contentDocument.head.appendChild(link);
			console.log('link tag');

			var blink = $('#if')[0].contentDocument.createElement('link');
			blink.setAttribute('rel', 'stylesheet');
			blink.setAttribute('href',
					'/hifiveVisualEditor/res/lib/bootstrap/css/bootstrap.min.css');
			$('#if')[0].contentDocument.head.appendChild(blink);

			var blink = $('#if')[0].contentDocument.createElement('script');
			blink.setAttribute('src',
					'/hifiveVisualEditor/res/lib/jquery/jquery-1.8.3.min.js');
			$('#if')[0].contentDocument.head.appendChild(blink);

			var blink = $('#if')[0].contentDocument.createElement('script');
			blink.setAttribute('src',
					'/hifiveVisualEditor/res/lib/bootstrap/js/bootstrap.min.js');
			$('#if')[0].contentDocument.head.appendChild(blink);
			*/
		},

		'.pageOverlay dblclick': function(context) {
			var pageController = hifive.editor.u.getFocusedPageController();
			var target = pageController.getTargetAtPoint(context.event.pageX, context.event.pageY);
			if (target && target.element) {
				//TODO メソッド呼び出しにする
				$('.tagEdit').trigger('tagSelect', {
					element: target.element
				});
			}
		},

		'.pageOverlay click': function(context) {
			var pageController = hifive.editor.u.getFocusedPageController();
			var target = pageController.getTargetAtPoint(context.event.pageX, context.event.pageY);
			if (target && target.component) {
				//TODO メソッド呼び出しにする
				$('.tagEdit').trigger('tagSelect', {
					element: target.component
				});
			}
		},

		'{rootElement} elementFocus': function(context) {
			this._nodePathController.show(context.evArg.element);
		},

		_setPreview: function(flag) {
			var pageController = this._getPageController();

			pageController.livePreview(flag);

			this._isPreview = flag;

			if (flag) {
				this.$find('.livePreview').addClass('btn-success');
			} else {
				this.$find('.livePreview').removeClass('btn-success');
			}
		},

		_getPageController: function() {
			//TODO PageControllerのインスタンスをDIしてもらう仕組み
			return hifive.editor.u.getFocusedPageController();
		}
	};

	h5.core.expose(appController);

})();
