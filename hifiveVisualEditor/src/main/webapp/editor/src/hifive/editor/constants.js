(function() {

	h5.u.obj.expose('hifive.editor.consts', {
		/**
		 * @memberOf hifive.editor.consts
		 */
		LAYOUT_CELL_SELECTOR: '.layoutCell',

		LAYOUT_CONTAINER_SELECTOR: '.layoutContainer',

		PAGE_VEIL: '.pageVeil',

		DATA_CONTAINER: 'data-h5editor-container',

		DATA_CONTAINER_SELECTOR: '[data-h5editor-container]',

		DATA_COMPONENT: 'data-h5editor-component',

		DATA_COMPONENT_ID: 'data-h5editor-component-id',

		DATA_H5_MODULE: 'data-h5-module',

		DATA_COMPONENT_SELECTOR: '[data-h5editor-component]',

		DATA_TEMPORARY: 'data-h5editor-temporary',

		DATA_TEMPORARY_SELECTOR: '[data-h5editor-temporary]',

		DATA_CUSTOM_CSS: 'data-h5editor-custom-css',

		EVENT_REMOVE_COMPONENT: 'removeComponent',

		HIGHLIGHT_TYPE_OVER: 'over',

		HIGHLIGHT_TYPE_SELECTED: 'selected',

		REGION_GROUP_SELECTED: 'selected',

		REGION_GROUP_OVER: 'over',

		AUTO_SAVE_WAIT: 1000,

		EVENT_PAGE_CONTENTS_CHANGE: 'pageContentsChange',

		EVENT_PAGE_VIEW_CHANGE: 'pageViewChange',

		EVENT_ELEMENT_FOCUS: 'elementFocus',

		EVENT_ELEMENT_SELECT: 'elementSelect',

		EVENT_ELEMENT_UNSELECT: 'elementUnselect',

		EVENT_ELEMENT_UNFOCUS: 'elementUnfocus',

		EVENT_STATE_CHANGE: 'stateChange',

		EVENT_LIB_LOADING: 'libLoading',

		EVENT_LIB_LOAD_COMPLETE: 'libLoadComplete',

		EVENT_ADD_COMPONENT_BEGIN: 'addComponentBegin',

		EVENT_ADD_COMPONENT_COMPLETE: 'addComponentComplete',

		EVENT_ADD_COMPONENT_ABORT: 'addComponentAbort',

		EVENT_ADD_COMPONENT_END: 'addComponentEnd',

		SELECTION_MODE_ELEMENT: 0,

		SELECTION_MODE_COMPONENT: 1,

		SELECTION_MODE_TEMPLATE: 2,

		IGNORE_ATTRIBUTES: ['data-h5editor-*'],

		IGNORE_CLASS_NAME: ['_h5editorMinSize'],

		OVERLAY_ROOT: '<div class="popupOverlay"></div>',

		OVERLAY_BORDER_WIDTH: 5,

		METRICS_MARGIN_COLOR: '#ffa500',

		METRICS_BORDER_COLOR: '#ffd700',

		METRICS_PADDING_COLOR: '#90ee90',

		TRIAL_MODE: true,

		ENABLE_SERVER_FEATURE: true
	});

})();
