$(function() {

	var logger = h5.log.createLogger('DivideBoxController');

	var dividedBoxController = {

		__name: 'h5.ui.DivideBoxController',

		_dividerPos: {
			left: 0.5,
			top: 0.5
		},

		_type: null,

		_prev: null,

		_prevStart: null,

		_next: null,

		_nextEnd: null,

		_root: null,

		_lastParentInnerWH: null,

		_l_t: '',

		_w_h: '',

		_lastPos: null,

		__init: function(context) {
			var root = this._root = $(this.rootElement);
			var type = this._type = root.hasClass('horizontal') ? 'y' : 'x';

			var w_h = this._w_h = (type == 'x') ? 'width' : 'height';
			var l_t = this._l_t = (type == 'x') ? 'left' : 'top';

			root[w_h](root[w_h]());

			this._lastParentInnerWH = (type == 'x') ? root.innerWidth() : root.innerHeight();

			var pcp = root.css('position');

			if (pcp == 'static' || !pcp) {
				root.css('position', 'relative');
				if (h5.env.ua.isOpera) {
					root.css({
						'top': 0,
						'left': 0
					});
				}
			}

			var that = this;
			$(this.$find('> .divider').get().reverse()).each(
					function() {
						var divider = $(this);
						var prev = divider.prev();
						var next = divider.next();
						prev[w_h](prev[w_h]());
						next[w_h](next[w_h]());
						if (type == 'y')
							next.width(next.width());
						next.css({
							top: next.position().top + 'px',
							left: next.position().left + 'px',
							position: 'absolute'
						});
						divider[w_h](divider[w_h]);
						if (type == 'y')
							divider.width(divider.width());
						var pos = divider.position();
						divider.css({
							cursor: (type == 'x') ? 'col-resize' : 'row-resize',
							top: pos.top + 'px',
							left: pos.left + 'px',
							position: 'absolute'
						});
						var dividerHandler = $('<div class="dividerHandler"></div>');
						divider.append(dividerHandler);
						var border = parseInt(dividerHandler.css('border-left-width'));
						dividerHandler.css({
							position: 'absolute',
							top: Math.round((divider.height() - dividerHandler.height())
									* that._dividerPos.top - border)
									+ 'px',
							left: Math.round((divider.width() - dividerHandler.width())
									* that._dividerPos.left - border)
									+ 'px'
						});
					});
		},

		'> .divider h5trackstart': function(context) {
			var l_t = this._l_t;
			var w_h = this._w_h;
			var divider = $(context.event.currentTarget);
			var prev = divider.prev();
			var next = divider.next();
			this._lastPos = divider.position();
			this._prevStart = prev.position()[l_t];
			this._nextEnd = next.position()[l_t] + next[w_h]() - divider[w_h]();
		},

		'> .divider h5trackmove': function(context) {
			var divider = $(context.event.currentTarget);
			var l_t = this._l_t;
			var move = (l_t == 'left') ? context.event.dx : context.event.dy;
			if (move == 0)
				return;
			this._move(move, divider, this._prevStart, this._nextEnd, this._lastPos);
			this._lastPos = divider.position();
		},

		_move: function(move, divider, prevStart, nextEnd, lastPos) {
			if (move == 0)
				return;
			var l_t = this._l_t;
			var w_h = this._w_h;
			var prev = divider.prev();
			var next = divider.next();
			var moved = lastPos[l_t] + move;
			//要検証。+1しないと親要素外にドラッグできてしまう。
			//logger.info('moved:' + moved + ', prevStart:' + prevStart);
			if (moved <= prevStart + 1) {
				move = prevStart - lastPos[l_t];
				if (move <= -1)
					return;
			} else if (moved >= nextEnd - 1) {
				move = nextEnd - lastPos[l_t];
				if (move >= 1)
					return;
			}

			var prevWH = prev[w_h]() + move;
			if (prevWH < 0) {
				prevWH = 0;
				move = -prev[w_h]();
			}

			var nextWH = next[w_h]() - move;
			if (nextWH < 0)
				nextWH = 0;

			moved = lastPos[l_t] + move;

			divider.css(l_t, moved + 'px');
			next[w_h](nextWH);
			prev[w_h](prevWH);
			next.css(l_t, (next.position()[l_t] + move) + 'px');

			/*
			var allMove = (divider.data('allMove') || 0) + move;
			var transform = (this._type == 'x' ? 'translateX' : 'translateY') + '(' + allMove + 'px)';
			divider.css({
				'-moz-transform': transform,
				'-webkit-transform' : transform,
				'-o-transform' :  transform,
				'transform' :   transform
			});
			next.css({
				'-moz-transform': transform,
				'-webkit-transform' : transform,
				'-o-transform' :  transform,
				'transform' :   transform
			});

			divider.data('allMove', allMove);
			*/
		},

		'> .divider h5trackend': function(context) {
			this._lastPos = null;
			this._prevStart = null;
			this._nextEnd = null;
		},

		'{window} resize': function() {
			var type = this._type;
			var root = this._root;
			var innerWH = (type == 'x') ? root.innerWidth() : root.innerHeight();
			var that = this;
			var dividerArray = this.$find('> .divider');
			dividerArray
					.each(function(index, domEle) {
						var l_t = that._l_t;
						var w_h = that._w_h;

						var divider = $(this);
						var prev = divider.prev();
						var next = divider.next();

						var dividerLT = divider.position()[l_t];
						var per = dividerLT / that._lastParentInnerWH;
						var padding = (root.css('padding-' + l_t).match(/\d+/) || [0])[0];
						var nextDivideLT = Math.round(innerWH * per);
						var move = nextDivideLT - dividerLT;

						var prevStart = prev.position()[l_t];
						var nextEnd = innerWH - padding - divider[w_h]();
						var lastPos = divider.position();

						that._move(move, divider, prevStart, nextEnd, lastPos);

						if (index == dividerArray.length - 1) {
							next[w_h](innerWH - next.position()[l_t] - padding);
						} else {
							next[w_h]($(dividerArray.get(index + 1)).position()[l_t]
									- next.position()[l_t]);
						}

						if (type == 'y') {
							divider.width(prev.width());
							next.width(prev.width());
						}

						var dividerHandler = divider.children('.dividerHandler');
						var border = parseInt(dividerHandler.css('border-left-width'));
						dividerHandler.css({
							position: 'absolute',
							top: Math.round((divider.height() - dividerHandler.height()) / 2
									- border)
									+ 'px',
							left: Math.round((divider.width() - dividerHandler.width()) / 2
									- border)
									+ 'px'
						});
					});

			this._lastParentInnerWH = innerWH;
		}
	};
	h5.core.expose(dividedBoxController);

//	$('.dividedBox').each(function() {
//		h5.core.controller(this, dividedBoxController);
//	});
});