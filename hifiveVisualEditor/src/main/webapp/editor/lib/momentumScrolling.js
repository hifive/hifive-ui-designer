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
$(function(){

	var logger = h5.log.createLogger('MomentumScrollingController');

	var momentumScrollingController = {

		__name: 'h5.ui.MomentumScrollingController',

		step : 30,

		time : 30,

		onPC : false,

		INTERVAL : 50,

		DISTANCE : 5,

		type : null,

		_lastPos : null,

		_lastMove : {},

		_lastMoved : {},

		_scrollingBase : null,

		_endPos : {},

		_stop : null,

		__init: function(context){

			var root = $(this.rootElement);

			if(!this.type){
				if(root.hasClass('vertical')){
					this.type = 'vertical';
				}else if(root.hasClass('horizontal')){
					this.type = 'horizontal';
				}else{
					this.type = 'both';
				}
			}

			var onPC = root.hasClass('onPC') || this.onPC;

			if(!onPC && h5.env.ua.isDesktop){
				switch(this.type){
				case 'vertical':
					root.css('overflow-x', 'auto');
					break;
				case 'horizontal' :
					root.css('overflow-y', 'auto');
					break;
				case 'both' :
					root.css('overflow', 'auto');
					break;
				}
				return;
			}

			switch(this.type){
			case 'vertical':
				root.css('overflow-x', 'hidden');
				break;
			case 'horizontal' :
				root.css('overflow-y', 'hidden');
				break;
			case 'both' :
				root.css('overflow', 'hidden');
				break;
			}

			root.wrapInner($('<div/>').addClass('scrollingBase').css({
				position : 'relative',
				margin : 0,
				padding : 0,
				'border-style' : 'none',
				'background-color' : 'transparent'
			}));
			var scrollingBase = this._scrollingBase = root.children();

			var step = root.attr('data-step');
			if(step != undefined) this.step = parseInt(step);
			var time = root.attr('data-time');
			if(time != undefined) this.time = parseInt(time);

			this._relativize(root);
			this._relativize(scrollingBase);
		},

		_relativize: function(jqelm){
			var position = jqelm.css('position');
			if (position == 'static' || !position) {
				jqelm.css('position', 'relative');
				if (h5.env.ua.isOpera) {
					jqelm.css({
						'top' : 0,
						'left' : 0
					});
				}
			}
		},

		_getWHVal: function(jqelm, w_h){
			var position = jqelm.css('position');
			var visibility = jqelm.css('visibility');
			var display = jqelm.css('display');
			jqelm.css({
				position: 'absolute',
				visibility: 'hidden',
				display: 'block'
			});
			var value = jqelm[w_h]();
			jqelm.css({
				position: position,
				visibility: visibility,
				display: display
			});
			return value;
		},

		'> .scrollingBase h5trackstart' : function(context){
			/*
			if(context.event.target.tagName == 'A'){
				context.event.preventDefault();
				return;
			}
			*/
			var scrollingBase = this._scrollingBase;
			if(this._stop){
				this._stop.stop();
				this._stop = null;
			}
			var root = $(this.rootElement);
			this._lastPos = scrollingBase.position();
			switch(this.type){
			case 'vertical':
				_trackstart.call(this, 'vertical');
				break;
			case 'horizontal' :
				_trackstart.call(this, 'horizontal');
				break;
			case 'both' :
				_trackstart.call(this, 'vertical');
				_trackstart.call(this, 'horizontal');
				break;
			}

			function _trackstart(type){
				var w_h = (type == 'vertical') ? 'Width' : 'Height';
				var l_t = (type == 'vertical') ? 'left' : 'top';
				this._endPos[l_t] = -(this._getWHVal(scrollingBase, 'outer' + w_h) - root['inner' + w_h]());
			}
		},

		'> .scrollingBase h5trackmove' : function(context){

			switch(this.type){
			case 'vertical':
				_trackmove.call(this, 'vertical');
				break;
			case 'horizontal' :
				_trackmove.call(this, 'horizontal');
				break;
			case 'both' :
				_trackmove.call(this, 'vertical');
				_trackmove.call(this, 'horizontal');
				break;
			}

			this._lastMoveTime = new Date();

			function _trackmove(type){
				var l_t = (type == 'vertical') ? 'left' : 'top';
				var endLT = this._endPos[l_t];
				if(endLT > 0) return;
				var scrollingBase = this._scrollingBase;
				var move = (type == 'vertical') ? context.event.dx : context.event.dy;

				if(move == 0) return;

				var moved = this._lastPos[l_t] + move;
				if(moved > 0){
					moved = 0;
				}else if(moved < endLT){
					moved = endLT;
					if(this._lastMoved == endLT){
						//現時点では無効。
						context.event.preventDefault();
					}
				}
				scrollingBase.css(l_t, moved + 'px');
				this._lastPos = scrollingBase.position();
				this._lastMove[l_t] = move;
				this._lastMoved[l_t] = moved;
			}
		},

		'> .scrollingBase h5trackend' : function(context){
			var interval = (this._lastMoveTime) ? new Date().getTime() - this._lastMoveTime.getTime() : 0;
			if(interval < this.INTERVAL){
				var params = {};
				var scrollingBase = this._scrollingBase;
				var result = false;
				switch(this.type){
				case 'vertical':
					result = _trackend.call(this, 'vertical', params);
					break;
				case 'horizontal' :
					result = _trackend.call(this, 'horizontal', params);
					break;
				case 'both' :
					result = _trackend.call(this, 'vertical', params);
					var yResult = _trackend.call(this, 'horizontal', params);
					if(result === false || Math.abs(result) < Math.abs(yResult)) result = yResult;
					break;
				}

				if(result !== false){
					this._stop = animate(scrollingBase, params, {
						duration: result,
						easing: 'easeOutCubic'
					});
				}
			}
			this._clearProp();

			function _trackend(type, params){
				var l_t = (type == 'vertical') ? 'left' : 'top';
				var endLT = this._endPos[l_t];
				if(endLT > 0){
					return false;
				}
				var move = this._lastMove[l_t];
				if(Math.abs(move) < this.DISTANCE) return false;
				var scrollingBaseLT = this._scrollingBase.position()[l_t];
				var value = scrollingBaseLT + (move * this.step);
				var duration = this._adjustParams(type, value, params);
				return duration;
			}
		},

		_adjustParams: function(type, value, params){
			var l_t = (type == 'vertical') ? 'left' : 'top';
			var scrollingBaseLT = this._scrollingBase.position()[l_t];
			var endLT = this._endPos[l_t];
			value = this._adjust(type, value);
			logger.info('value:{0}', value);
			var duration = Math.abs((value - scrollingBaseLT) / this.step * this.time);
			if(value >= 0){
				value = 0;
				duration = Math.abs(scrollingBaseLT);
			}else if(value <= endLT){
				value = endLT;
				duration = Math.abs(endLT - scrollingBaseLT);
			}else{

			}
			params[l_t] = value + 'px';
			return duration;
		},

		_adjust: function(type, value){
			//拡張元で適宜オーバーライド
			return value;
		},

		_clearProp : function(){
			this._lastPos = null;
			this._endPos = {};
			this._lastMove = {};
			this._lastMoved = {};
			this._lastMoveTime = null;
		},

		moveTo: function(params){
			if(this._stop){
				this._stop.stop();
				this._stop = null;
			}

			var _params = $.extend(true, {}, params);
			var scrollingBase = this._scrollingBase;

			var result = false;
			switch(this.type){
			case 'vertical':
				result = _moveTo.call(this, 'vertical', _params);
				break;
			case 'horizontal' :
				result = _moveTo.call(this, 'horizontal', _params);
				break;
			case 'both' :
				result = _moveTo.call(this, 'vertical', _params);
				var yResult = _moveTo.call(this, 'horizontal', _params);
				if(result === false || Math.abs(result) < Math.abs(yResult)) result = yResult;
				break;
			}

			if(result !== false){
				this._stop = animate(this._scrollingBase, _params, {
					duration: result,
					easing: 'easeOutCubic'
				});
			}

			this._clearProp();

			function _moveTo(type, _params){
				var l_t = (type == 'vertical') ? 'left' : 'top';
				if(l_t in _params == false) return false;
				var w_h = (type == 'vertical') ? 'Width' : 'Height';
				var root = $(this.rootElement);
				var endLT = -(this._getWHVal(scrollingBase, 'outer' + w_h) - root['inner' + w_h]());
				if(endLT > 0){
					delete _params[l_t];
					return false;
				}
				this._endPos[l_t] = -(this._getWHVal(scrollingBase, 'outer' + w_h) - root['inner' + w_h]());
				var paramsLT = String(_params[l_t]);
				var match = paramsLT.match(/^([+-])=(-?\d+(?:\.\d*)?)/);
				if(match){
					var scrollingBaseLT = scrollingBase.position()[l_t];
					paramsLT = scrollingBaseLT + parseFloat(match[1] == '+' ? match[2] : '-' + match[2]);
				}else{
					paramsLT = parseFloat(_params[l_t]);
				}
				var duration = this._adjustParams(type, paramsLT, _params);
				return duration;
			}
		},

		'{window} resize' : function(){
		}
	};

//	$('.momentumScrollingBox').each(function(){
//		h5.core.controller(this, momentumScrollingController);
//	});

	h5.core.expose(momentumScrollingController);

	function animate(element, params, option){

		var _option = $.extend(true, {}, option);
		var easing = _option.easing;
		if(h5.env.ua.isIE){
			if(/^cubic-bezier/.test(easing)){
				_option.easing = 'swing';
			}else if(/^ease$|^ease-/.test(easing)){
				switch(easing){
				case 'ease-in':
					_option.easing = 'easeInQuad';
					break;
				case 'ease-out':
					_option.easing = 'easeOutQuad';
					break;
				case 'ease-in-out':
					_option.easing = 'easeInOutQuad';
					break;
				case 'ease':
				default:
					_option.easing = 'swing';
				}
			}
			element.stop().animate(params, _option);
		}else{
			var property = '';
			for(var key in params){
				element.css(key, element.css(key));
				if(property != '') property += ',';
				property += key;
			}

			var duration = _option.duration + 'ms';

			var easing = _option.easing;

			if(easing in animate.E_C){
				easing = animate.E_C[easing];
			}else if(easing != 'liner'){
				easing = 'swing';
			}

			element.css({
				'-webkit-transition-property': property,
				'-webkit-transition-duration': duration,
				'-webkit-transition-timing-function': easing,
				'-moz-transition-property': property,
				'-moz-transition-duration': duration,
				'-moz-transition-timing-function': easing,
				'-ms-transition-property': property,
				'-ms-transition-duration': duration,
				'-ms-transition-timing-function': easing,
				'-o-transition-property': property,
				'-o-transition-duration': duration,
				'-o-transition-timing-function': easing,
				'transition-property': property,
				'transition-duration': duration,
				'transition-timing-function': easing
			});
			element.css(params);
		}
		return {
			stop : function(){
				if(h5.env.ua.isIE){
					element.stop();
				}else{
					for(var key in params){
						element.css(key, element.css(key));
					}
					element.css({
						'-webkit-transition-property': '',
						'-webkit-transition-duration': '',
						'-webkit-transition-timing-function': '',
						'-moz-transition-property': '',
						'-moz-transition-duration': '',
						'-moz-transition-timing-function': '',
						'-ms-transition-property': '',
						'-ms-transition-duration': '',
						'-ms-transition-timing-function': '',
						'-o-transition-property': '',
						'-o-transition-duration': '',
						'-o-transition-timing-function': '',
						'transition-property': '',
						'transition-duration': '',
						'transition-timing-function': ''
					});
				}
			},
			stopToEnd : function(){
				if(h5.env.ua.isIE){
					element.css(params);
				}else{
					element.css({
						'-webkit-transition-property': '',
						'-webkit-transition-duration': '',
						'-webkit-transition-timing-function': '',
						'-moz-transition-property': '',
						'-moz-transition-duration': '',
						'-moz-transition-timing-function': '',
						'-ms-transition-property': '',
						'-ms-transition-duration': '',
						'-ms-transition-timing-function': '',
						'-o-transition-property': '',
						'-o-transition-duration': '',
						'-o-transition-timing-function': '',
						'transition-property': '',
						'transition-duration': '',
						'transition-timing-function': ''
					});
				}
			}
		};
	}

	animate.E_C = {
		'easeInSine':'0.47, 0, 0.745, 0.715',
		'easeOutSine':'0.39, 0.575, 0.565, 1',
		'easeInOutSine':'0.445, 0.05, 0.55, 0.95',
		'easeInQuad':'0.55, 0.085, 0.68, 0.53',
		'easeOutQuad':'0.25, 0.46, 0.45, 0.94',
		'easeInOutQuad':'0.455, 0.03, 0.515, 0.955',
		'easeInCubic':'0.55, 0.055, 0.675, 0.19',
		'easeOutCubic':'0.215, 0.61, 0.355, 1',
		'easeInOutCubic':'0.645, 0.045, 0.355, 1',
		'easeInQuart':'0.895, 0.03, 0.685, 0.22',
		'easeOutQuart':'0.165, 0.84, 0.44, 1',
		'easeInOutQuart':'0.77, 0, 0.175, 1',
		'easeInQuint':'0.755, 0.05, 0.855, 0.06',
		'easeOutQuint':'0.23, 1, 0.32, 1',
		'easeInOutQuint':'0.86, 0, 0.07, 1',
		'easeInExpo':'0.95, 0.05, 0.795, 0.035',
		'easeOutExpo':'0.19, 1, 0.22, 1',
		'easeInOutExpo':'1, 0, 0, 1',
		'easeInCirc':'0.6, 0.04, 0.98, 0.335',
		'easeOutCirc':'0.075, 0.82, 0.165, 1',
		'easeInOutCirc':'0.785, 0.135, 0.15, 0.86',
		'easeInBack':'0.6, -0.28, 0.735, 0.045',
		'easeOutBack':'0.175, 0.885, 0.32, 1.275',
		'easeInOutBack':'0.68, -0.55, 0.265, 1.55'
	};
});