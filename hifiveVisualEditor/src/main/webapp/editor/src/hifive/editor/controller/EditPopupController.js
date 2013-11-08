(function() {
	var editPopupController = {
		__name: 'hifive.editor.controller.EditPopupController',

		overlayObj: null,

		_popupElm: null,

		__ready: function() {

		},

		// シングルクリックでポップアップを消す
		'{rootElement} click': function(context) {
			this._removePopup();
		},

		_removePopup: function(context) {
			if (!this._popupElm) {
				return;
			}
			var controllers = h5.core.controllerManager.getControllers(this._popupElm, {
				deep: true
			});
			for ( var i = 0, l = controllers.length; i < l; i++) {
				controllers[i].dispose();
			}
			this._popupElm && this._popupElm.remove();
		},

		'{rootElement} dblclick': function(context) {
			var pageController = hifive.editor.u.getFocusedPageController();
			var target = pageController.getTargetAtPoint(context.event.pageX, context.event.pageY);

			var element = target.element;
			var component = target.component;

			this.overlayObj = pageController.createOverlay('editor', {
				pageElement: element
			});

			var $root = $(this.overlayObj.root);
			this._popupElm = $root;

			// ポップアップ内のクリックは後ろへ伝播させない
			$root.bind('click', function(event) {
				event.stopImmediatePropagation();
			});

			// 要素追加
			this.view.update($root, 'editPopup');

			// タグ編集
			var $tagEdit = $root.find('.tagEdit');
			h5.core.controller($tagEdit, hifive.editor.controller.TagEditController, {
				element: element
			});

			// コンポーネント編集
//			var $editorRoot = $root.find('.editorRoot');
//			var componentName = pageController._getComponentName(component);
//			if (!componentName) {
//				return;
//			}
//
//			var creator = hifive.editor.u.getComponentCreator(componentName);
//
//			var schema = creator.createEditor; // TODO 関数かもしれない
//
//			$editorRoot.addClass('in');
//
//			h5.core.controller($editorRoot,
//					hifive.editor.controller.GenericParameterEditController, {
//						element: element
//					}).readyPromise.done(function() {
//				this.show($(component), schema);
//			});
		}
	};

	h5.core.expose(editPopupController);
})();
