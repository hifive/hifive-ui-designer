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

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	var DUMMY_SIZE_SELECTOR = '[data-h5-editor-dummy-size]';

	var DATA_H5_MODULE = 'data-h5-module';

	var DATA_CONTAINER = hifive.editor.consts.DATA_CONTAINER;

	var DATA_CONTAINER_SELECTOR = hifive.editor.consts.DATA_CONTAINER_SELECTOR;

	var DATA_COMPONENT = hifive.editor.consts.DATA_COMPONENT;

	var DATA_COMPONENT_SELECTOR = hifive.editor.consts.DATA_COMPONENT_SELECTOR;

	var DATA_TEMPLATE_ID = 'data-template-id';


	// =========================================================================
	//
	// Scoped Privates
	//
	// =========================================================================

	// =============================
	// Cache
	// =============================

	var getComponentCreator = hifive.editor.u.getComponentCreator;

	var replaceEnv = hifive.editor.u.replaceEnv;

	// =============================
	// Variables
	// =============================


	// =============================
	// Functions
	// =============================

	function importDocumentElement(srcDoc, destDoc) {
		var childNodes = srcDoc.head.childNodes;

		for ( var i = 0, len = childNodes.length; i < len; i++) {
			var e = childNodes[i];

			if (e.nodeType === Node.ELEMENT_NODE && e.tagName.toLowerCase() === 'script') {
				var script = document.createElement('script');

				script.text = e.text;

				//data-*属性などもあるので、全属性をコピーする
				for ( var l = 0, attrLen = e.attributes.length; l < attrLen; l++) {
					var attr = e.attributes[l];
					script.setAttribute(attr.name, attr.value);
				}
				destDoc.head.appendChild(script);
			} else {
				destDoc.head.appendChild(destDoc.importNode(e, true));
			}
		}

		//destDoc.replaceChild(newBody, destDoc.body); はDOM Exception 8 (NotFound)が発生してしまう

		var destBody = destDoc.body;
		var importedBody = destDoc.importNode(srcDoc.body, true);
		var impBodyChildNodes = importedBody.childNodes;
		for ( var i = 0, len = impBodyChildNodes.length; i < len; i++) {
			destBody.appendChild(impBodyChildNodes[0]);
		}
	}

	function getRequiredScripts(componentKeys) {

	}

	function removeTemporaryTags(doc) {
		$(doc.documentElement, doc).find(hifive.editor.consts.DATA_TEMPORARY_SELECTOR).each(
				function() {
					$(this).remove();
				});
	}

	function walkDepthFirst(doc, root, selector, func) {
		//childrenはElementノードだけのリスト
		//IE8-ではコメントノードも含まれるが、このアプリはIE9+でしか動かないので問題ない
		var children = root.children;

		if (children.length !== 0) {
			for ( var i = 0, len = children.length; i < len; i++) {
				walkDepthFirst(doc, children[i], selector, func);
			}
		}

		if ($(root, doc).is(selector)) {
			func(root);
		}
	}

	function _replaceWithExportContents(doc, key, selector) {
		function exportFunc(elem) {
			var $el = $(elem);

			var componentName = $el.attr(key);

			var creator = getComponentCreator(componentName);
			if (!creator || !creator.getExportContents) {
				return;
			}

			//戻り値は HTML, Element, jQueryのいずれか
			//TODO designTimeDataも渡すようにする
			var exportContents = creator.getExportContents(this);

			$el.replaceWith(exportContents);
		}

		walkDepthFirst(doc, doc.body, selector, exportFunc);
	}

	function replaceWithExportContents(doc) {
		_replaceWithExportContents(doc, DATA_COMPONENT, DATA_COMPONENT_SELECTOR);
		_replaceWithExportContents(doc, DATA_CONTAINER, DATA_CONTAINER_SELECTOR);
	}

	function removeDummySizeStyle(doc) {
		$(DUMMY_SIZE_SELECTOR, doc).each(function() {
			var $this = $(this);
			//$this.
		});
	}

	/**
	 * data-h5-moduleが指定されている"部品・モジュール名:ソース名"を重複なく列挙して返す
	 */
	function getPreexistSrcs(doc) {
		var ret = [];
		$(doc.documentElement, doc).find('[' + DATA_H5_MODULE + ']').each(function() {
			var moduleSrc = $(this).attr(DATA_H5_MODULE);
			if ($.inArray(moduleSrc, ret) === -1) {
				if (!moduleSrc.match(/^.+?:.+?$/)) {
					// 記述が不正
					throw {
						message: console.error(DATA_H5_MODULE + '属性の値が不正です。' + moduleSrc)
					};
				}
				ret.push(moduleSrc);
			}
		});
		return ret;
	}

	/**
	 * replaceModuleFlagがfalseなら既に記述済みのソース(script,link要素)を取得。
	 * replaceModuleFlagがtrueなら、data-h5-ignore設定されているもののみ取得。<br>
	 *
	 * @param {HTMLDocument} doc
	 * @param {Boolean} replaceModuleFlag 記述済みのソースを全て入れ替えるかどうか。
	 * @returns {Object} 戻り値は以下のようなオブジェクト
	 *
	 * <pre>
	 * {
	 * 	hifive: {
	 * 		js: {
	 * 			main: 'h5.js',
	 * 			ejs: 'ejs.js'
	 * 		},
	 * 		css: {
	 * 			main: 'h5.css'
	 * 		}
	 * 	}
	 * }
	 * </pre>
	 */
	function getIgnoreSrcs(doc, replaceModuleFlag) {
		var ret = {};
		$(doc.documentElement, doc)
				.find('[' + DATA_H5_MODULE + ']')
				.each(
						function() {
							if (replaceModuleFlag && $(this).attr('data-h5-ignore') == null) {
								// replaceModuleFlagがtrueの場合はignore指定をみて、指定されていないなら何もしない。
								// replaceModuleFlagがfalseの場合は、data-h5-module指定されているものは全て入れ替えないのでここでバックアップを取る。
								return;
							}
							var srcCategory = '';
							if (this.tagName === 'SCRIPT') {
								srcCategory = 'js';
							} else if (this.tagName === 'LINK') {
								srcCategory = 'css';
							} else {
								// TODO エラー：script,linkタグ以外にdata-h5-moduleが指定されている
							}
							var match = $(this).attr(DATA_H5_MODULE).match(/^(.*?):(.*?)$/);
							var moduleName = match[1];
							var srcName = match[2];

							ret[moduleName] = ret[moduleName] ? ret[moduleName] : {};
							ret[moduleName][srcCategory] = ret[moduleName][srcCategory] ? ret[moduleName][srcCategory]
									: {};
							var srcObj = ret[moduleName][srcCategory];
							if (srcObj[srcName]) {
								srcObj[srcName] = srcObj[srcName].add($(this));
							} else {
								srcObj[srcName] = $(this);
							}
						});
		return ret;
	}

	function emptyTemplateChildren(doc) {
		$(doc.documentElement, doc).find('[' + DATA_TEMPLATE_ID + ']').each(function() {
			$(this).empty();
		});
	}

	// =========================================================================
	//
	// Logic
	//
	// =========================================================================

	var pageExportLogic = {
		__name: 'hifive.editor.logic.PageExportLogic',

		/**
		 * 戻り値としてはエクスポートされたHTMLを返す。
		 *
		 * @param {IFrameElement} pageContainer ページコンテナのiframe
		 */
		exportPage: function(pageContainer, customCssText, additionalScripts,
				additionalStylesheets, noReplaceModuleFlag) {
			var contentDoc = pageContainer.contentDocument;

			var doc = document.implementation.createHTMLDocument('');

			importDocumentElement(contentDoc, doc);

			// TODO data-h5-ignoreが指定されているもの以外、パスの差し替え。
			hifive.editor.u.replaceModuleResourcePath(doc);


			// 一時的に置いているコンポーネントを削除
			removeTemporaryTags(doc);

			emptyTemplateChildren(doc);

			replaceWithExportContents(doc);

			hifive.editor.u.addCssText(doc, customCssText);

			hifive.editor.u.addStylesheets(doc, additionalStylesheets);

			hifive.editor.u.addScripts(doc, additionalScripts);
			return doc.documentElement.outerHTML;
		}


	};

	h5.core.expose(pageExportLogic);

})(jQuery);
