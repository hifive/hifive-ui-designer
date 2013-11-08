(function() {

	// =========================================================================
	//
	// Cache
	//
	// =========================================================================

	var TEMPLATE_ELEM_SELECTOR = '[data-template-id]';

	var LAYOUT_CELL_SELECTOR = hifive.editor.consts.LAYOUT_CELL_SELECTOR;

	var LAYOUT_CONTAINER_SELECTOR = hifive.editor.consts.LAYOUT_CONTAINER_SELECTOR;

	var PAGE_VEIL = hifive.editor.consts.PAGE_VEIL;

	var DATA_EDITOR_CONTAINER = hifive.editor.consts.DATA_CONTAINER;

	var DATA_COMPONENT = hifive.editor.consts.DATA_COMPONENT;

	var DATA_COMPONENT_ID = hifive.editor.consts.DATA_COMPONENT_ID;

	var DATA_COMPONENT_SELECTOR = hifive.editor.consts.DATA_COMPONENT_SELECTOR;

	var EVENT_REMOVE_COMPONENT = hifive.editor.consts.EVENT_REMOVE_COMPONENT;

	var HIGHLIGHT_TYPE_OVER = hifive.editor.consts.HIGHLIGHT_TYPE_OVER;

	var HIGHLIGHT_TYPE_SELECTED = hifive.editor.consts.HIGHLIGHT_TYPE_SELECTED;

	var HIGHLIGHT_TYPE_FOCUS = hifive.editor.consts.HIGHLIGHT_TYPE_FOCUS;

	var REGION_GROUP_SELECTED = hifive.editor.consts.REGION_GROUP_SELECTED;

	var REGION_GROUP_OVER = hifive.editor.consts.REGION_GROUP_OVER;

	var REGION_GROUP_FOCUS = hifive.editor.consts.REGION_GROUP_FOCUS;

	var getComponentCreator = hifive.editor.u.getComponentCreator;

	var METRICS_MARGIN_COLOR = hifive.editor.consts.METRICS_MARGIN_COLOR;

	var METRICS_BORDER_COLOR = hifive.editor.consts.METRICS_BORDER_COLOR;

	var METRICS_PADDING_COLOR = hifive.editor.consts.METRICS_PADDING_COLOR;

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	var TMPL_MOVE_COMPONENT = '<div class="moveComponentDragProxy"></div>';

	var TMPL_FOCUS_REGION = '<div class="metricsPadding"></div><div class="metricsContents"></div>';

	var TMPL_LIB_LOADING = '<div class="status" style="position:absolute; top:10px; right:10px; background-color:rgba(0,0,0,0.5);padding:10px;">必要なライブラリを読み込み中...</div>';

	var RANGE_THRESHOLD_LEN = 4;

	var RANGE_IN = '_in_';

	var RANGE_OUT = '_out_';

	var OVERLAY_GROUP_ORDER = [REGION_GROUP_OVER, REGION_GROUP_SELECTED, REGION_GROUP_FOCUS];

	var KEY_DELETE = 46;

	var WIDTH_OF_SPAN = 60;

	var SEL_METRICS_PADDING = '.metricsPadding';

	var SEL_METRICS_CONTENTS = '.metricsContents';

	var RESIZE_CONTENTS = 0;
	var RESIZE_PADDING = 1;
	var RESIZE_BORDER = 2;
	var RESIZE_MARGIN = 3;

	// =========================================================================
	//
	// Scoped Privates
	//
	// =========================================================================

	// =============================
	// Variables
	// =============================

	var BOOTSTRAP_FLUID_GRID_CONTAINER = {
		canHandleResize: function(target) {
			var $target = $(target);

			if ($target.parent().hasClass('row-fluid')) {
				return true;
			}

			return false;
		},

		resizeElement: function(pageController, targetElement, $overlay, dx, dy) {


			return {
				rx: dx,
				ry: dy,
				dx: dx,
				dy: dy
			};
		}
	};

	var BOOTSTRAP_GRID_CONTAINER = {
		/**
		 * @param window ページのwindowです。
		 * @param containerElem
		 * @param layoutCell ドロップ対象の親要素
		 * @param beforeElement
		 * @param elemToAdd
		 * @param pageX
		 * @param pageY
		 * @param designTimeData
		 */
		addComponent: function(window, containerElem, layoutCell, beforeElement, elemToAdd, pageX,
				pageY, designTimeData) {

			var $cell = $(layoutCell);

			if (!$cell.hasClass('row')) {
				//TODO デフォルトコンテナ取得方法
				DEFAULT_BODY_CONTAINER.addComponent(window, containerElem, layoutCell,
						beforeElement, elemToAdd, pageX, pageY, designTimeData);
				return;
			}

			$v = $(elemToAdd);

			if (beforeElement) {
				$(beforeElement).after($v);
			} else {
				$cell.prepend($v);
			}

			// bootstrap2以下用
			$v.css({
				width: '',
				minWidth: ''
			}).addClass('span2');

			// bootstrap3用
			$v.css({
				width: '',
				minWidth: ''
			}).addClass('col-md-2');
		},

		getDropCellSize: function(window, layoutCell) {
			if (!layoutCell || (layoutCell === window.contentDocument.body)) {
				return {
					width: $(window).innerWidth(),
					height: $(window).innerHeight()
				};
			}
			return {
				width: $(layoutCell).innerWidth(),
				height: $(layoutCell).innerHeight()
			};
		},

		canHandleResize: function(target) {
			var $target = $(target);

			if ($target.parent().hasClass('row')) {
				return true;
			}

			return false;
		},

		resizeElement: function(pageController, targetElement, $overlay, dx, dy) {


			return {
				rx: dx,
				ry: dy,
				dx: dx,
				dy: dy
			};
		}
	};



	var DEFAULT_BODY_CONTAINER = {
		addComponent: function(window, containerElem, layoutCell, beforeElement, elemToAdd, pageX,
				pageY, designTimeData) {

			if (layoutCell.tagName.toLowerCase() === 'body') { //FIXME
				if (beforeElement) {
					$(beforeElement).after(elemToAdd);
				} else {
					$(layoutCell).append(elemToAdd);
				}
			}

			if (!beforeElement && layoutCell.tagName.toLowerCase() !== 'body') { //FIXME
				//beforeがnull -> 先頭に挿入
				$(layoutCell).prepend(elemToAdd);
				return;
			}

			if (layoutCell === beforeElement) {
				$(beforeElement).after(elemToAdd);
				return;
			}

			if ($(layoutCell).has(beforeElement).length) {
				$(beforeElement).after(elemToAdd);
				return;
			}
			$(layoutCell).append(elemToAdd);
		},

		getDropCellSize: function(window, layoutCell) {
			if (!layoutCell || (layoutCell === window.contentDocument.body)) {
				return {
					width: $(window).innerWidth(),
					height: $(window).innerHeight()
				};
			}
			return {
				width: $(layoutCell).innerWidth(),
				height: $(layoutCell).innerHeight()
			};
		},

		canHandleResize: function() {
			return true;
		},

		resizeElement: function(pageController, targetElement, $overlay, dx, dy) {


			return {
				rx: dx,
				ry: dy,
				dx: dx,
				dy: dy
			};
		}
	};



	// =============================
	// Functions
	// =============================


	function insertScript(doc, src, isTemporary, srcName) {
		var dfd = h5.async.deferred();

		function onload(ev) {
			this.removeEventListener('load', onload);
			dfd.resolve();
		}

		var scriptTag = doc.createElement('script');
		scriptTag.setAttribute('src', hifive.editor.u.replaceEnv(src));

		if (isTemporary === true) {
			scriptTag.setAttribute(hifive.editor.consts.DATA_TEMPORARY, '');
		}
		if (srcName) {
			scriptTag.setAttribute(hifive.editor.consts.DATA_H5_MODULE, srcName);
		}

		scriptTag.addEventListener('load', onload);

		hifive.editor.u.addScripts(doc, scriptTag);

		return dfd.promise();
	}

	function insertCss(doc, src, isTemporary, srcName) {
		var dfd = h5.async.deferred();

		function onload(ev) {
			this.removeEventListener('load', onload);
			dfd.resolve();
		}

		var cssElem = doc.createElement('link');
		cssElem.type = 'text/css';
		cssElem.rel = 'stylesheet';
		cssElem.href = hifive.editor.u.replaceEnv(src);

		if (isTemporary === true) {
			cssElem.setAttribute(hifive.editor.consts.DATA_TEMPORARY, '');
		}
		if (srcName) {
			cssElem.setAttribute(hifive.editor.consts.DATA_H5_MODULE, srcName);
		}

		cssElem.addEventListener('load', onload);

		hifive.editor.u.addStylesheets(doc, cssElem);

		return dfd.promise();
	}

	function disposeControllers(root) {
		var controllers = h5.core.controllerManager.getControllers(root, {
			deep: true
		});

		for ( var i = 0, len = controllers.length; i < len; i++) {
			controllers[i].dispose();
		}
	}


	function getLayoutContainer(containerName) {
		var container = hifive.editor.containers[containerName];
		return container ? container : getDefaultContainer();
	}

	function getElementAt(pageContainer, rootPageX, rootPageY) {
		var doc = pageContainer.contentDocument;

		// 子のiframeにとっての「スクリーン座標」に変換
		var csx = rootPageX - $(pageContainer).offset().left;
		var csy = rootPageY - $(pageContainer).offset().top;

		return doc.elementFromPoint(csx, csy);
	}

	function getLayoutTarget(pageContainer, rootPageX, rootPageY, selectionMode) {
		var doc = pageContainer.contentDocument;

		var elem = getElementAt(pageContainer, rootPageX, rootPageY);

		var $layoutContainerElem = $(elem).closest(LAYOUT_CONTAINER_SELECTOR);
		var $layoutCellElem;
		switch (selectionMode) {
		case hifive.editor.consts.SELECTION_MODE_ELEMENT:
			$layoutCellElem = $(elem);
			break;
		case hifive.editor.consts.SELECTION_MODE_TEMPLATE:
			$layoutCellElem = $(elem).closest(TEMPLATE_ELEM_SELECTOR);
			break;
		case hifive.editor.consts.SELECTION_MODE_COMPOMENT: //デフォルト
		default:
			$layoutCellElem = $(elem).closest(LAYOUT_CELL_SELECTOR);
			break;
		}

		if (!$layoutCellElem[0]) {
			$layoutCellElem = $(doc.body);
		}

		var layoutContainer;
		if ($layoutContainerElem[0]) {
			layoutContainer = getLayoutContainer($layoutContainerElem.attr(DATA_EDITOR_CONTAINER));
		} else {
			layoutContainer = DEFAULT_BODY_CONTAINER;
		}

		//FIXME
		layoutContainer = BOOTSTRAP_GRID_CONTAINER;

		//TODO layoutCellがContainerに含まれているかをチェックすべきか

		return {
			container: layoutContainer,
			cell: $layoutCellElem[0]
		};

	}

	function getComponent(pageContainer, rootPageX, rootPageY) {
		var elem = getElementAt(pageContainer, rootPageX, rootPageY);
		return getComponentByElement(elem);
	}

	function getComponentByElement(element) {
		var $componentElem = $(element).closest(DATA_COMPONENT_SELECTOR);
		return $componentElem[0];
	}

	function getTargetAtPoint(pageContainer, rootPageX, rootPageY) {
		if (!pageContainer) {
			return null;
		}

		var elem = getElementAt(pageContainer, rootPageX, rootPageY);

		if (!elem) {
			return null;
		}

		var component = getComponentByElement(elem);

		//FIXME 必要なものだけ取得するようにする
		var templateRoot = $(elem).closest(TEMPLATE_ELEM_SELECTOR);

		return {
			element: elem,
			component: component,
			templateRoot: templateRoot.length === 0 ? null : templateRoot
		};
	}

	function isAppendable(target, elemToAdd) {
		var tag = target.tagName.toLowerCase();
		return tag === 'div' || tag === 'form'; //TODO 正しくする
	}


	function getEdgePosition(element, pageX, pageY, borderWidth) {
		var $el = $(element);

		var offset = $el.offset();
		var ex = offset.left;
		var ey = offset.top;
		var ew = $el.outerWidth();
		var eh = $el.outerHeight();

		var rangeX = getRange(pageX, [ex, ex + borderWidth, ex + ew - borderWidth, ex + ew]);
		var rangeY = getRange(pageY, [ey, ey + borderWidth, ey + eh - borderWidth, ey + eh]);

		if (isOutOfRange(rangeX) || isOutOfRange(rangeY)) {
			return RANGE_OUT;
		}

		var dir;

		switch (rangeY) {
		case 0:
			dir = 'n';
			break;
		case 2:
			dir = 's';
			break;
		default:
			dir = '';
			break;
		}

		switch (rangeX) {
		case 0:
			dir += 'w';
			break;
		case 1:
			//内部(の可能性がある)
			if (rangeY === 1) {
				dir = RANGE_IN;
			} else if (rangeY !== 0 && rangeY !== 2) {
				dir = RANGE_OUT;
			}
			break;
		case 2:
			dir += 'e';
			break;
		default:
			dir = RANGE_OUT;
			break;
		}

		return dir;
	}

	function isOutOfRange(range) {
		if (range < 0 || range >= RANGE_THRESHOLD_LEN) {
			return true;
		}
		return false;
	}

	function getRange(val, thresholds) {
		if (val < thresholds[0]) {
			return -1;
		}

		var i = 0;
		var len = thresholds.length - 1;

		for (; i < len; i++) {
			if (val < thresholds[i + 1]) {
				return i;
			}
		}

		if (val === thresholds[len]) {
			return len - 2;
		}

		return len - 1;
	}

	function isInRegion(region, pageX, pageY) {
		var $region = $(region);

		var offset = $region.offset();
		var top = offset.top;
		var left = offset.left;
		var right = left + $region.outerWidth();
		var bottom = top + $region.outerHeight();

		if (left <= pageX && pageX <= right && top <= pageY && pageY <= bottom) {
			return true;
		}
		return false;
	}

	// =========================================================================
	//
	// Controller
	//
	// =========================================================================


	(function() {

		//TODO overlayController??
		var manipulationController = {
			/**
			 * @memberOf hifive.editor.controller.page.ManipulationController
			 */
			__name: 'hifive.editor.controller.page.ManipulationController',

			_contextMenuController: h5.ui.ContextMenuController,

			_pageContainer: null,

			_pageController: null,

			_regionOverlays: [],

			__ready: function() {
				this._pageController = this.rootController;

				this.view.register('moveComponentDragProxy', TMPL_MOVE_COMPONENT);

				this._resizeOverlay();
			},

			_isInStage: function(pageX, pageY) {
				return isInRegion(this.rootElement, pageX, pageY);
			},

			_getElement: function(pageX, pageY) {
				if (!this._isInStage(pageX, pageY)) {
					return null;
				}

				var target = this._pageController.getTargetAtPoint(pageX, pageY);

				if (!target) {
					return null;
				}

				var mode = this._pageController.state.get('selectionMode');

				switch (mode) {
				case hifive.editor.consts.SELECTION_MODE_ELEMENT:
					return target.element;
				case hifive.editor.consts.SELECTION_MODE_TEMPLATE:
					return target.templateRoot;
				case hifive.editor.consts.SELECTION_MODE_COMPONENT:
				default:
					//コンポーネント単位で選択
					return target.component;
				}
			},

			_setRegionPos: function($region, rect) {
				$region.css({
					width: rect.width,
					height: rect.height,
					left: rect.x,
					top: rect.y
				});
			},

			_addOverlay: function(element, rect, id, group, type) {
				if (!rect) {
					return;
				}

				var $region = $(this.view.get('regionOverlay')).addClass(type);

				this._setRegionPos($region, rect);

				var order = $.inArray(group, OVERLAY_GROUP_ORDER);

				//TODO ここの処理はもう少しきれいにできそう
				if (order <= 0) {
					this.$find('.regionLayer').prepend($region);
				} else if (order >= OVERLAY_GROUP_ORDER.length - 1) {
					this.$find('.regionLayer').append($region);
				} else {
					var groupBefore = OVERLAY_GROUP_ORDER[order - 1];

					var $before = this.$find('.regionLayer .' + groupBefore + ':last');
					if ($before[0]) {
						$before.after($region);
					} else {
						var groupAfter = OVERLAY_GROUP_ORDER[order + 1];
						var $after = this.$find('.regionLayer .' + groupAfter + ':last');
						if ($after[0]) {
							$after.after($region);
						} else {
							this.$find('.regionLayer').append($region);
						}
					}
				}

				var region = {
					element: element,
					$region: $region,
					id: id,
					group: group
				};

				this._regionOverlays.push(region);

				return region;
			},

			_removeRegion: function(element, id, group) {
				if (element) {
					for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
						var r = this._regionOverlays[i];
						if (r.element === element) {
							//elementのみ、groupでの絞り込みを行っている
							if (group && r.group !== group) {
								continue;
							}

							r.$region.remove();
							this._regionOverlays.splice(i, 1);
							break;
						}
					}
				}

				if (id) {
					for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
						var r = this._regionOverlays[i];
						if (r.id === id) {
							r.$region.remove();
							this._regionOverlays.splice(i, 1);
							break;
						}
					}
				}

				if (group) {
					for ( var i = this._regionOverlays.length - 1; i >= 0; i--) {
						var r = this._regionOverlays[i];
						if (r.group === group) {
							r.$region.remove();
							this._regionOverlays.splice(i, 1);
						}
					}
				}
			},

			_getRegionAt: function(pageX, pageY, group) {
				for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
					var r = this._regionOverlays[i];
					if (isInRegion(r.$region, pageX, pageY) && r.group === group) {
						return r;
					}
				}
				return null;
			},

			_getRegionOf: function(element) {
				if (!element) {
					return null;
				}

				for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
					var r = this._regionOverlays[i];
					if (r.element === element) {
						return r;
					}
				}
				return null;
			},

			_getOverlayRect: function(pageElem) {
				return this._pageController._getPageElementRect(pageElem);
			},

			'{document} mousemove': function(context, $el) {
				var elem = this._getElement(context.event.pageX, context.event.pageY);

				if (!elem) {
					this._removeRegion(null, null, REGION_GROUP_OVER);
					return;
				}

				for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
					var r = this._regionOverlays[i];
					if (r.element === elem && r.group === REGION_GROUP_OVER) {
						//すでに同じ要素にオーバーレイしてある
						return;
					}
				}
				this._removeRegion(null, null, REGION_GROUP_OVER);

				var overlayRect = this._getOverlayRect(elem);

				var overlay = this._addOverlay(elem, overlayRect, null, REGION_GROUP_OVER,
						HIGHLIGHT_TYPE_OVER);

				this._addMetricsOverlay(overlay.$region);
				this._updateMetricsOverlay(overlay, overlayRect);
			},

			_addMetricsOverlay: function($region) {
				$region.addClass('metrics').append(TMPL_FOCUS_REGION);
			},

			_removeMetricsOverlay: function($region) {
				$region.empty();
			},

			_updateMetricsOverlay: function(overlay, rect) {
				var $el = $(overlay.element);
				var $r = overlay.$region;

				//margin表示
				var mTop = parseInt($el.css('marginTop')) || 0;
				var mLeft = parseInt($el.css('marginLeft')) || 0;
				var mRight = parseInt($el.css('marginRight')) || 0;
				var mBottom = parseInt($el.css('marginBottom')) || 0;
				$r.css({
					top: rect.y - mTop,
					left: rect.x - mLeft,
					borderTop: mTop,
					borderLeft: mLeft,
					borderRight: mRight,
					borderBottom: mBottom,
					borderStyle: 'solid',
					borderColor: METRICS_MARGIN_COLOR
				});

				//border表示
				var bTop = parseInt($el.css('borderTop')) || 0;
				var bLeft = parseInt($el.css('borderLeft')) || 0;
				var bRight = parseInt($el.css('borderRight')) || 0;
				var bBottom = parseInt($el.css('borderBottom')) || 0;
				var pW = $el.innerWidth();
				var pH = $el.innerHeight();
				$r.find(SEL_METRICS_PADDING).css({
					top: 0,
					left: 0,
					width: pW,
					height: pH,
					borderTop: bTop,
					borderLeft: bLeft,
					borderRight: bRight,
					borderBottom: bBottom,
					borderStyle: 'solid',
					borderColor: METRICS_BORDER_COLOR
				});

				this.log.debug('bT={0},bL={1}, bB={3}', bTop, bLeft, null, bBottom);

				//padding表示
				var pTop = parseInt($el.css('paddingTop')) || 0;
				var pLeft = parseInt($el.css('paddingLeft')) || 0;
				var pRight = parseInt($el.css('paddingRight')) || 0;
				var pBottom = parseInt($el.css('paddingBottom')) || 0;
				var cW = $el.width();
				var cH = $el.height();
				$r.find(SEL_METRICS_CONTENTS).css({
					top: bTop,
					left: bLeft,
					width: cW,
					height: cH,
					borderTop: pTop,
					borderLeft: pLeft,
					borderRight: pRight,
					borderBottom: pBottom,
					borderStyle: 'solid',
					borderColor: METRICS_PADDING_COLOR
				});
			},

			'{rootElement} elementSelect': function(context) {
				var elements = context.evArg.elements;

				for ( var i = 0, len = elements.length; i < len; i++) {
					var el = elements[i];

					var overlayRect = this._getOverlayRect(el);
					this._addOverlay(el, overlayRect, null, REGION_GROUP_SELECTED,
							HIGHLIGHT_TYPE_SELECTED);
				}
			},

			'{rootElement} elementUnselect': function(context) {
				var elements = context.evArg.elements;

				for ( var i = 0, len = elements.length; i < len; i++) {
					var el = elements[i];
					this._removeRegion(el, null, REGION_GROUP_SELECTED);
				}
			},

			_getResizeCursorStyle: function(edgePos) {
				if (!edgePos || edgePos === '' || edgePos === RANGE_IN || edgePos === RANGE_OUT) {
					return 'default';
				}
				return edgePos + '-resize';
			},

			'.pageVeil mousemove': function(context, $el) {
				this._lastPageX = context.event.pageX;
				this._lastPageY = context.event.pageY;

				if (this._draggingDirection) {
					//ドラッグ中（リサイズ中）はカーソルを変えない
					return;
				}

				var pageX = context.event.pageX;
				var pageY = context.event.pageY;

				var selectOverlay = this._getRegionAt(pageX, pageY, REGION_GROUP_SELECTED);

				if (!selectOverlay) {
					this.$find('.pageOverlay').css('cursor', 'default');
					this._disposeResizeTooltip();
					return;
				}

				var $selectRegion = selectOverlay.$region;

				var edgePos = getEdgePosition($selectRegion, pageX, pageY,
						hifive.editor.consts.OVERLAY_BORDER_WIDTH);

				var style = this._getResizeCursorStyle(edgePos);

				this.$find('.pageOverlay').css('cursor', style);

				if (edgePos === RANGE_IN) {
					this._disposeResizeTooltip();
					return;
				}

				this._showResizeTooltip();
				this._updateResizeTooltipMsg(context.event.ctrlKey, context.event.shiftKey);
			},

			_updateResizeTooltipMsg: function(ctrlKey, shiftKey) {
				var MSG_MOVE = '要素を移動します';
				var MSG_PADDING = 'paddingを調整します';
				var MSG_BORDER = 'borderを調整します';
				var MSG_MARGIN = 'marginを調整します';

				var popup = this._resizeTooltipPopup;

				if (!popup) {
					return;
				}

				//popupがあるということは、必ずリサイズ可能状態であるということ

				if (shiftKey === true && ctrlKey === true) {
					popup.setContents(MSG_BORDER);
					popup.show();
				} else if (shiftKey === true) {
					popup.setContents(MSG_PADDING);
					popup.show();
				} else if (ctrlKey === true) {
					popup.setContents(MSG_MARGIN);
					popup.show();
				} else {
					popup.hide();
				}
			},

			_resizeTooltipPopup: null,

			_disposeResizeTooltip: function() {
				if (this._resizeTooltipPopup) {
					this._resizeTooltipPopup.dispose();
					this._resizeTooltipPopup = null;
				}
			},

			_showResizeTooltip: function() {
				if (!this._resizeTooltipPopup) {
					this._resizeTooltipPopup = h5.ui.popupManager.createPopUp('resizeTooltip', {
						header: false,
						type: 'mouse'
					});
				}

				var popup = this._resizeTooltipPopup;
				popup.show();
			},

			_isFocusInPage: false,

			'{document} click': function(context) {
				//TODO FocusManagerを作るべきか
				if ($.contains(this.rootElement, context.event.target)) {
					this._isFocusInPage = true;
				} else {
					this._isFocusInPage = false;
				}
			},

			'{document} keydown': function(context) {
				if (!this._isFocusInPage) {
					return;
				}

				var code = context.event.keyCode;
				if (code === KEY_DELETE) {
					//deleteキー
					this._removeElements();
				}

				this._updateResizeTooltipMsg(context.event.ctrlKey, context.event.shiftKey);
			},

			'{document} keyup': function(context) {
				if (!this._isFocusInPage) {
					return;
				}

				this._updateResizeTooltipMsg(context.event.ctrlKey, context.event.shiftKey);
			},

			_getFocusElementRegion: function() {
				var focus = this._pageController.getFocusElement();
				var region = this._getRegionOf(focus);
				return region;
			},

			'.pageVeil h5trackstart': function(context) {
				var region = this._getRegionAt(context.event.pageX, context.event.pageY,
						REGION_GROUP_SELECTED);

				if (!region) {
					return;
				}

				var $region = region.$region;

				var edgePos = getEdgePosition($region, context.event.pageX, context.event.pageY,
						hifive.editor.consts.OVERLAY_BORDER_WIDTH);

				if (edgePos === RANGE_IN || edgePos === RANGE_OUT) {
					return;
				}

				this._beginResize(context, edgePos);
			},

			'.pageVeil h5trackmove': function(context, $el) {
				this._resizeElement(this._resizeLayoutContainer, context.event.dx,
						context.event.dy, this._draggingDirection);
			},

			'.pageVeil h5trackend': function(context, $el) {
				this._endResize();
			},

			_draggingDirection: null,

			_resizeContainer: null,

			_resizeMetrics: null,

			_beginResize: function(context, edgePos) {
				this._draggingDirection = edgePos;

				var shiftKey = context.event.shiftKey;
				var ctrlKey = context.event.ctrlkey;

				if (shiftKey === true && ctrlKey === true) {
					this._resizeMetrics = RESIZE_BORDER;
				} else if (shiftKey === true) {
					this._resizeMetrics = RESIZE_PADDING;
				} else if (ctrlKey === true) {
					this._resizeMetrics = RESIZE_MARGIN;
				} else {
					this._resizeMetrics = RESIZE_CONTENTS;
				}
			},

			/**
			 * @param layoutContainer
			 * @param sdx
			 * @param sdy
			 * @param direction
			 * @param type nullならwidth/height, 'padding', 'margin'
			 */
			_resizeElement: function(layoutContainer, sdx, sdy, direction, type) {
				if (!direction) {
					return;
				}

				var dx = 0,dy = 0;

				this.log.debug('dir={0},dx={1},dy={2}', direction, sdx, sdy);

				switch (direction.substr(0, 1)) {
				case 's':
					dy = sdy;
					break;
				case 'n':
					dy = -sdy;
					break;
				case 'w':
					dx = -sdx;
					break;
				case 'e':
					dx = sdx;
					break;
				}

				switch (direction.substr(1, 1)) {
				case 'e':
					dx = sdx;
					break;
				case 'w':
					dx = -sdx;
					break;
				}

				if (dx === 0 && dy === 0) {
					return;
				}

				var $focus = $(this._pageController.getFocusElement());

				var creator = null;

				var componentName = this._pageController.getComponentName($focus);
				if (componentName) {
					creator = getComponentCreator(componentName);
				}

				var operation = {
					dx: dx,
					dy: dy
				};

				if (creator && creator.resize) {
					var resizeResult = creator.resize(this._pageController.contentDocument,
							$focus[0], operation);
					if (resizeResult === false) {
						return;
					}
				} else {
					if (dx) {
						var currentW = $focus.width();
						$focus.width(currentW + dx);
					}

					if (dy) {
						var currentH = $focus.height();
						$focus.height(currentH + dy);
					}
				}


				this._pageController._triggerPageContentsChange();
			},

			_endResize: function() {
				this._draggingDirection = null;
			},

			'.pageVeil click': function(context) {
				//ベールをクリックされたということは、エディタの範囲外をクリックされたということなので
				//オーバーレイは閉じる
				this._pageController._closePopupOverlay('all');

				var component = this._getElement(context.event.pageX, context.event.pageY);

				var isExclusive = context.event.ctrlKey === false;

				if (this._pageController.isSelected(component)) {
					if (isExclusive) {
						this._pageController.select(component, true);
					} else {
						this._pageController.unselect(component);
					}
				} else if (component) {
					this._pageController.select(component, isExclusive);
				} else {
					this._pageController.unselectAll();
				}

				if (component) {
					this.trigger('showEditor', {
						element: component
					});
				}
			},

			'[href="#remove"] click': function(context) {
				//TODO ContextMenu改良後はselectMenuItemにする
				this._removeElements();

				return false;
			},

			_removeElements: function() {
				var elemToRemove = this._pageController.getSelectedElements().slice(0);

				for ( var i = 0, len = elemToRemove.length; i < len; i++) {
					var el = elemToRemove[i];

					this._pageController.removeComponent(el);
				}
			},

			'{rootElement} mouseup': function(context) {
				if (context.event.button !== 2) {
					//右クリック以外なら何もしない
					//TODO ContextMenuが改良されたらshowにする
					return;
				}

				var component = this._getElement(context.event.pageX, context.event.pageY);
				if (component) {
					this._pageController.focus(component, true);
				}
			},

			'.pageVeil touchstart': function(context) {
				var touch = context.event.originalEvent.touches[0];

				var component = this._getElement(touch.pageX, touch.pageY);
				if (component) {
					this._pageController.select(component, true);
				} else {
					this._pageController.deselectAll();
				}

				if (component) {
					this.trigger('showEditor', {
						element: component
					});
				}

				return false;
			},

			'{rootElement} pageViewChange': function() {
				var that = this;
				h5.ext.u.execSlippery('PageController_pageViewChange', function() {
					that._refresh();
				}, 30);
			},

			_refresh: function() {
				this._resizeOverlay();

				for ( var i = 0, len = this._regionOverlays.length; i < len; i++) {
					var overlay = this._regionOverlays[i];

					var el = overlay.element;
					var $region = overlay.$region;

					var rect = this._getOverlayRect(el);
					this._setRegionPos($region, rect);

					if (overlay.$region.hasClass('metrics')) {
						this._updateMetricsOverlay(overlay, rect);
					}
				}
			},

			_resizeOverlay: function() {
				var pageHtml = this._pageContainer.contentDocument
						&& this._pageContainer.contentDocument.documentElement;

				var pageBody = this._pageContainer.contentDocument
						&& this._pageContainer.contentDocument.body;

				if (!pageHtml || !pageBody) {
					return;
				}

				var pageCW = Math.min(pageHtml.clientWidth, pageBody.clientWidth);
				var pageCH = Math.min(pageHtml.clientHeight, pageBody.clientHeight);

				var htmlSW = pageHtml.scrollWidth;
				var htmlSH = pageHtml.scrollHeight;

				var outerW = $(this._pageContainer).width();
				var outerH = $(this._pageContainer).height();

				var w,h;
				if (pageCW <= outerW && htmlSW > outerW) {
					h = pageCH;
				} else {
					h = outerH;
				}

				if (pageCH <= outerH && htmlSH > outerH) {
					w = pageCW;
				} else {
					w = outerW;
				}

				//this.log.debug(
				//	'resizeOverlay: oW={6},oH={7},pcw={0},pch={1},psw={2},psh={3},w={4},h={5}',
				//	pageCW, pageCH, pageSW, pageSH, w, h, outerW, outerH);

				this.$find('.pageOverlay').css({
					width: w,
					height: h
				});
			},

			_isDrag: false,


			'{rootElement} libLoading': function(context) {
				$(this.rootElement).append(TMPL_LIB_LOADING);
			},

			'{rootElement} libLoadComplete': function(context) {
				$(this.rootElement).find('.status').remove();
			}

		//			'{body} h5trackmove': function(context) {
		//				if (!this._isDragging) {
		//					return;
		//				}
		//
		//				context.event.preventDefault();
		//
		//				hifive.editor.highlightDropTarget(context.event.pageX, context.event.pageY);
		//
		//				hifive.editor.u.moveElementBy(this._$dragProxy, context.event.dx, context.event.dy);
		//
		//				this.trigger('cancelPreview');
		//			},

		//			'{body} h5trackend': function(context) {
		//				if (!this._isDragging) {
		//					return;
		//				}
		//
		//				//ドロップターゲットのハイライトを消す
		//				hifive.editor.hideDropTarget();
		//
		//				this._isDragging = false;
		//
		//				var $removedDragProxy = this._$dragProxy.remove();
		//
		//				this._$dragProxy = null;
		//
		//				// TODO ドラッグを行う
		//
		//				var selected = this._pageController.getSelectedElements();
		//				if (selected.length === 0) {
		//					return;
		//				}

		//TODO touchの場合pageXYが入らない気がする。FW側で対応するか
		//				var target= this._getElement(context.event.pageX, context.event.pageY);
		//				this.log.debug('TARGET');
		//this.log.debug(target);
		//
		//				if(!target) {
		//					return;
		//				}
		//
		//				this._pageController.moveComponent(target, selected);


		// このチェックはdropされる側でやるべきか
		//				var dropTarget = document.elementFromPoint(context.event.pageX, context.event.pageY);
		//
		//				if (!$(dropTarget).is('.pageWrapper')
		//						&& $(dropTarget).parents('.pageWrapper').length === 0) {
		//					return;
		//				}
		//
		//				var componentId = $removedDragProxy.attr('data-editor-component-name');
		//				if (!componentId) {
		//					return;
		//				}
		//
		//				hifive.editor.dropComponent(componentId, context.event.pageX, context.event.pageY);
		//			}

		};
		h5.core.expose(manipulationController);
	})();



	function PageController() {

		var regionOverlayTemplate = '<div class="regionOverlay"></div>';

		var cellAreaTemplate = '<div class="cellArea"></div>';

		var $cellAreaIndicator = $('<div class="cellAreaIndicator"></div>');

		var pageController = {
			/**
			 * @memberOf hifive.editor.controller.PageController
			 */
			_editorController: null,

			_lastDbl: null,

			_pageContainer: null,

			_previewLogic: hifive.editor.logic.PreviewLogic,

			_manipController: hifive.editor.controller.page.ManipulationController,

			_CSSEditorController: hifive.editor.controller.CSSEditorController,

			_pageExportLogic: hifive.editor.logic.PageExportLogic,

			__name: 'hifive.editor.controller.PageController',

			_lastValidCustomCssText: '',

			_$pageOverlay: null,

			state: null,

			_lastComponentId: 0,

			__construct: function() {
				this.state = h5.core.data.createObservableItem({
					selectionMode: {
						type: 'enum',
						enumValue: [hifive.editor.consts.SELECTION_MODE_ELEMENT,
								hifive.editor.consts.SELECTION_MODE_COMPONENT,
								hifive.editor.consts.SELECTION_MODE_TEMPLATE],
						defaultValue: hifive.editor.consts.SELECTION_MODE_COMPONENT
					}
				});

				this.state.addEventListener('change', this.own(this.state_changeListener));
			},

			state_changeListener: function(event) {
				this.trigger(hifive.editor.consts.EVENT_STATE_CHANGE, {
					event: event
				});
			},

			__init: function() {
				this._$pageOverlay = this.$find('.pageOverlay');
				this._pageContainer = this.$find('.pageFrame')[0];
				this._manipController._pageContainer = this._pageContainer;
			},

			__ready: function() {

				this.view.register('cellArea', cellAreaTemplate);
				this.view.register('regionOverlay', regionOverlayTemplate);

				// this.$find(PAGE_VEIL).css('position', 'relative');
				$cellAreaIndicator.css('visibility', 'hidden').appendTo(
						this.$find('.editInfoOverlay'));

				var that = this;
				h5.u.obj.expose('hifive.editor', {
					dropComponent: function(id, pageX, pageY) {
						that._addComponent(id, pageX, pageY);
					},

					highlightDropTarget: function(pageX, pageY) {
						that._highlightDropTarget(pageX, pageY);
					},

					hideDropTarget: function() {
						that._hideDropTarget();
					}
				});

				// TODO
				this._editor = h5.core.controller('.editorRoot',
						hifive.editor.controller.GenericParameterEditController);
			},

			_clean: function() {
				this.unselectAll();
			},

			newPage: function(templateUrl, savePath) {

				this._clean();

				var indicator = this.indicator({
					target: this.rootElement,
					message: 'ページ読み込み中・・・',
					block: true
				}).show();

				var that = this;

				$(this._pageContainer)
						.one(
								'load',
								function() {
									that._addCustomStylesheet();

									//ページを離れる前に警告を出す
									var cssPromise = insertCss(this.contentDocument,
											hifive.editor.u
													.getAbsoluteSrcPath('h5editorPageStyles.css'),
											true);

									var promise = insertScript(this.contentDocument,
											hifive.editor.u
													.getAbsoluteSrcPath('preventPageUnload.js'),
											true);

									h5.async.when(promise, cssPromise).done(function() {
										that._triggerPageContentsChange();
										indicator.hide();
									});

									$(this.contentWindow).on('scroll',
											that.own(that._page_scrollListener));
								});

				this._pageContainer.src = templateUrl;
			},

			_page_scrollListener: function() {
				this._triggerPageViewChange();
			},

			exportPage: function(additionalScripts, additionalStylesheets) {
				var html = this._pageExportLogic.exportPage(this._pageContainer,
						this._lastValidCustomCssText, additionalScripts, additionalStylesheets);
				return html;
			},

			getTargetAtPoint: function(pageX, pageY) {
				var display = this._$pageOverlay.css('display');

				if (display !== 'none') {
					this._$pageOverlay.css('display', 'none');
				}

				var target = getTargetAtPoint(this._pageContainer, pageX, pageY);

				if (display !== 'none') {
					this._$pageOverlay.css('display', 'block');
				}

				return target;
			},

			_editor: null, // TODO

			_toRootPos: function(px, py) {
				var rx = px - $(this._pageContainer.contentWindow).scrollLeft()
						+ $(this._pageContainer).offset().left;
				var ry = py - $(this._pageContainer.contentWindow).scrollTop()
						+ $(this._pageContainer).offset().top;
				return {
					x: rx,
					y: ry
				};
			},

			_toPagePos: function(px, py) {
				var csx = px - $(this._pageContainer).offset().left;
				var csy = py - $(this._pageContainer).offset().top;
				return {
					x: csx,
					y: csy
				};
			},

			_getComponent: function(pageX, pageY) {
				if (!this._pageContainer) {
					return null;
				}
				var target = this.getTargetAtPoint(pageX, pageY);
				return target ? target.component : null;
			},

			_addComponent: function(componentId, pageX, pageY) {
				var selectionMode = this.state.get('selectionMode');
				var layoutTarget = getLayoutTarget(this._pageContainer, pageX, pageY, selectionMode);

				var creator = getComponentCreator(componentId);
				if (!creator) {
					this.log.warn('componentが見つからない。key={0}', componentId);
					return;
				}

				var view = creator.createView();

				var $view = $(view);
				$view.attr(DATA_COMPONENT, componentId);

				//TODO コンポーネントIDをdata()で持たせるかdata-*属性で持たせるかは要検討
				$view.data(DATA_COMPONENT_ID, this._lastComponentId++);


				var componentAtPoint = selectionMode === hifive.editor.consts.SELECTION_MODE_ELEMENT ? layoutTarget.cell
						: this._getComponent(pageX, pageY);

				if (!$.contains(layoutTarget.cell, componentAtPoint)) {
					componentAtPoint = null;
				}

				var loadLibPromise = this._loadLibraries(this._pageContainer.contentDocument,
						componentId);

				loadLibPromise.done(this.own(function() {
					layoutTarget.container.addComponent(this._pageContainer.contentWindow,
							layoutTarget.container, layoutTarget.cell, componentAtPoint, view,
							pageX, pageY);

				}));


				//				var appendable = (selectionMode === hifive.editor.consts.SELECTION_MODE_ELEMENT)
				//						&& isAppendable(componentAtPoint, $view[0]);
				//
				//				if (appendable) {
				//					componentAtPoint = layoutTarget.cell.lastChild;
				//				}
				//
				//				//element挿入の場合はcellとbeforeElementを同じにする
				//				layoutTarget.container.addComponent(this._pageContainer.contentWindow,
				//						layoutTarget.container, layoutTarget.cell, componentAtPoint, view, pageX,
				//						pageY);

				this._triggerPageContentsChange();
			},

			_loadLibraries: function(doc, creatorId) {
				var dfd = h5.async.deferred();
				var preexistings = {
					js: [],
					css: []
				};
				var replacePaths = [];
				$(doc.documentElement).find('[data-h5-module]').each(function() {
					var moduleSrc = this.getAttribute('data-h5-module');
					if (this.tagName.toUpperCase() === 'SCRIPT') {
						preexistings['js'].push(moduleSrc);
					} else if (this.tagName.toUpperCase() === 'LINK') {
						preexistings['css'].push(moduleSrc);
					} else {
						return;
					}
					if (this.getAttribute('data-h5-ignore') == null) {
						replacePaths.push(moduleSrc);
					}
				});

				// 追加で必要なソースを取得
				var resources = hifive.editor.u.getCreatorRequirements(creatorId, preexistings);

				// insertCss, jsを使ってリソースを追加する。
				var promises = [];
				for ( var i = 0, l = resources.css.length; i < l; i++) {
					var css = resources.css[i];
					css.each(function() {
						promises.push(insertCss(doc, this.getAttribute('href'), false, this
								.getAttribute(hifive.editor.consts.DATA_H5_MODULE)));
					});
				}
				for ( var i = 0, l = resources.js.length; i < l; i++) {
					var js = resources.js[i];
					js.each(function() {
						promises.push(insertScript(doc, this.getAttribute('src'), false, this
								.getAttribute(hifive.editor.consts.DATA_H5_MODULE)));
					});
				}

				this.trigger(hifive.editor.consts.EVENT_LIB_LOADING);

				h5.async.when(promises).done(this.own(function() {
					dfd.resolve();
					this.trigger(hifive.editor.consts.EVENT_LIB_LOAD_COMPLETE);
				}));

				return dfd.promise();
			},

			_highlightDropTarget: function(pageX, pageY) {
				var $pageVeil = this.$find(PAGE_VEIL);

				var pvOffset = $pageVeil.offset();

				var left = pvOffset.left;
				var top = pvOffset.top;
				var right = left + $pageVeil.width();
				var bottom = top + $pageVeil.height();

				this._hideDropTarget();

				if (!(left <= pageX && pageX <= right && top <= pageY && pageY <= bottom)) {
					return;
				}

				var target = getLayoutTarget(this._pageContainer, pageX, pageY);

				var pageContainerOffset = $(this._pageContainer).offset();

				//				this.log.debug('pCOff top={0},left={1}', pageContainerOffset.top,
				//						pageContainerOffset.left);

				var cell = target.cell;

				this.log.debug(cell);

				//ドロップ対象が0x0のサイズかもしれないので、単純にgetOverlayRect()してはいけない
				var dropCellSize = target.container.getDropCellSize(this._pageContainer,
						target.cell);
				var cw = dropCellSize.width;
				var ch = dropCellSize.height;

				//				var cw = $(cell).innerWidth();
				//				var ch = $(cell).innerHeight();

				var offpos = $(cell).offset();

				//				this.log.debug('offpos left={0},top={1}', offpos.left, offpos.top);

				var rootPos = this._toRootPos(offpos.left, offpos.top);

				//				this.log.debug('rootPos x={0},y={1}', rootPos.x, rootPos.y);

				var $target = $(this.view.get('cellArea'));

				this.$find('.editInfoOverlay').append($target);

				var ctop = rootPos.y - pageContainerOffset.top;
				var cleft = rootPos.x - pageContainerOffset.left;

				//				this.log.debug('cw={0},ch={1},ctop={2},cleft={3}', cw, ch, ctop, cleft);

				$target.css({
					width: cw,
					height: ch,
					top: ctop,
					left: cleft
				});
			},

			_hideDropTarget: function() {
				this.$find('.editInfoOverlay .cellArea').each(function() {
					$(this).remove();
				});
			},

			getComponentName: function(elem) {
				return $(elem).attr(DATA_COMPONENT);
			},

			_showEditor: function(root) {
				var componentName = this.getComponentName(root);
				if (!componentName) {
					return;
				}

				var creator = getComponentCreator(componentName);

				var schema = creator.createEditor; // TODO 関数かもしれない

				$('.editorRoot').addClass('in');

				this._editor.show($(root), schema);
			},

			'{window} resize': function() {
				h5.ext.u.execSlippery('PageController.window_resize', this
						.own(this._triggerPageViewChange), 200);
			},

			'{rootElement} showEditor': function(context) {
				this._showEditor(context.evArg.element);
			},

			'{document} closeEditor': function() {
				//TODO {document}はやめる。AppControllerによる制御にする。
				this._hideEditor();
			},

			'{document} toggleLivePreview': function() {
				this._isLive = !this._isLive;

				if (this._isLive) {
					this.$find('.editInfoOverlay,.pageVeil').css('visibility', 'hidden');
				} else {
					this.$find('.editInfoOverlay,.pageVeil').css('visibility', 'visible');
				}
			},

			'{document} boxSizeChange': function() {
				h5.ext.u.execSlippery('PageController.window_resize', this
						.own(this._triggerPageViewChange), 200);
			},

			_isLive: false,

			_hideEditor: function() {
				$('.editorRoot').removeClass('in');
			},

			_showGenericEditor: function(target) {
				var $genericEditor = this.$find('.genericEditor');
				$genericEditor.addClass('show');

				var that = this;

				if (!this._editorController) {
					// TODO injectionの仕組みが出来たらなんとかする
					h5.ext.loadController('c:GenericEditorController', $genericEditor).done(
							function(controller) {
								controller.setTarget(target);
								that._editorController = controller;
							});
				}
			},

			_hideGenericEditor: function() {
				if (this._editorController) {
					this._editorController.dispose();
				}
				this._editorController = null;

				var $genericEditor = this.$find('.genericEditor');
				$genericEditor.removeClass('show');
			},

			'{document} resizePageWindow': function(context) {
				// TODO
				var requestWindowSize = context.evArg;
				$(this.rootElement).width(requestWindowSize);
			},

			'* editorclose': function(context) {
				this.log.debug('editorclose');
				if (!this._editorController) {
					return;
				}
				this._hideGenericEditor();
			},

			getPage: function() {
				// TODO ページのロード処理もこのPageControllerでやるようにする。
				// TODO その上で、ロード時にPageを作るようにしてキャッシュしておく。
				return hifive.editor.model.createPage(this._pageContainer.contentWindow);
			},

			getPageContainer: function() {
				return this._pageContainer;
			},

			getWindow: function() {
				if (!this._pageContainer) {
					return null;
				}
				return this._pageContainer.contentWindow;
			},

			getDocument: function() {
				if (!this._pageContainer) {
					return null;
				}
				return this._pageContainer.contentDocument;
			},

			livePreview: function(flag) {
				if (flag === false) {
					this.$find('.pageOverlay').css('display', 'block');
					this._triggerPageViewChange();
				} else {
					this.$find('.pageOverlay').css('display', 'none');
				}
			},

			previewNewWindow: function() {
				var page = this.getPage();

				this._previewLogic.previewNewWindow(page);
			},

			removeComponent: function(elem) {
				var componentName = this.getComponentName(elem);

				if (!componentName) {
					this.log.debug('removeComponent: 指定された要素はコンポーネントではありません');
					return;
				}

				var creator = getComponentCreator(componentName);

				var isComplete = false;
				if (creator && creator.remove) {
					//TODO designData を渡す
					isComplete = creator.remove(elem);
				}

				if (isComplete !== true) {
					//isCompleteがtrueの場合、コンポーネントが
					//内部コントローラも含めて全責任を持って削除処理を行ったとみなす
					//TODO designDataも削除
					disposeControllers(elem);
					$(elem, this._pageContainer.contentDocument).remove();
				}

				this.unselect(elem);

				this._triggerPageContentsChange();
			},

			moveComponent: function(target, elements) {
				$(elements).each(function() {
					$el = $(this).remove();
					$(target).after($el);
				});

				this._triggerPageContentsChange();
			},

			_triggerPageContentsChange: function() {
				this.trigger(hifive.editor.consts.EVENT_PAGE_CONTENTS_CHANGE);
				this._triggerPageViewChange();
			},

			'{document} previewNewWindow': function() {
				this.previewNewWindow();
			},

			'{rootElement} mousewheel': function(context) {
				this._scrollPage(context);
			},

			_scrollPage: function(context) {
				var ev = context.event;

				var pageContainerScrTop = $(this._pageContainer.contentWindow).scrollTop();

				if (ev.wheelDelta > 0 && !pageContainerScrTop) {
					return;
				}

				ev.preventDefault();
				ev.stopPropagation();

				// originalEvent.wheelDeltaX/Yがあればそちらをみる。ないなら、ev.wheelDeltaをdyとして使用する。
				var dx = -ev.originalEvent.wheelDeltaX || 0;
				var dy = -ev.originalEvent.wheelDeltaY || -ev.wheelDelta;

				//scrollBy()を呼ぶと、contentWindowでscrollイベントが発生する。
				//そのイベントのリスナーがpageViewChangeイベントを発生させる。そのためここではtriggerしない。
				this._pageContainer.contentWindow.scrollBy(dx, dy);
			},

			_addCustomStylesheet: function() {
				// styleタグを追加して、追加したstyleSheetオブジェクトを取得する
				var idoc = this._pageContainer.contentDocument;
				var style = idoc.createElement('style');
				style.setAttribute(hifive.editor.consts.DATA_TEMPORARY, '');
				this._pageContainer.contentDocument.head.appendChild(style);
				this._customStylesheet = idoc.styleSheets[idoc.styleSheets.length - 1];
			},

			_applyCSS: function(cssObjArray) {
				var stylesheet = this._customStylesheet;

				if (!stylesheet) {
					// styleSheetがセットされていない(=ページロードされていない)
					// なら何もしない
					return;
				}
				// 現在適用中のスタイルを削除
				for ( var i = (stylesheet.rules || stylesheet.cssRules).length - 1; i >= 0; i--) {
					stylesheet.deleteRule ? stylesheet.deleteRule(i) : stylesheet.removeRule(i);
				}

				for ( var i = 0, l = cssObjArray.length; i < l; i++) {
					var cssObj = cssObjArray[i];
					var selector = cssObj.selector;
					var definitions = cssObj.definitions;
					var defStr;
					if (typeof definitions === 'string') {
						defStr = definitions;
					} else {
						defStr = '';
						for ( var j = 0, len = definitions.length; j < len; j++) {
							var propValObj = definitions[j];
							defStr += propValObj.key + ':' + propValObj.value + ';';
						}
					}

					if (stylesheet.insertRule) {
						if (cssObj.isNoBracketDesc) {
							stylesheet.insertRule(selector + ' ' + defStr, stylesheet.length);
						} else {
							stylesheet.insertRule(selector + '{' + defStr + '}', stylesheet.length);
						}
					} else {
						stylesheet.addRule(selector, defStr);
					}
				}

				this._triggerPageViewChange();
			},

			setCustomCss: function(cssText) {
				//パースに失敗すると例外が発生する
				var parseObj = hifive.editor.u.parseCSS(cssText);
				this._applyCSS(parseObj);

				this._lastValidCustomCssText = cssText;

				this._triggerPageContentsChange();
			},

			_selectedElements: [],

			isSelected: function(element) {
				return $.inArray(element, this._selectedElements) !== -1;
			},

			getSelectedElements: function() {
				return this._selectedElements;
			},

			_focused: null,

			getFocusElement: function() {
				return this._focused;
			},

			focus: function(element) {
				if (!this.isSelected(element)) {
					//非選択状態であれば自動的に選択状態に(追加)する
					this.select(element);
				}

				this._focused = element;

				this.trigger(hifive.editor.consts.EVENT_ELEMENT_FOCUS, {
					element: element,
					selectedElements: this._selectedElements
				});
			},

			/**
			 * _elemはプライベート
			 */
			unfocus: function(_elem) {
				if (!this._focused) {
					return;
				}

				var focused = this._focused;

				if (!_elem || (_elem === focused)) {
					this._focused = null;

					this.trigger(hifive.editor.consts.EVENT_ELEMENT_UNFOCUS, {
						element: focused,
						selectedElements: this._selectedElements
					});
				}
			},

			select: function(elements, isExclusive) {
				if (isExclusive !== false) {
					this.unselectAll();
				}

				if (!elements) {
					return;
				}

				var shouldRefocus = this._selectedElements.length === 0;

				var elems = hifive.editor.u.wrapInArray(elements);

				var actuals = [];

				for ( var i = 0, len = elems.length; i < len; i++) {
					var elem = elems[i];

					if (this.isSelected(elem)) {
						continue;
					}

					this._selectedElements.push(elem);
					actuals.push(elem);
				}

				if (actuals.length > 0) {
					this.trigger(hifive.editor.consts.EVENT_ELEMENT_SELECT, {
						elements: actuals,
						selectedElements: this._selectedElements
					});

					if (shouldRefocus) {
						this.focus(actuals[0]);
					}
				}
			},

			unselect: function(element) {
				//TODO element"s"で受け取れるようにする
				//イベントもelement"s"にして配列にする

				//TODO 要素がinnerHTML等で置換されていると正しくunselectできない


				if (this.isSelected(element)) {
					var idx = $.inArray(element, this._selectedElements);
					this._selectedElements.splice(idx, 1);

					this.unfocus(element);

					this.trigger(hifive.editor.consts.EVENT_ELEMENT_UNSELECT, {
						elements: [element],
						selectedElements: this._selectedElements
					});
				}
			},

			unselectAll: function() {
				this.unfocus();

				var unselected = this._selectedElements;

				this._selectedElements = [];

				this.trigger(hifive.editor.consts.EVENT_ELEMENT_UNSELECT, {
					elements: unselected,
					selectedElements: this._selectedElements
				});
			},

			_getSelectionMode: function() {
				return this.states.get('selectionMode');
			},

			/**
			 * param = { pageElement, offset = { x, y } または 'auto'(default), position = { x, y
			 * }(ページの左上を(0,0)とする) }
			 *
			 * @param group
			 * @param param
			 * @returns {___anonymous33757_33781}
			 */
			createOverlay: function(group, param) {
				//TODO 同一groupのオーバーレイが既にあったらそれをクローズして新しいポップアップを返す
				//groupが'all'の場合、全てのオーバーレイをキャンセルして新しいオーバーレイを出す

				this._closePopupOverlay(group);

				var $root = $(hifive.editor.consts.OVERLAY_ROOT).addClass(group);

				this.$find('.popupLayer').append($root);

				if (param && param.pageElement) {
					var rect = this._getPageElementRect(param.pageElement);

					$root.css({
						top: rect.y + rect.height,
						left: rect.x
					});
				}

				return {
					root: $root[0]
				};
			},

			_closePopupOverlay: function(group) {
				var $sameGroupPopup;

				if (group === 'all') {
					$sameGroupPopup = this.$find('.popupLayer > *');
				} else {
					$sameGroupPopup = this.$find('.popupLayer > .' + group);
				}

				if ($sameGroupPopup[0]) {
					$sameGroupPopup.each(function() {
						//同一グループのオーバーレイが存在する場合、コントローラを全てdisposeしたうえでルートを取り除く
						$(h5.core.controllerManager.getControllers(this, {
							deep: true
						})).each(function() {
							this.dispose();
						});

						$(this).remove();
					});
				}
			},

			/**
			 * ページ内要素のサイズ（Rect）を返します。 原点はページiframeの左上です。
			 *
			 * @param pageElem
			 * @returns
			 */
			_getPageElementRect: function(pageElem, includeMargin) {
				if (!pageElem) {
					return null;
				}

				var $pageElem = $(pageElem);

				var elemOffset = $pageElem.offset();

				var rootPos = this._toRootPos(elemOffset.left, elemOffset.top);
				var pageContainerOffset = $(this._pageContainer).offset();

				var ctop = rootPos.y - pageContainerOffset.top;
				var cleft = rootPos.x - pageContainerOffset.left;

				var cw = $pageElem.outerWidth();
				var ch = $pageElem.outerHeight();

				return {
					x: cleft,
					y: ctop,
					width: cw,
					height: ch
				};
			},

			isComponent: function(element) {
				var componentName = this.getComponentName(element);
				return componentName != null;
			},

			_triggerPageViewChange: function() {
				this.trigger(hifive.editor.consts.EVENT_PAGE_VIEW_CHANGE);
			},

			setHtml: function(element, html) {
				$(element).html(html);
				this._triggerPageContentsChange();
			}

		};

		return pageController;
	}

	$(function() {
		var c = PageController();
		h5.core.expose(c);
	});

	// h5.core.controller.define('hifive.editor.controller.PageController',
	// PageController);
})();
