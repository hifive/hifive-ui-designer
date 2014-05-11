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
$(function() {
	// 二重読み込み防止
	if (h5.u.obj.ns('h5.ui.container').HandwritingController) {
		return;
	}

	// キャンバスの保存先
	h5.u.obj.ns('hifive.editor.settings').fileStoreBase = '/hifiveVisualEditor/storage/files/temp/';
	// 保存URLになるこのページの名前
	var PAGE_NAME = location.href.substring(location.href.lastIndexOf('/')).match(/\/(.*)\..*/)[1];

	// fileStoreLogicが無かったら読み込む
	if (!h5.u.obj.ns('hifive.editor.logic').FileStoreLogic) {
		h5.u.loadScript('/hifiveVisualEditor/editor/src/hifive/editor/logic/FileStoreLogic.js', {
			async: false
		});
	}

	/**
	 * HandwritingController
	 *
	 * @name hifive.editor.controller.HandwritingController
	 * @namespace
	 */
	var handwritingController = {

		/**
		 * コントローラ名
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 */
		__name: 'hifive.editor.controller.HandwritingController',

		/**
		 * 太さ
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 */
		lineWidth: 5,

		/**
		 * 色
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 */
		lineColor: 'rgba(255,0,0,1)',

		/**
		 * 描画するかどうか.
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 */
		drawFlag: true,

		/**
		 * 描画モード.
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 */
		isDrawMode: true,

		$canvas: null,

		fileStoreLogic: hifive.editor.logic.FileStoreLogic,

		__ready: function(context) {
			var $body = $('body');
			var w = document.documentElement.clientWidth;
			var h = document.documentElement.clientHeight;

			// bodyを覆うようにキャンバスを追加
			this.$canvas = $('<canvas class="handwrite-canvas" width="' + w + '" height="' + h
					+ '" style="position:absolute;top:0;left:0;display:none;z-index:100"></canvas>');
			this.$canvas.css('background-color', 'rgba(255,255,255,0.4)');
			$body.append(this.$canvas);

			// canvasのcontextを覚えておく
			this.ctx = this.$canvas[0].getContext('2d');

			var that = this;
			// サーバーからキャンバスの画像データがあればダウンロード
			this.img2Canvas(PAGE_NAME + '.png').done(function() {
				that.log.debug('手書きメモをロードしました。');
			}).fail(function() {
				that.log.debug('このページについての手書きメモは作成されていません。');
			}).always(function() {
				// drowImageはデフォルトの合成モードでやりたいので、このタイミングでcanvasのglobal設定を行う。
				// 透明度を設定
				that.ctx.globalAlpha = 0.5;
				// 合成モードを設定
				that.ctx.globalCompositeOperation = 'xor';
			});

			// position:fixで上部にパネルを表示
			var $controlls = $('<div style="height:30px;position:fixed;top:0; right:0; top: 0; padding:5px; z-index:101"></div>');
			$controlls
					.append('<button class="clear-canvas" style="display:none; margin:10px; padding:5px">クリア</button>'
							+ '<button class="close-canvas" style="display:none; margin:10px; padding:5px">保存して閉じる</button>'
							+ '<button class="open-canvas" style="display:inline-block; margin:10px; padding:5px">メモ</button>');
			$body.append($controlls);
		},

		/**
		 * キャンバスを開くボタン
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 * @param context
		 */
		'.open-canvas click': function(context, $target) {
			$('.handwrite-canvas').css('display', 'block');
			$('.open-canvas').css('display', 'none');
			$('.close-canvas').css('display', 'inline-block');
			$('.clear-canvas').css('display', 'inline-block');
		},

		/**
		 * 保存して閉じるボタン
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 * @param context
		 */
		'.close-canvas click': function(context, $target) {
			this.saveCanvas().done(function() {
				$('.handwrite-canvas').css('display', 'none');
				$('.close-canvas').css('display', 'none');
				$('.clear-canvas').css('display', 'none');
				$('.open-canvas').css('display', 'inline-block');
			});
		},

		/**
		 * クリアボタン
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 * @param context
		 */
		'.clear-canvas click': function(context, $target) {
			this.clearCanvas();
		},

		/**
		 * キャンバスの画像を削除
		 */
		clearCanvas: function() {
			var w = this.$canvas[0].width;
			var h = this.$canvas[0].height;
			this.ctx.clearRect(0, 0, w, h);
		},

		/**
		 * キャンバスの画像をアップロードする
		 *
		 * @memberOf hifive.editor.controller.HandwritingController
		 * @returns
		 */
		saveCanvas: function() {
			return this.fileStoreLogic
					.uploadBase64(PAGE_NAME + '.png', this.$canvas[0].toDataURL());
		},

		'.handwrite-canvas h5trackstart': function(context) {
			var mode = this.isDrawMode;
			var event = context.event;
			if (!mode) {
				event.preventDefault();
				return;
			}
			this.drawFlag = true;
		},

		'.handwrite-canvas h5trackmove': function(context) {
			if (!this.drawFlag) {
				return;
			}
			this.draw(context.event);
		},

		'.handwrite-canvas h5trackend': function(context) {
			this.drawFlag = false;
		},

		draw: function(event) {
			var ctx = this.ctx;
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

		img2Canvas: function(path) {
			var dfd = h5.async.deferred();
			var ctx = this.ctx;
			var img = new Image();
			img.src = path;
			img.onload = function() {
				// 画像は拡縮せずに、(0,0)の位置から描画する
				ctx.drawImage(img, 0, 0);
				dfd.resolve();
			};
			img.onerror = function(e) {
				dfd.reject(e);
			};
			return dfd.promise();
		}
	//		,
	//
	//		fixController: fixController,
	//		__importHandlers: ['fixController']
	};
	h5.core.controller('body', handwritingController);
});