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

	var EVENT_SCROLL_CONTENT_WINDOW = 'scrollContentWindow';

	var GRID_CELL_HEIGHT = 20;

	//	var GRID_CELL_WIDTH = 20;

	function createSvgLine() {
		var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		return line;
	}

	function CellRegion(parentElement) {
		this.parentElement = parentElement;

		this.$root = $('<div class="cellRegionRoot"></div>');

		this.sx = 0;
		this.sy = 0;
		this.ex = 0;
		this.ey = 0;
	}
	$.extend(CellRegion.prototype, {
		setCellRegion: function(startX, startY, endX, endY) {
			this.sx = startX;
			this.sy = startY;
			this.ex = endX;
			this.ey = endY;
		},

		show: function() {

		},

		hide: function() {

		},

		_refresh: function() {

		}
	});


	var bootstrap2ManipulationController = {
		__name: 'hifive.editor.controller.Bootstrap2ManipulationController',

		_pageController: null,

		_pageContainer: null,

		_selectStartCell: null,

		_selectCellRegion: null,

		_toGridPos: function(pageX, pageY) {
			$root = $(this.rootElement);

			var offset = $root.offset();

			var ret = {
				x: pageX - offset.left,
				y: pageY - offset.top
			};
			return ret;
		},

		_getCellAt: function(pageX, pageY) {
			var $pageWindow = $(this.pageContainer.contentWindow);

			var scrTop = $pageWindow.scrollTop();
			var gridPos = this._toGridPos(pageX, pageY);

			var gridY = gridPos.y;

			//0-origin
			var cellY = Math.floor((scrTop + gridY) / GRID_CELL_HEIGHT);

			var pageBody = this._pageContainer.contentDocument
					&& this._pageContainer.contentDocument.body;

			var pageCW = pageBody.scrollWidth; //Math.max(pageHtml.clientWidth, pageBody.clientWidth);

			var NUM_DIVIDE = 12; //for Bootstrap

			var cellWidth = pageCW / NUM_DIVIDE;

			var scrLeft = $pageWindow.scrollLeft();
			var gridX = gridPos.x;

			//0-origin
			var cellX = Math.floor((scrLeft + gridX) / cellWidth);

			var ret = {
				x: cellX,
				y: cellY
			};
			return ret;
		},

		'.pageVeil h5trackstart': function(context) {
			var px = context.event.pageX;
			var py = context.event.pageY;

			var cell = this._getCellAt(px, py);

			this._selectStartCell = cell;
		},

		'.pageVeil h5trackmove': function(context) {
			var px = context.event.pageX;
			var py = context.event.pageY;

			var cell = this._getCellAt(px, py);

		},

		'.pageVeil h5trackend': function(context) {

		},

		_createCellRegion: function() {

		}
	};
	h5.core.expose(bootstrap2ManipulationController);


	/**
	 * @class
	 * @name BootstrapGridLayoutController
	 */
	var bootstrapGridLayoutController = {
		/**
		 * @memberOf hifive.editor.controller.BootstrapGridLayoutController
		 */
		__name: 'hifive.editor.controller.BootstrapGridLayoutController',

		_manipulationController: hifive.editor.controller.Bootstrap2ManipulationController,

		_pageContainer: null,

		_pageController: null,

		__ready: function() {
			this._pageController = this.rootController;
			this._pageContainer = this._pageController._pageContainer;

			this._manipulationController._pageController = this._pageController;
			this._manipulationController._pageContainer = this._pageContainer;

			this._refreshGrid();
		},

		_refreshGrid: function() {
			var $container = $(this._pageContainer.contentWindow);

			var scrTop = $container.scrollTop();
			var scrLeft = $container.scrollLeft();

			var $gridWrapper = this.$find('.gridLayer');
			var gridHeight = $gridWrapper.height();
			var gridWidth = $gridWrapper.width();

			var grid = this.$find('.gridLayer .grid')[0];

			$(grid).empty();

			//横罫線
			for ( var i = GRID_CELL_HEIGHT - (scrTop % GRID_CELL_HEIGHT); i < gridHeight; i += GRID_CELL_HEIGHT) {
				var line = createSvgLine();

				line.setAttribute('class', 'bootstrapGridLine');
				line.setAttribute('x1', 0);
				line.setAttribute('x2', gridWidth);
				line.setAttribute('y1', i);
				line.setAttribute('y2', i);

				grid.appendChild(line);
			}

			//			var pageHtml = this._pageContainer.contentDocument
			//					&& this._pageContainer.contentDocument.documentElement;

			var pageBody = this._pageContainer.contentDocument
					&& this._pageContainer.contentDocument.body;

			var pageCW = pageBody.scrollWidth; //Math.max(pageHtml.clientWidth, pageBody.clientWidth);

			var NUM_DIVIDE = 12; //for Bootstrap

			var cellWidth = pageCW / NUM_DIVIDE;

			var hOffset = parseInt(scrLeft % cellWidth);

			for ( var i = 1; i < NUM_DIVIDE; i++) {
				var line = createSvgLine();

				line.setAttribute('class', 'bootstrapGridLine');
				line.setAttribute('x1', i * cellWidth - hOffset);
				line.setAttribute('x2', i * cellWidth - hOffset);
				line.setAttribute('y1', 0);
				line.setAttribute('y2', gridHeight);

				grid.appendChild(line);
			}

			//縦罫線
			//			for(var i = GRID_CELL_WIDTH - (scrLeft % GRID_CELL_WIDTH); i < gridWidth ; i += GRID_CELL_WIDTH) {
			//				var line = createSvgLine();
			//
			//				line.setAttribute('class', 'bootstrapGridLine');
			//				line.setAttribute('x1', i);
			//				line.setAttribute('x2', i);
			//				line.setAttribute('y1', 0);
			//				line.setAttribute('y2', gridHeight);
			//
			//				grid.appendChild(line);
			//			}
		},

		/**
		 * iframeの中がスクロールした
		 */
		'{rootElement} pageViewChange': function() {
			this._refreshGrid();
		}
	};

	h5.core.expose(bootstrapGridLayoutController);

})();
