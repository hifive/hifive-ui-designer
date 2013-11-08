(function() {
	var DATA_COMPONENT = hifive.editor.consts.DATA_COMPONENT;
	var DATA_H5_MODULE = hifive.editor.consts.DATA_H5_MODULE;

	//documentのスクロール量を取得する。
	function getDocumentScrollTop(doc) {
		//webkit -> body, others -> documentElement
		return doc.documentElement.scrollTop || doc.body.scrollTop;
	}

	function getDocumentScrollLeft(doc) {
		return doc.documentElement.scrollLeft || doc.body.scrollLeft;
	}

	/**
	 * @memberOf hifive.editor.u
	 */
	function getDocumentScrollPos(doc) {
		return {
			top: getDocumentScrollTop(doc),
			left: getDocumentScrollLeft(doc)
		};
	}


	//スマートデバイス・タブレットの場合はCSS Transform、それ以外はleft,topで動かす
	function moveElementBy(element, dx, dy) {
		var $element = $(element);

		//		if (h5.env.ua.isSmartPhone || h5.env.ua.isTablet) {
		//			//スマートフォン、タブレット端末の場合はCSS Transformを使用
		//			var x = lastTranslatePos.x + dx;
		//			var y = lastTranslatePos.y + dy;
		//
		//			lastTranslatePos.x = x;
		//			lastTranslatePos.y = y;
		//
		//			$target.css('-webkit-transform', h5.u.str.format('translate({0}px,{1}px)', x, y));
		//		} else {

		var currentPos = $element.position();
		//それ以外（PCを想定）はleft,topで移動
		$element.css({
			left: currentPos.left + dx,
			top: currentPos.top + dy
		});

		//		}
	}

	// CSS文字列のパース
	function parseCSS(str) {
		// コメント除去、trim
		str = $.trim(str.replace(/\/\*[\s\S]*?\*\//g, ''));
		var ret = [];
		var selector = '';
		var w;
		var i = 0;
		// 文字列をスキャン。quot('または")が出てくるまで読んだ文字列を、quotで囲って返す。
		// quotが出てくるまでポインタを進めるが、\'や\"と書かれていた場合は、そこで終了しない。
		function scanString(quot) {
			var ret = '';
			// 文字列内('や"で囲まれた場所)をパース
			// 文字列内はスルー
			var escape = false;
			while ((w = str[i++]) !== quot || escape) {
				if (w == null) {
					throw {
						result: ret,
						str: str,
						message: quot + 'がありません。文字列記述が閉じられていません'
					};
				}
				ret += w;
				if (w === '\\') {
					// \なら次の文字はquotと比較しない
					// \を\でエスケープ(\\)にしていた場合はescape状態を元に戻す
					// (\が出てきた時点でescape状態なら解除、escape状態でないならescape状態にする)
					escape = !escape;
				} else {
					escape = false;
				}
			}
			return quot + ret + quot;
		}

		// スタイルの値(hoge:xxx;のxxxの部分)を取得する関数
		function parseStyleValue() {
			var val = '';
			while (w = str[i++]) {
				// w == nullならエラー("}"にたどり着く前に文字列が終わってるので)
				if (w == null) {
					throw {
						result: ret,
						str: str,
						message: selector + 'のスタイル定義にエラーがあります。閉じ括弧がありません。'
					};
				}
				// 文字列記述開始なら文字列終わりまで飛ばす
				if (w === '"' || w === "'") {
					val += scanString(w);
				} else if (w === ';' || w === '}') {
					// ;か}が出てきたら終了
					return $.trim(val);
				} else {
					val += w;
				}
			}
		}

		// @規則のパース(@import, @media screen 等)
		// @import url("a.css"); なら{selector: '@import', definition:'url("a.css")'}
		// @media screen (max-width="980px") { hoge{} fuga{} }なら、
		// {selector:'@media screen (max-width="980px")', definition:'hoge{} fuga{}'}
		function parseAtMarkRule() {
			var buf = '';
			var selector = null;
			var definitions = null;
			// ;までの文字列を値の記述部分にしているか。(括弧記法ならfalse)
			var isNoBracketDesc = false;
			// ここに来た時点でのwはw==='@'
			while (w = str[i++]) {
				if (w === '"' || w === "'") {
					buf += scanString(w);
				} else if (w === '{') {
					// 中括弧開始があれば、そこから対応する閉じ括弧までパース
					selector = '@' + buf;
					definitions = '';
					var nest = 0;
					while (w = str[i++]) {// 文字列記述開始なら文字列終わりまで飛ばす
						if (w === '"' || w === "'") {
							definitions += scanString(w);
						} else if (w === '}') {
							if (nest) {
								nest--;
							} else {
								// ネストされた中括弧閉じじゃなければパース終了
								break;
							}
							definitions += w;
						} else if (w === '{') {
							// ネスト数追加
							nest++;
							definitions += w;
						} else if (w === '"' || w === "'") {
							definitions += scanString(w);
						} else {
							definitions += w;
						}
					}
					break;
				} else if (w === ';') {
					// セミコロンがあればbufからセレクタと記述部分に分割する
					var ary = buf.match(/(^.*?)\s(.*$)/);
					selector = '@' + ary[1];
					definitions = ary[2];
					isNoBracketDesc = true;
					break;
				} else {
					buf += w;
				}
			}
			if (!selector || !definitions) {
				throw {
					str: str,
					result: ret,
					message: '@規則の記述が正しくありません。' + selector
				};
			}
			return {
				selector: $.trim(selector),
				definitions: $.trim(definitions),
				isNoBracketDesc: isNoBracketDesc
			};
		}

		// スタイル定義({})の中身をパースする関数
		function parseStyleDef() {
			var definitions = [];
			var prop = '';
			while (w = str[i++]) {
				if (w === '"' || w === "'") {
					// 文字列記述開始なら文字列終わりまで飛ばす
					prop += scanString(w);
				} else if (w === ':') {
					prop = $.trim(prop);
					if (prop === '') {
						// :が出てきたのにプロパティが書かれていない
						throw {
							result: ret,
							str: str,
							message: selector + 'のスタイル定義にエラーがあります。":"の左側にキー名がありません。'
						};
					} else if (prop.match(/\s/)) {
						// キー名に空白、改行、タブが含まれていたらエラー
						throw {
							result: ret,
							str: str,
							message: selector + 'のスタイル定義にエラーがあります。キー"' + prop.split(/\s/)[0]
									+ '"に値が指定されていません。'
						};
					}
					// プロパティが確定
					definitions.push({
						key: prop,
						value: parseStyleValue()
					});
					prop = '';
					if (w === '}') {
						// 末尾セミコロンが省略されていた場合1個戻す
						i--;
					}
				} else if (w === '}') {
					if ($.trim(prop) !== '') {
						// プロパティのパース途中で}が出てきたらエラー
						throw {
							result: ret,
							str: str,
							message: selector + 'のスタイル定義にエラーがあります。プロパティ"' + prop
									+ '"についての値の記述がありません。'
						};
					}
					return definitions;
				} else {
					prop += w;
				}
			}
			// while分を抜けた(w == nullの場合)ならエラー("}"にたどり着く前に文字列が終わってるので)
			throw {
				result: ret,
				str: str,
				message: selector + 'のスタイル定義にエラーがあります。閉じ括弧がありません。'
			};
		}
		// CSS文字列をパース
		while ((w = str[i++]) != null) {
			if (w === '"' || w === "'") {
				// 文字列記述の開始なら文字列終わりまで飛ばす
				selector += scanString(w, w);
			} else if (w === '@' && !$.trim(selector)) {
				// @ルールの記述ならセレクタも値もparseAtMarkRule()でパースする
				// sheat.addRule('@-webkit-keyframes sample', '0%{...} 100%{...}');
				// でaddRuleできるので、definitionには{}または;までを文字列として格納する。
				// セレクタはdefinitionまでの文字列
				result = parseAtMarkRule();
				selector = '';
				ret.push(result);
			} else if (w === '{') {
				if (!$.trim(selector)) {
					// '{'が出てきたのにセレクタが掛かれていない
					throw {
						result: ret,
						str: str,
						message: 'セレクタが記述されていません'
					};
				}
				// セレクタが確定
				// スタイルのプロパティと値をパース
				val = parseStyleDef();
				var result = {
					selector: $.trim(selector),
					definitions: val
				};
				selector = '';
				ret.push(result);
			} else {
				// スタイル定義の中でなければ、出てきた文字列はセレクタ
				selector += w;
			}
		}
		// パース終了
		if ($.trim(selector) !== '') {
			// セレクタのパース中に文字列が終わった時(=セレクタだけ書いてあってそれに紐づくスタイル定義がない)
			throw {
				result: ret,
				str: str,
				message: 'セレクタ"' + selector + '"についてのスタイル定義がありません。'
			};
		}
		return ret;
	}

	/**
	 * 指定されたフルパス("hifive.editor.component."以下のフルパス) からコンポーネントオブジェクトを取得する
	 */
	function getComponentCreator(componentName) {
		var ary = componentName.split('.');
		var ret = hifive.editor.components;
		for ( var i = 0, l = ary.length; i < l; i++) {
			ret = ret[ary[i]];
			if (ret == null) {
				return null;
			}
		}
		return ret.__contents;
	}

	/**
	 * 指定されたフルパス("hifive.editor.component."以下のフルパス) にコンポーネントオブジェクトをセットする
	 */
	function setComponentCreator(componentName, creator) {
		var nameArray = componentName.split('.');
		var root,name;
		// 属するグループ名とコンポーネント名に分割
		if (nameArray.length === 1) {
			name = nameArray[0];
			root = '';
		} else {
			name = nameArray.pop();
			root = '.' + nameArray.join('.');
		}
		// idに指定された箇所にクリエータオブジェクトを作成
		h5.u.obj.ns('hifive.editor.components' + root)[name] = {
			__contents: $.extend({}, creator)
		};
	}


	function getAbsoluteSrcPath(path) {
		var basePath = hifive.editor.settings.srcBase;

		var base = basePath[basePath.length - 1] === '/' ? basePath : basePath + '/';

		if (path.charAt(0) === '/') {
			path = path.slice(1);
		}

		return base + path;
	}

	function getAbsoluteExportLivePreviewUrl(path) {
		if (path.charAt(0) === '/') {
			return path;
		}

		//composePath()のようなメソッドを作る(/のケアをする)
		var absUrl = hifive.editor.settings.fileStoreBase + 'live/' + path;

		return absUrl;
	}


	function getFocusedPageController() {
		//TODO ページ部分がタブ化したときには、カレントを返すようにする
		var pageController = h5.core.controllerManager.getControllers(document.body, {
			deep: true,
			name: 'hifive.editor.controller.PageController'
		})[0];
		return pageController;
	}

	function wrapInArray(value) {
		return $.isArray(value) ? value : [value];
	}

	function isComponent(element) {
	//TODO コンポーネントかどうか判定
	}

	function setEnv(key, val) {
		h5.u.obj.ns('hifive.editor.env')[key] = val;
	}

	function replaceEnv(str) {
		var match = str.match(/\$.*?\$/g);
		if (match) {
			for ( var i = 0, l = match.length; i < l; i++) {
				var param = match[i];
				str = str.replace(param, hifive.editor.env[param.slice(1, param.length - 1)]);
			}
		}
		return str;
	}

	/**
	 * "モジュール名:ソース名"から、ソースのパスを返す。 ex. 'hifive:ejs' -> '$SYSTEM_LIB$/hifive/h5.css'
	 */
	function getPathByCreatorSrcName(creatorSrcName, extension) {
		var match = creatorSrcName.match(/^(.*?):(.*?)$/);
		var creatorName = match ? match[1] : creatorSrcName;
		var srcName = match ? match[2] : null;
		var creator = getComponentCreator(creatorName);
		// dependenciesがあればそこから探す。なければrequreiementsから探す。
		var req = creator.dependencies ? creator.dependencies : creator.requirements;
		// js,jsMandatoryの順で探す
		function getSrcByName(srcs, name) {
			if (!name) {
				// 'hifive'のようにソース名を省略された場合で、クリエータにパスそのまま指定されているならそのまま返す
				if (typeof srcs === 'string') {
					return srcs;
				}
				// ソース名省略された場合でソースが複数あるなら、name==nullで比較して探す。
				name = null;
			}
			srcs = wrapInArray(srcs);
			for ( var i = 0, l = srcs.length; i < l; i++) {
				// null,undefinedを区別なく探したいので"=="で比較
				if (srcs[i].name == name) {
					return srcs[i].path;
				}
			}
		}
		return (req[extension] && getSrcByName(req[extension], srcName))
				|| (req[extension + 'Mandatory'] && getSrcByName(req[extension + 'Mandatory'],
						srcName));
	}

	/**
	 * data-h5-moduleが指定されていてかつ、data-h5-ignoreの設定されていない要素について、 クリエータで定義されているリソースパスに差し替える。
	 */
	function replaceModuleResourcePath(doc) {
		$(doc.documentElement, doc).find('[' + DATA_H5_MODULE + ']:not([data-h5-ignore])').each(
				function() {
					var pathAttr = '';
					var extension = '';
					if (this.tagName === 'SCRIPT') {
						pathAttr = 'src';
						extension = 'js';
					} else {
						pathAttr = 'href';
						extension = 'css';
					}
					var creatorSrcName = this.getAttribute(DATA_H5_MODULE);
					var path = getPathByCreatorSrcName(creatorSrcName, extension);
					if (path) {
						this.setAttribute(pathAttr, replaceEnv(path));
					}
				});
	}

	/**
	 * キー配列を受け取って、そのキー配列を包含する最小限のキー配列を返す。
	 *
	 * @memberOf hifive.editor.u
	 * @param _keys {String[]} キー配列
	 * @returns {String[]} 渡されたキー配列を含む最小限のキー配列
	 */
	function getkeys(_keys) {
		var keys = _keys.slice(0);
		// ソートして、包含関係の高いものと低いものがあった時に、必ず高いものの次に低いものが来るようにする。
		keys.sort();
		var ret = [];
		var preKey = null;
		for ( var i = 0, l = keys.length; i < l; i++) {
			if (!keys[i]) {
				continue;
			}
			// ひとつ前のキー.hoge なら追加しない。
			if (preKey && preKey === keys[i].substring(0, preKey.length)
					&& keys[i][preKey.length] === '.') {
				continue;
			}
			preKey = keys[i];
			ret.push(preKey);
		}
		return ret;
	}

	/**
	 * 指定されたモジュールソース名が参照しているリソースパスを差し替える。
	 */
	function replaceModule() {

	}

	/**
	 * ドキュメントから必要なキーを取得する
	 */
	function getComponentKeys(doc) {
		var rawKeys = [];

		$(doc.documentElement, doc).find('[' + DATA_COMPONENT + ']').each(function() {
			var componentName = $(this).attr(DATA_COMPONENT);

			if ($.inArray(componentName, rawKeys) === -1) {
				rawKeys.push(componentName);
			}
		});
		return rawKeys;
	}

	/**
	 * キーリストから、必要なjs(scriptタグ),css(linkタグ)を計算して返す。
	 * <p>
	 * preexistingsに指定された部品、モジュール、についてのjs,cssは計算しない。
	 * libsに指定された部品名、モジュール名が必要とするjs,css(script,linkタグ)には、data-h5-module属性を付与する
	 * </p>
	 *
	 * @param {String[]} keys クリエータのキーリスト
	 * @param {Object} preexistingSrcs もともと存在するソース。{js:['hifive','hifive:ejs'], css:['hifive']}
	 *            のようなオブジェクト。
	 */
	function getCreatorRequirements(_keys, preexistingSrcs) {
		var keys = wrapInArray(_keys);
		var req = _getCreatorRequirementsMinimum(keys, preexistingSrcs);
		var man = _getCreatorRequirementsMandatory(keys, preexistingSrcs);
		var dep = _getModuleDependencies(keys, preexistingSrcs);
		return {
			js: dep.js.concat(man.js).concat(req.js),
			css: dep.css.concat(man.css).concat(req.css)
		};
	}

	/**
	 * モジュール(クリエータ)が必要とするjs,cssを受け取って、script,linkタグを作って追加する。 backupSrcにmoduleNameで指定されたモジュールがあれば
	 * preexistingSrcにあるものは、data-h5-moduleにモジュール名:ソースを記述する。
	 *
	 * @param {Object|String|(Object|String)[]} reqJs
	 *            追加するjs。Stringの場合はpath。Objectの場合は{name:'main',path:'h5.js'}のようなオブジェクト
	 * @param {Object|String|(Object|String)[]} reqCss 追加するcss
	 * @param {jQuery[]} js 作成したscript要素(jQuery)の追加先の配列
	 * @param {jQuery[]} css 作成したlink要素(jQuery)の追加先の配列
	 * @param {Object} [preexistingSrcs] もともとあったソース情報の配列。
	 *
	 * <pre>
	 * ['jquery:main', 'hifive:main']
	 * </pre>
	 *
	 * のような配列で、作成したscript.link要素がpreexistingSrcにあった場合は、data-h5-module属性を記述する
	 * @param {String} [moduleName]
	 *            モジュール名。backupSrcからバックアップされたモジュールのソースの取得と、data-h5-module属性値の記述に使用する。
	 */
	function addResourceWithSrcKey(reqJs, reqCss, js, css, preexistingSrcs, moduleName) {
		if (reqJs) {
			$.each(wrapInArray(reqJs), function(i, val) {
				var name = val.name;
				var srcKey = name ? moduleName + ':' + name : moduleName;
				if ($.inArray(srcKey, preexistingSrcs.js) !== -1) {
					return;
				}
				var script = null;
				var path = typeof val === 'string' ? val : val.path;
				script = $('<script src="' + path + '"></script>');
				script.attr(DATA_H5_MODULE, srcKey);
				js.push(script);
			});
		}
		if (reqCss) {
			$.each(wrapInArray(reqCss), function(i, val) {
				var name = val.name;
				var srcKey = name ? moduleName + ':' + name : moduleName;
				if ($.inArray(srcKey, preexistingSrcs.css) !== -1) {
					return;
				}
				var link = null;
				var path = typeof val === 'string' ? val : val.path;
				link = $('<link rel="stylesheet" href="' + path + '">');
				link.attr(DATA_H5_MODULE, srcKey);
				css.push(link);
			});
		}
	}

	/**
	 * クリエータのキーのリストからソースの包含関係を考慮した最低限のjs,cssのリストを返す。
	 * <p>
	 * keysにモジュール名があったら無視。ここでは部品についてだけのソースを取得する。
	 * </p>
	 *
	 * @param {String[]} _keys クリエータのキーリスト。
	 * @param {Object} [backupSrc] backupSrcにソースが書かれていたらクリエータに記述されたソースじゃなくてbackupSrcに記述されたものを使用する。
	 * @param {Object} [preexistingSrcs] もともとあったソース情報の配列。
	 */
	function _getCreatorRequirementsMinimum(_keys, preexistings) {
		// preexistingsを追加してgetkeysすることで、preexistingsに書かれたグループ以下の要素のjs,cssは追加しない。
		var keys = getkeys(wrapInArray(_keys));
		var js = [];
		var css = [];

		// ソースの包含関係を計算
		for ( var i = 0, len = keys.length; i < len; i++) {
			var creator = getComponentCreator(keys[i]);
			if (creator && creator.requirements) {
				var requirements = creator.requirements;
				addResourceWithSrcKey(requirements.js, requirements.css, js, css, preexistings,
						keys[i]);
			}
		}
		return {
			js: js,
			css: css
		};
	}

	/**
	 * jsMandatory, cssMandatoryに書かれているものを読む。 <br>
	 * Mandatoryに書かれているものは、ソースコードの包含関係とは関係なく、その部品があれば読むソース。
	 *
	 * @param {String[]} _keys クリエータのキーリスト。
	 * @param {Object} [backupSrc] backupSrcにソースが書かれていたらクリエータに記述されたソースじゃなくてbackupSrcに記述されたものを使用する。
	 * @param {Object} [preexistingSrcs] もともとあったソース情報の配列。
	 */
	function _getCreatorRequirementsMandatory(_keys, preexistings) {
		var keys = wrapInArray(_keys);
		var js = [];
		var css = [];

		for ( var i = 0, len = keys.length; i < len; i++) {
			var requirements = getComponentCreator(keys[i]).requirements;
			if (requirements) {
				addResourceWithSrcKey(requirements.jsMandatory, requirements.cssMandatory, js, css,
						preexistings, keys[i]);
			}
		}
		return {
			js: js,
			css: css
		};
	}

	/**
	 * クリエータのキーのリストから依存しているモジュールが必要なリソース情報を取得する
	 *
	 * @param {String[]} _keys クリエータのキーリスト。
	 * @param {Object} [backupSrc] backupSrcにソースが書かれていたらクリエータに記述されたソースじゃなくてbackupSrcに記述されたものを使用する。
	 * @param {Object} [preexistingSrcs] もともとあったソース情報の配列。
	 */
	function _getModuleDependencies(_keys, preexistings) {
		var keys = wrapInArray(_keys);

		// 各クリエーターに書かれた依存先モジュール名を重複なく取得する関数
		function getDepends(creatorName) {
			var dependModuleNames = [];
			var creator = getComponentCreator(creatorName);
			if (creator) {
				if (creator.dependencies) {
					// dependenciesを持っている=自分自身が依存対象になるモジュールなので、自分自身を追加。
					dependModuleNames.push(creatorName);
				}
				if (creator.depends) {
					var depends = creator.depends;
					depends = wrapInArray(depends);
					for ( var i = 0, l = depends.length; i < l; i++) {
						dependModuleNames.push(depends[i]);
					}
				}
				if (creator.inheritDependencies !== false) {
					// inheritDependenciesにfalseが指定されていない場合は、親のdependsも見る
					var match = creatorName.match(/^(.*)\..*?$/);
					if (match) {
						dependModuleNames = dependModuleNames.concat(getDepends(match[1]));
					}
				}
			}
			return dependModuleNames;
		}

		// 列挙されたモジュール名のリストの依存関係を計算し、順番に並べたモジュール名のリストを返す
		function sortDependsModule(_uncalcModules) {
			var sortedDependModuleNames = [];
			var uncalcModules = _uncalcModules.slice(0);
			// 依存関係未計算のものが無くなるまでループ
			while (uncalcModules.length !== 0) {
				var restTargets = [];
				for ( var i = 0, l = uncalcModules.length; i < l; i++) {
					var moduleName = uncalcModules[i];
					if ($.inArray(moduleName, sortedDependModuleNames) !== -1) {
						continue;
					}
					var module = getComponentCreator(moduleName);
					if (!module.depends) {
						// dependsがないならソート済みにpush
						sortedDependModuleNames.push(moduleName);
						continue;
					}

					var depends = wrapInArray(module.depends);
					var isDependsCalced = true;
					for ( var j = 0, len = depends.length; j < len; j++) {
						if ($.inArray(depends[j], sortedDependModuleNames) === -1) {
							// dependsに書かれているものがsort済みにないならrestTargetsに追加。再度ループを回す。
							restTargets.push(depends[j]);
							isDependsCalced = false;
						}
					}
					if (isDependsCalced) {
						// 全ての依存関係が解決しているならソート済みにpush
						sortedDependModuleNames.push(moduleName);
					} else {
						restTargets.push(moduleName);
					}
				}
				uncalcModules = restTargets;
			}
			return sortedDependModuleNames;
		}

		// keysが必要なモジュール名を取得
		var dependModuleNames = [];

		for ( var i = 0, l = keys.length; i < l; i++) {
			var creatorName = keys[i];
			var depends = getDepends(creatorName);
			for ( var j = 0, len = depends.length; j < len; j++) {
				dependModuleNames.push(depends[j]);
			}
		}
		// 必要なモジュールが依存しているモジュールを取得して、依存関係順に並べる
		var sortedDependModuleNames = sortDependsModule(dependModuleNames);

		// 必要なモジュール名からjs,cssを取得して返す
		var js = [];
		var css = [];
		for ( var i = 0, l = sortedDependModuleNames.length; i < l; i++) {
			var moduleName = sortedDependModuleNames[i];
			var req = getComponentCreator(moduleName).dependencies;
			if (req) {
				addResourceWithSrcKey(req.js, req.css, js, css, preexistings, moduleName);
			}
		}
		return {
			js: js,
			css: css
		};
	}
	function addScripts(doc, scripts) {
		if (!scripts || scripts.length === 0) {
			return;
		}
		scripts = wrapInArray(scripts);

		// headの最後に追加
		var head = doc.documentElement.getElementsByTagName('head')[0];
		var lastScript = $(head).find('script:last')[0];
		var beforeNode = lastScript ? lastScript.nextSibling : null;

		for ( var i = 0, l = scripts.length; i < l; i++) {
			var script = scripts[i];
			if (typeof script === 'string') {
				var path = script;
				script = doc.createElement('script');
				script.setAttribute('src', path);

				head.insertBefore(script, beforeNode);
			} else {
				// エレメントノードもjQueryとして扱う
				script = $(script);
				for ( var j = 0, len = script.length; j < len; j++) {
					// 環境変数の入れ替え
					var element = script[j];
					element.setAttribute('src', replaceEnv(element.getAttribute('src')));
					head.insertBefore(element, beforeNode);
				}
			}
		}
	}

	function addStylesheets(doc, styles) {
		if (!styles || styles.length === 0) {
			return;
		}
		styles = wrapInArray(styles);

		// headの最後に追加
		var head = doc.documentElement.getElementsByTagName('head')[0];
		var lastLink = $(head).find('link:last')[0];
		var beforeNode = lastLink ? lastLink.nextSibling : null;

		for ( var i = 0, l = styles.length; i < l; i++) {
			var style = styles[i];
			if (typeof style === 'string') {
				var path = style;
				style = doc.createElement('link');
				style.setAttribute('href', path);

				head.insertBefore(script, beforeNode);
			} else {
				// エレメントノードもjQueryとして扱う
				style = $(style);
				for ( var j = 0, len = style.length; j < len; j++) {
					// 環境変数の入れ替え
					var element = style[j];
					element.setAttribute('href', replaceEnv(element.getAttribute('href')));
					head.insertBefore(element, beforeNode);
				}
			}
		}
	}

	function addCssText(doc, cssText) {
		var style = doc.createElement('style');
		style.setAttribute(hifive.editor.consts.DATA_CUSTOM_CSS, '');
		style.innerHTML = cssText;

		doc.head.appendChild(style);
	}


	/**
	 * デバッグウィンドウを開く TODO 仕様はもう少し整理
	 */
	function openChildWindow(url, title, windowName) {
		var body = null;
		var w = null;

		var winName = windowName ? windowName : '_blank';

		// Firefoxは'about:blank'で開くとDOM追加した後に要素が消されてしまう
		// IEの場合はnullで開くとDocmodeがquirksになり、'about:blank'で開くとちゃんと9モードになる
		// chromeの場合はどちらでもいい
		// IEの場合だけ'about:blank'を使うようにしている
		var openUrl = url ? url : (h5.env.ua.isIE ? 'about:blank' : null);
		w = window.open(openUrl, winName,
				'resizable=1, menubar=no, width=800, height=600, toolbar=no, scrollbars=yes');

		if (w.__isChildWindow) {
			// 既に開いているものがあったら、それを閉じて別のものを開く
			w.close();
			return openEditWindow();
		}

		try {
			w.__isChildWindow = true;
		} catch (e) {
			// IEの場合既に開いているウィンドウがあったら書き込もうとするとエラーになる
			w.close();
			return openEditWindow();
		}

		body = w.document.body;
		$(body).addClass('hifiveUIDesignerChildWindow');

		// タイトルの設定
		//w.document.title = title ? title : 'hifive UI Designer';

		return w;
	}

	function applyTemplate(text) {
		var controller = h5.core.controllerManager.getControllers(document.body, {
			deep: true,
			name: 'hifive.editor.controller.TemplateController'
		})[0];

		if (!controller) {
			return;
		}

		controller.applyTemplate(text);
	}

	h5.u.obj.expose('hifive.editor.u', {
		getDocumentScrollPos: getDocumentScrollPos,
		moveElementBy: moveElementBy,
		parseCSS: parseCSS,
		getComponentCreator: getComponentCreator,
		setComponentCreator: setComponentCreator,
		getAbsoluteSrcPath: getAbsoluteSrcPath,
		getAbsoluteExportLivePreviewUrl: getAbsoluteExportLivePreviewUrl,
		getFocusedPageController: getFocusedPageController,
		wrapInArray: wrapInArray,
		setEnv: setEnv,
		replaceEnv: replaceEnv,
		getCreatorRequirements: getCreatorRequirements,
		addResourceWithSrcKey: addResourceWithSrcKey,
		addScripts: addScripts,
		addStylesheets: addStylesheets,
		addCssText: addCssText,
		replaceModuleResourcePath: replaceModuleResourcePath,
		openChildWindow: openChildWindow,
		applyTemplate: applyTemplate
	});
})();
