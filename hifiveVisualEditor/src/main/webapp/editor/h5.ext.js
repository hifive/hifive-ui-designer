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
(function($) {

	var FW_MESSAGE_SAME_AUTO_RUN = 'registerAutoRun: このセレクタ・コントローラの組によるオートランは登録済みです。selector={0},controller={1}';

	var ERR_CODE_CONTROLLER_NAME_MISMATCH = -1;

	var ERR_CODE_ALIAS_NOT_FOUND = -1;

	var ERR_CODE_ALIAS_MISMATCH = -1;

	var PACKAGE_SEPARATOR = ':';

	var DATA_ATTR_CONTROLLER = 'data-h5-controller';

	var DATA_ATTR_CURRENT_BOUND = 'data-h5-current-bound';

	var fwLogger = h5.log.createLogger('h5.ext');

	var controllerDefFuncs = {};

	var isDocumentReady = false;

	var isScanReserved = false;

	var packageAliasMap = {};

	var FW_LOG_ALIAS_ALREADY_REGISTERED = 'このエイリアスは登録済みです。aliasName={0}, fullName={1}';

	var namespace = h5.u.obj.ns('h5.ext');

	// デフォルトの検索ベースはロードしたページのベースと同じ
	namespace.basePath = '.';

	function hasControllerDef(controllerName) {
		return controllerDefFuncs[controllerName] != null;
	}

	function getControllerDefFromFunc(controllerName) {
		var defFunc = controllerDefFuncs[controllerName].func;
		var controllerDefObj = defFunc();

		if (controllerDefObj.__name == null) {
			controllerDefObj.__name = controllerName;
		} else {
			if (controllerDefObj.__name !== controllerName) {
				// 戻り値にコントローラ名が書いてあった場合、コントローラ名と違ったら念のためエラー
				throwFwError(ERR_CODE_CONTROLLER_NAME_MISMATCH, {
					returnName: controllerDefObj.__name,
					requestName: controllerName
				});
			}
		}

		return controllerDefObj;
	}

	// TODO 不要？
	function getDir(path) {
		// TODO 脆弱性対策
		var lastSlash = path.lastIndexOf('/');
		return path.slice(0, lastSlash + 1);
	}

	function getResource(resourceName, pathSuffix) {
		var dfd = h5.async.deferred();

		var resource = h5.u.obj.getByPath(resourceName);
		if (resource !== undefined) {
			// 名前空間に存在した場合
			// TODO こっちが先でよいのか？？
			dfd.resolve(resource);
		} else {
			// TODO 脆弱性対策（絶対URLが渡される可能性等）
			var base = namespace.basePath[namespace.basePath.length - 1] === '/' ? namespace.basePath
					: namespace.basePath + '/';

			var loadPath = base + resourceName.replace(/\./g, '/') + pathSuffix;
			fwLogger.debug('リソースの動的ロードを開始します。パス={0}', loadPath);
			h5.u.loadScript(loadPath).done(
					function() {
						resource = h5.u.obj.getByPath(resourceName);
						if (resource !== undefined) {
							// ロードによってグローバルにコントローラが公開された場合
							fwLogger.debug('ロードが成功し、グローバルにリソースが公開されました。リソース={0}', resourceName);
							dfd.resolve(resource);
						} else {
							// ロードしてもダメだった
							fwLogger.error('ロードは成功しましたが、リソースが公開されませんでした。リソース={0}、パス={1}',
									resourceName, loadPath);
							dfd.reject(resourceName);
						}
					}).fail(function() {
				fwLogger.error('リソースをリモートから読み込めませんでした。パス={0}', loadPath);
				dfd.reject(resourceName);
			});
		}

		return dfd.promise();
	}

	// TODO getResource()とコード共通化
	function getController(controllerName) {
		var dfd = h5.async.deferred();

		var controller = h5.u.obj.getByPath(controllerName);
		if (controller) {
			// 名前空間に存在した場合
			// TODO こっちが先でよいのか？？
			dfd.resolve(controller);
		} else if (hasControllerDef(controllerName)) {
			// コントローラ定義として存在していた場合
			dfd.resolve(getControllerDefFromFunc(controllerName));
		} else {
			// TODO 脆弱性対策（絶対URLが渡される可能性等）
			var base = namespace.basePath[namespace.basePath.length - 1] === '/' ? namespace.basePath
					: namespace.basePath + '/';

			// force: trueとcache: trueは別にしたいところか
			var loadPath = base + controllerName.replace(/\./g, '/') + '.js';
			fwLogger.debug('コントローラの動的ロード：{0}', loadPath);
			h5.u.loadScript(loadPath).done(function() {
				controller = h5.u.obj.getByPath(controllerName);
				if (controller) {
					// ロードによってグローバルにコントローラが公開された場合
					fwLogger.debug('ロードしてグローバルにコントローラが公開されました：{0}', loadPath);
					dfd.resolve(controller);
				} else if (hasControllerDef(controllerName)) {
					// コントローラ定義として存在していた場合
					fwLogger.debug('ロードしてコントローラ定義が追加されました：{0}', loadPath);
					dfd.resolve(getControllerDefFromFunc(controllerName));
				} else {
					// ロードしてもダメだった
					fwLogger.error('ロードは成功しましたが、コントローラ定義オブジェクトを発見できませんでした：{0}', loadPath);
					dfd.reject(controllerName);
				}
			}).fail(function() {
				fwLogger.error('コントローラの動的ロードに失敗しました。コントローラ名：{0}', controllerName);
				dfd.reject(controllerName);
			});
		}

		return dfd.promise();
	}

	function loadController(controllerName, targetElement) {
		var dfd = h5.async.deferred();

		// TODO
		// ここでフルネーム化をもう一度やるべきかは要検討。現状は外からこのメソッドを直接使っているから、エイリアスを使いたくてやっているだけ
		controllerName = getFullname(controllerName);

		getController(controllerName).done(function(controller) {
			var instance = h5.core.controller(targetElement, controller);
			dfd.resolve(instance);
		}).fail(function() {
			fwLogger.warn('コントローラのロードに失敗しました。コントローラ名：{0}', controllerName);
			dfd.reject();
		});

		return dfd.promise();
	}

	function alreadyBound(controllerName, controllers) {
		for ( var i = 0, len = controllers.length; i < len; i++) {
			if (controllers[i].__name === controllerName) {
				return true;
			}
		}
		return false;
	}

	function reserveScan() {
		if (isScanReserved) {
			return;
		}
		isScanReserved = true;
		$(function() {
			isDocumentReady = true;
			isScanReserved = false;
			scan();
		});
	}

	var isAutoRunReserved = false;

	function reserveAutoRun() {
		if (isAutoRunReserved) {
			return;
		}
		isAutoRunReserved = true;
		$(function() {
			isAutoRunReserved = false;
			autoRun();
		});
	}

	function getFullname(controllerName) {
		if (controllerName.indexOf(PACKAGE_SEPARATOR) === -1) {
			return controllerName;
		}

		var tokens = controllerName.split(PACKAGE_SEPARATOR);

		var alias = tokens[0];
		var name = tokens[1];

		if (!packageAliasMap[alias]) {
			throwFwError(ERR_CODE_ALIAS_NOT_FOUND); // このエイリアスは登録されていない
		}

		return packageAliasMap[alias] + '.' + name;
	}

	function scan(rootElement, controllerName) {
		if (!isDocumentReady) {
			reserveScan();
			return;
		}

		var root = rootElement ? rootElement : document.body;
		$(root).find('[' + DATA_ATTR_CONTROLLER + ']').each(
				function() {
					var attrControllers = this.getAttribute(DATA_ATTR_CONTROLLER);

					var attrControllerNameList = attrControllers.split(',');

					for ( var i = 0, len = attrControllerNameList.length; i < len; i++) {
						var attrControllerName = getFullname($.trim(attrControllerNameList[i]));

						if (attrControllerName === '') {
							// trimした結果空文字になる場合は何もしない
							return true;
						}

						if (controllerName && attrControllerName !== controllerName) {
							// バインドしたいコントローラが指定されていて、その指定と異なっている場合は次を検索
							return true;
						}

						// 既に「同じ名前の」コントローラがバインドされていたら何もしない
						if (!alreadyBound(attrControllerName, h5.core.controllerManager
								.getControllers(this))) {
							// TODO
							// 一時しのぎ、getControllers()でバインド途中のコントローラも取得できるようにすべき
							if (!this.getAttribute(DATA_ATTR_CURRENT_BOUND)) {
								this.setAttribute(DATA_ATTR_CURRENT_BOUND, attrControllerName);
								loadController(attrControllerName, this);
							}

						}
					}
				});
	}

	function addController(controller, selector) {
	// TODO controllerをselector（通常クラス名）で自動インスタンス化する方法
	}

	function defineController(name, options, definitionFunc) {
		// TODO defFuncがPromiseを返したら、それがdoneされた後中に入っているオブジェクトをコントローラとみなすようにする
		// TODO DIの仕組みを取り入れるか

		if (arguments.length === 2) {
			definitionFunc = options;
			options = null;
		}

		controllerDefFuncs[name] = {
			opts: options,
			func: definitionFunc
		};

		var cdef = definitionFunc();
		cdef.__name = name;
		h5.core.expose(cdef);

		fwLogger.debug('defineController: コントローラ定義が追加されました。コントローラ名={0}', name);

		scan(null, name);
	}

	var autoRunList = [];

	function registerAutoRun(selector, feature) {
		for ( var i = 0, len = autoRunList.length; i < len; i++) {
			var auto = autoRunList[i];
			if (auto.selector === selector && auto.feature === feature) {
				fwLogger.debug(FW_MESSAGE_SAME_AUTO_RUN, selector, feature.__name);
				return;
			}
		}

		autoRunList.push({
			selector: selector,
			feature: feature
		});

		// 新たに登録された
		$(selector).each(function() {
			if ($.isFunction(feature)) {
				feature(this);
			} else {
				h5.core.controller(this, feature);
			}
		});
	}

	// autoRun: 関数が渡されていたらそれを実行、引数は対象要素。コントローラの場合はコントローラ化。
	function autoRun() {
		for ( var i = 0, len = autoRunList.length; i < len; i++) {
			var auto = autoRunList[i];
			var selector = auto.selector;
			var f = auto.feature;

			$(selector).each(function() {
				if ($.isFunction(f)) {
					f(this);
				} else {
					h5.core.controller(this, f);
				}
			});
		}
	}

	reserveAutoRun();

	h5.u.obj.expose('h5.ext', {
		scan: scan,
		loadController: loadController,
		autoRun: registerAutoRun
	});

	// TODO createScopedJquery() -> elemで絞ったjQueryを作る

	// TODO h5.core.controller.init();, .boot()?
	// コントローラ化はこっちにする？controller()は@Deprecated？

	function registerAlias(aliasName, fullName) {
		var currentName = packageAliasMap[aliasName];
		if (currentName != null && currentName !== fullName) {
			throwFwError(ERR_CODE_ALIAS_MISMATCH);
		}
		/* del begin */
		if (currentName === fullName) {
			fwLogger.info(FW_LOG_ALIAS_ALREADY_REGISTERED, aliasName, fullName);
		}
		/* del end */

		packageAliasMap[aliasName] = fullName;
	}

	h5.core.controller.registerAlias = registerAlias;

	h5.core.controller.define = defineController;

	// h5.u.obj.expose('h5.core', {
	// defineController: defineController
	// });

	// 初期ロード時に自動的にコントローラ化する
	reserveScan();

	/* **************** DIの仕組み **************** */

	/**
	 * デフォルトリゾルバは、そのキーに対応するURLを組み立ててスクリプトをロードし、そのスクリプトロード後は<br>
	 * 指定されたキーでグローバルにプロパティが公開されているとみなして値を返す。公開されていなかった場合は解決失敗とみなしrejectする。
	 * ただし、サフィックスを見てコントローラと判断される場合は、グローバルの代わりにコントローラ定義キャッシュに存在すれば解決成功とする。
	 */
	var defaultResolver = {
		canResolve: function(key) {
			return true;
		},

		resolve: function(key) {
			if (h5.u.str.endsWith(key, 'Controller')) {
				return getController(key);
			}
			return getResource(key, '.js');
		}
	};

	h5.settings.dependencyResolvers = [defaultResolver];

	// TODO h5組み込み後は不要
	function wrapInArray(val) {
		if ($.isArray(val)) {
			return val;
		}
		return [val];
	}

	function Dependency(keys) {
		this._keys = wrapInArray(keys);
	}
	$.extend(Dependency.prototype, {
		/**
		 * この依存関係が保持しているすべてのキーに対応するリゾルバがあるかどうかを返します。<br>
		 * リゾルバによる解決の結果、依存性を解決できない（resolve()で返されたPromiseがfailする）場合があることに注意してください。
		 */
		canResolve: function() {
			var resolvers = h5.settings.dependencyResolvers;
			var resolversLen = resolvers.length;

			for ( var i = 0, keyLen = this._keys.length; i < keyLen; i++) {
				var canResolve = false;

				for ( var j = 0; j < resolversLen; j++) {
					if (resolvers[j].canResolve(this._keys[i])) {
						canResolve = true;
						break;
					}
				}

				if (!canResolve) {
					return false;
				}
			}
			return true;
		},

		/**
		 * 依存性解決を行います。canResolve()がtrueを返している場合でも、解決に失敗する場合があることに注意してください。
		 */
		resolve: function() {
			if (!this.canResolve()) {
				// 依存性解決できない場合はただちにreject
				var rejectDfd = h5.async.deferred();
				rejectDfd.reject(); // FIXME commonFail
				return rejectDfd.promise();
			}

			var resolvers = h5.settings.dependencyResolvers;
			var resolversLen = resolvers.length;

			var resolveStates = [];

			for ( var i = 0, keyLen = this._keys.length; i < keyLen; i++) {
				var key = this._keys[i];

				for ( var j = 0; j < resolversLen; j++) {
					var resolver = resolvers[j];
					if (resolver.canResolve(key)) {
						resolveStates.push(resolver.resolve(key));
						break;
					}
				}
			}

			return h5.async.when(resolveStates).promise();
		}
	});

	function require(keys) {
		if (arguments.length > 1) {
			// 可変長で受け取った場合は配列化する
			throw new Error('配列じゃないとだめ'); //TODO
		}
		return new Dependency(keys);
	}

	h5.require = require;

})(jQuery);










/**
 * h5.ui
 */
(function($) {

	function parseHTML(str, context, keepScripts) {
		if ($.parseHTML) {
			return $.parseHTML(str, context, keepScripts)[0];
		}
		return $(str)[0];
	}

	function setCenter(target, base) {
		if (!base) {
			base = $('body');
		}
		base = $(base);

		var bw = base.width();
		var bh = base.height();

		var $target = $(target);

		var cw = $target.innerWidth();
		var ch = $target.innerHeight();

		var hMargin = (bw - cw) / 2;
		var vMargin = (bh - ch) / 2;

		$target.css({
			left: hMargin,
			top: vMargin
		});
	}

	var POPUP_TYPE_FOLLOW_MOUSE = 'mouse';

	var POPUP_HEADER = '<div class="popUpHeader"><h1></h1><div class="popUpCloseBtn btn btn-danger"><i class="icon-remove"></i></div></div>';
	var POPUP_CONTENTS = '<div class="popUpContents">';

	function popUpCloseBtn_clickHandler(event) {
		var popup = event.data;
		if (popup) {
			popup.dispose();
		}
	}

	function PopUp(rootElement, group, type, showHeader) {
		this.rootElement = rootElement;
		this.group = group;

		this._type = type;

		this._isShowing = false;

		var $root = $(rootElement);

		if (showHeader === true) {
			this.header = parseHTML(POPUP_HEADER);
			$root.append(this.header);
			// TODO この形式は1.6で動かない
			$root.one('click', '.popUpCloseBtn', this, popUpCloseBtn_clickHandler);
		}

		this.contents = parseHTML(POPUP_CONTENTS);
		$root.append(this.contents);

		this._controller = null;

		if (type === POPUP_TYPE_FOLLOW_MOUSE) {
			this._controller = h5.core.controller(this.rootElement, followMousePopupController, {
				position: 'tr'
			});
		}
	}
	$.extend(PopUp.prototype, {
		show: function() {
			if (this._isShowing) {
				return;
			}
			this._isShowing = true;

			$(this.rootElement).css('visibility', 'visible');
			this.refresh();
		},

		hide: function() {
			if (!this._isShowing) {
				return;
			}
			this._isShowing = false;

			$(this.rootElement).css('visibility', 'hidden');
		},

		dispose: function() {
			this.hide();

			// TODO 内部のコントローラを全てdisposeする
			// disposeでPromiseが返ってきたら、removeはdispose完了後にする。
			// 複数のコントローラがあるかもしれないので、h5.async.when()でまちあわせる。
			var controllers = h5.core.controllerManager.getControllers(this.rootElement, {
				deep: true
			});
			for ( var i = 0, len = controllers.length; i < len; i++) {
				controllers[i].dispose();
			}

			$(this.rootElement).remove();

			// リーク対策
			this.rootElement = null;
			this._controller = null;

			delete popUpGroupMap[this.group];
		},

		getSize: function() {
			var $root = $(this.rootElement);
			var w = $root.innerWidth();
			var h = $root.innerHeight();
			return {
				width: w,
				height: h
			};
		},

		setTitle: function(title) {
			$(this.header).find('h1').text(title);
		},

		setContentsSize: function(width, height) {
			$(this.contents).css({
				width: width,
				height: height
			});
		},

		setContents: function(contents) {
			$(this.contents).html(contents);
			if (this._isShowing) {
				this.refresh();
			}
		},

		refresh: function() {
			if (this._type === POPUP_TYPE_FOLLOW_MOUSE) {
				this._controller.refresh();
			} else {
				setCenter(this.rootElement);
			}
		}
	});


	//実行制御のマップ { キー: タイマーID }
	var execKeyMap = {};

	function execSlippery(key, func, delay, args) {
		var oldTid = execKeyMap[key];
		if (oldTid != null) {
			clearTimeout(oldTid);
		}

		execKeyMap[key] = setTimeout(function() {
			execKeyMap[key] = null;
			func.apply(null, args);
		}, delay);
	}

	h5.u.obj.expose('h5.ext.u', {
		execSlippery: execSlippery
	});


	/**
	 * { group: instance }
	 */
	var popUpGroupMap = {};

	var popupDefaultParam = {
		position: 'absolute',
		header: true,
		type: null
	};

	/**
	 * ポップアップを作成します。作成した時点では表示されません。<br>
	 * 同じグループのポップアップは同時に1つだけ存在 groupにポップアップグループ名を入れると、同じグループ
	 */
	function createPopUp(group, param) {
		var actualParam = $.extend({}, popupDefaultParam, param);

		// TODO styleはクラスに任せる？？ z-indexのマネジメントをどうするか。
		// いろんな人が「一番前」を主張すると、意図したようにならない

		var elem = $('<div class="h5PopUp">').css({
			position: actualParam.position,
			zIndex: 9999
		})[0];
		$(document.body).append(elem);
		var p = new PopUp(elem, group, actualParam.type, actualParam.header);

		// TODO isString()にする
		if (typeof group === 'string') {
			var lastPopUp = popUpGroupMap[group];
			if (lastPopUp) {
				lastPopUp.dispose();
			}
			popUpGroupMap[group] = p;
		}

		return p;
	}

	function getPopUp(group) {
		return popUpGroupMap[group];
	}

	h5.u.obj.expose('h5.ui.popupManager', {
		//TODO PopUp -> Popup
		createPopUp: createPopUp,
		getPopUp: getPopUp
	});


	// ==============================================
	// Popup Manager
	// ==============================================

	var FOLLOW_GAP_WIDTH_DEFAULT = 3;

	//TODO システム扱いにしてgetControllers()で取得されないようにするべき
	var followMousePopupController = {
		__name: 'h5.ext.ui.FollowMousePopupController',

		_$parent: null,

		_$target: null,

		_lastPageX: 0,

		_lastPageY: 0,

		_gap: FOLLOW_GAP_WIDTH_DEFAULT,

		__construct: function(context) {
			this._position = context.args.position || 'br';

			this._$parent = context.args.$parent;
			if (context.args.$target) {
				this._$target = context.args.$target;
			} else {
				this._$target = $(this.rootElement);
			}
			this._$target.css('position', 'absolute');
		},

		'{document} mousemove': function(context) {
			this._lastPageX = context.event.pageX;
			this._lastPageY = context.event.pageY;
			this.refresh();
		},

		refresh: function() {
			var px = this._lastPageX;
			var py = this._lastPageY;

			var gap = this._gap;

			if (this._position.indexOf('l') !== -1) {
				//上側に出す
				px -= this._$target.outerWidth();
				px -= gap;
			} else {
				px += gap;
			}

			if (this._position.indexOf('t') !== -1) {
				py -= this._$target.outerHeight();
				py -= gap;
			} else {
				py += gap;
			}

			this._$target.offset({
				top: py,
				left: px
			});
		}
	};

})(jQuery);