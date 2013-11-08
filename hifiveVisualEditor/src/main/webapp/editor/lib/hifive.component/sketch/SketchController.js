$(function() {
	/**
	 * SketchController
	 *
	 * @name hifive.editor.controller.SketchController
	 * @namespace
	 */
	var sketchController = {

		/**
		 * コントローラ名
		 *
		 * @memberOf hifive.editor.controller.SketchController
		 */
		__name: 'hifive.editor.controller.SketchController',

		/**
		 * 太さ
		 *
		 * @memberOf hifive.editor.controller.SketchController
		 */
		lineWidth: 5,

		/**
		 * 色
		 *
		 * @memberOf hifive.editor.controller.SketchController
		 */
		lineColor: '#ff0000',

		/**
		 * 描画するかどうか.
		 *
		 * @memberOf hifive.editor.controller.SketchController
		 */
		drawFlag: true,

		/**
		 * 描画モード.
		 *
		 * @memberOf hifive.editor.controller.SketchController
		 */
		isDrawMode: true,

		'.sketch-canvas h5trackstart': function(context) {
			var mode = this.isDrawMode;
			var event = context.event;
			if (!mode) {
				event.preventDefault();
				return;
			}
			this.drawFlag = true;
		},

		'.sketch-canvas h5trackmove': function(context) {

			if (!this.drawFlag) {
				return;
			}
			this.draw(context.event);
		},

		'.sketch-canvas h5trackend': function(context) {
			this.drawFlag = false;
		},

		draw: function(event) {
			var canvas = event.target;
			var ctx = canvas.getContext('2d');
			var x = event.offsetX;
			var y = event.offsetY;
			ctx.strokeStyle = this.lineColor;
			ctx.lineWidth = this.lineWidth;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(x - event.dx, y - event.dy);
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		},

		img2Canvas: function(img, canvas, ctx) {
			return function() {
				var w = canvas.width;
				var h = canvas.height;
				var sw = img.width;
				var sh = img.height;

				var srcAspectRatio = sh / sw;
				var canvasAspectRatio = h / w;

				var dx,dy,dw,dh;
				if (canvasAspectRatio >= srcAspectRatio) {
					// canvasの方が横に長い場合
					dw = w;
					dh = w * srcAspectRatio;
					dx = 0;
					dy = (h - dh) / 2;
				} else {
					// canvasの方が縦に長い場合
					dh = h;
					dw = h / srcAspectRatio;
					dx = (w - dw) / 2;
					dy = 0;
				}

				ctx.drawImage(img, 0, 0, sw, sh, dx, dy, dw, dh);
			};
		}
	};
	h5.core.expose(sketchController);
});