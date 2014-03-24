/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
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
 * hifive
 */

(function($) {
	// 二重読み込み防止
	if (!window.h5) {
		// hifive自体がロードされていないので、ロードを中止する
		return;
	} else if (h5.debug && h5.devtool) {
		// 既にロード済みならロードを中止する
		return;
	}

	/**
	 * デバッグコントローラ
	 */
	// =========================================================================
	//
	// Cache
	//
	// =========================================================================
	// =========================================================================
	//
	// Settings
	//
	// =========================================================================
	/**
	 * window.openで開くかどうか。 <br>
	 * window.openで開く場合はtrue、ページ上に表示するならfalse
	 */
	var useWindowOpen = h5.env.ua.isDesktop;
	//	useWindowOpen = true;
	//	useWindowOpen = false;

	// =========================================================================
	//
	// Constants
	//
	// =========================================================================

	/**
	 * DebugToolのバージョン
	 */
	var H5_DEV_TOOL_VERSION = '1.0.0';

	var OLD_IE_BLANK_URL = 'blankForOldIE.html';
	var LOG_INDENT_WIDTH = 10;
	// ログ出力の遅延時間(ms)
	var LOG_DELAY = 100;
	// ログ出力の最大遅延時間(ms)
	var MAX_LOG_DELAY = 500;

	var LIFECYCLE_METHODS = ['__construct', '__init', '__ready', '__unbind', '__dispose'];

	// オーバレイのボーダーの幅
	var OVERLAY_BORDER_WIDTH = 3;

	/**
	 * デバッグツールのスタイル
	 */
	var H5DEBUG_STYLE = [{
		selector: '.h5devtool',
		rule: {
			backgroundColor: 'rgba(255,255,255,0.8)', // iframe版を考慮して背景に透過指定
			height: '100%',
			width: '100%',
			margin: 0,
			padding: 0,
			zIndex: 20000
		}
	}, {
		selector: '.h5devtoolHTML', // IE8-用にHTML要素にもスタイルを当てる
		rule: {
			height: '100%',
			width: '100%',
			margin: 0,
			padding: 0
		}
	}, {
		selector: '.h5devtool.posfix',
		rule: {
			position: 'fixed',
			top: 0,
			left: 0
		}
	}, {
		selector: '.h5devtool .debug-tab',
		rule: {
			height: '100%'
		}
	}, {
		selector: '.h5devtool-upper-right',
		rule: {
			position: 'fixed',
			zIndex: 20001,
			top: 0,
			left: '810px',
			width: '100px',
			textAlign: 'right'
		}
	}, {
		selector: '.h5devtool .liststyle-none',
		rule: {
			listStyle: 'none'
		}
	}, {
		selector: '.h5devtool .no-padding',
		rule: {
			padding: '0!important'
		}
	},
	/*
	 * 汎用スタイル
	 */
	{
		selector: '.h5devtool .font-small',
		rule: {
			fontSize: '0.8em'
		}
	},
	/*
	 * トレースログ
	 */
	{
		selector: '.h5devtool .trace',
		rule: {
			paddingLeft: 0,
			margin: 0,
			height: '100%',
			paddingBottom: '60px', // .fixedControllsの高さ
			overflow: 'visible!important',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box'
		}
	}, {
		selector: '.h5devtool .trace .lifecycleColor',
		rule: {
			color: '#15A2E3',
			borderColor: '#15A2E3'
		}
	}, {
		selector: '.h5devtool .trace .publicColor',
		rule: {
			color: '#31A120',
			borderColor: '#31A120'
		}
	}, {
		selector: '.h5devtool .trace .privateColor',
		rule: {
			color: '#4A370C',
			borderColor: '#4A370C'
		}
	}, {
		selector: '.h5devtool .trace .eventColor',
		rule: {
			color: '#861EC2',
			borderColor: '#861EC2'
		}
	}, {
		selector: '.h5devtool .trace .fixedControlls label',
		rule: {
			margin: '0 2px 4px 0',
			borderWidth: '0 0 3px 0',
			borderStyle: 'solid',
			display: 'inline-block'
		}
	}, {
		selector: '.h5devtool .trace .fixedControlls',
		rule: {
			paddingLeft: 0,
			margin: 0,
			backgroundColor: '#fff',
			border: 'solid 1px gray',
			padding: '3px',
			height: '60px',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box'
		}
	}, {
		selector: '.h5devtool .trace-list',
		rule: {
			paddingLeft: 0,
			margin: 0,
			height: '100%',
			color: 'gray',
			whiteSpace: 'nowrap',
			overflow: 'auto'
		}
	}, {
		selector: '.h5devtool .trace-list>li.selected',
		rule: {
			backgroundColor: '#ddd'
		}
	}, {
		selector: '.h5devtool .trace-list>li .time',
		rule: {
			marginRight: '1em'
		}
	}, {
		selector: '.h5devtool .trace-list>li .tag',
		rule: {
			display: 'inline-block',
			minWidth: '3em'
		}
	}, {
		selector: '.h5devtool .trace-list>li .promiseState',
		rule: {
			display: 'inline-block',
			marginRight: '0.5em'
		}
	},
	/*
	 * ロガー
	 */
	{
		selector: '.h5devtool .logger p',
		rule: {
			margin: '4px 0 0 2px',
			borderTop: '1px solid #eee',
			fontSize: '12px'
		}
	}, {
		selector: '.h5devtool .logger p.TRACE',
		rule: {
			color: '#000000'
		}
	}, {
		selector: '.h5devtool .logger p.DEBUG',
		rule: {
			color: '#0000ff'
		}
	}, {
		selector: '.h5devtool .logger p.INFO',
		rule: {
			color: '#000000'
		}
	}, {
		selector: '.h5devtool .logger p.WARN',
		rule: {
			color: '#0000ff'
		}
	}, {
		selector: '.h5devtool .logger p.ERROR',
		rule: {
			color: '#ff0000'
		}
	}, {
		selector: '.h5devtool .logger p.EXCEPTION',
		rule: {
			color: '#ff0000',
			fontWeight: 'bold'
		}
	},
	/*
	 * カラムレイアウトをコンテンツに持つタブコンテンツのラッパー
	 * 各カラムでスクロールできればいいので、外側はoverflow:hidden
	 */
	{
		selector: '.h5devtool .columnLayoutWrapper',
		rule: {
			overflow: 'hidden!important'
		}
	},
	/*
	 * コントローラのデバッグ
	 */{
		selector: '.h5devtool .debug-controller .controll',
		rule: {
			paddingLeft: '30px'
		}
	},
	/*
	 * コントローラのデバッグ
	 */{
		selector: '.h5devtool .debug-controller .controller-detail',
		rule: {
			height: '100%'
		}
	},
	/*
	 * コントローラ・ロジックリスト
	 */
	{
		selector: '.h5devtool .debug-controller .targetlist',
		rule: {
			paddingTop: 0,
			paddingLeft: '1.2em',
			// IE7用
			'*paddingLeft': 0,
			'*position': 'relative',
			'*left': '-1.2em'
		}
	}, {
		selector: '.h5devtool .debug-controller .targetlist .target-name',
		rule: {
			cursor: 'default'
		}
	}, {
		selector: '.h5devtool .debug-controller .targetlist .target-name.selected',
		rule: {
			background: 'rgb(170,237,255)!important'
		}
	}, {
		selector: '.h5devtool .debug-controller .targetlist .target-name:hover',
		rule: {
			background: 'rgb(220,247,254)'
		}
	},

	/*
	 * イベントハンドラ
	 */
	{
		selector: '.h5devtool .debug-controller .eventHandler ul',
		rule: {
			listStyle: 'none',
			margin: 0
		}
	}, {
		selector: '.h5devtool .debug-controller .eventHandler ul li .key',
		rule: {
			lineHeight: '28px'
		}
	}, {
		selector: '.h5devtool .debug-controller .eventHandler li.selected',
		rule: {
			background: 'rgb(203,254,231)'
		}
	},
	/*
	 * メソッドリスト
	 */
	{
		selector: '.h5devtool .debug-controller .method ul',
		rule: {
			listStyle: 'none',
			margin: 0
		}
	}, {
		selector: '.h5devtool .method-list .nocalled',
		rule: {
			background: '#6EB7DB'
		}
	}, {
		selector: '.h5devtool .method-list .called',
		rule: {
			background: '#CBE6F3'
		}
	},
	/*
	 * その他情報
	 */
	{
		selector: '.h5devtool .debug-controller .otherInfo ul',
		rule: {
			margin: 0
		}
	}, {
		selector: '.h5devtool .debug-controller .otherInfo dt',
		rule: {
			fontWeight: 'bold',
			margin: '5px 0 5px 5px'
		}
	}, {
		selector: '.h5devtool .method-list .count',
		rule: {
			float: 'right',
			fontWeight: 'bold',
			fontSize: '30px',
			position: 'relative',
			top: '16px',
			right: '10px',
			color: '#888'
		}
	}, {
		selector: '.h5devtool .method-list pre',
		rule: {
			margin: '0 0 10px',
			padding: '4px',
			wordBreak: 'break-all',
			wordWrap: 'break-word',
			whiteSpace: 'pre',
			whiteSpace: 'pre-wrap',
			background: 'rgb(250,250,250)',
			border: '1px solid rgb(213,213,213)',
			'-webkit-border-radius': '4px',
			'-moz-border-radius': '4px',
			borderRadius: '4px',
			fontFamily: 'Monaco,Menlo,Consolas,"Courier New",monospace',
			fontSize: '12px'
		}
	}, {
		selector: '.h5devtool .debug-controller .detail',
		rule: {
			overflow: 'auto'
		}
	}, {
		selector: '.h5devtool .ovfAuto',
		rule: {
			overflow: 'auto'
		}
	}, {
		selector: '.h5devtool .ovfHidden',
		rule: {
			overflow: 'hidden'
		}
	}, {
		selector: '.h5devtool .left',
		rule: {
			float: 'left',
			height: '100%',
			maxWidth: '350px',
			border: '1px solid #20B5FF',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*top': 0,
			'*left': 0,
			'*bottom': 0,
			'*width': '350px'
		}
	}, {
		selector: '.h5devtool .right',
		rule: {
			height: '100%',
			border: '1px solid #20B5FF',
			borderLeft: 'none',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*width': 'auto',
			'*top': 0,
			'*left': '350px',
			'*right': 0,
			'*bottom': 0
		}
	}, {
		selector: '.h5devtool .eventHandler .menu',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5devtool .eventHandler .menu>*',
		rule: {
			display: 'inline-block'
		}
	}, {
		selector: '.h5devtool .eventHandler .selected .menu',
		rule: {
			display: 'inline-block'
		}
	},
	/*
	 * タブ
	 */
	{
		selector: '.h5devtool ul.nav-tabs',
		rule: {
			listStyle: 'none',
			width: '100%',
			margin: 0,
			padding: 0,
			float: 'left'

		}
	}, {
		selector: '.h5devtool ul.nav-tabs>li',
		rule: {
			float: 'left',
			padding: '3px',
			border: '1px solid #ccc',
			color: '#20B5FF',
			marginLeft: '-1px',
			cursor: 'pointer'
		}
	}, {
		selector: '.h5devtool ul.nav-tabs>li.active',
		rule: {
			color: '#000',
			borderBottom: 'none'
		}
	}, {
		selector: '.h5devtool .tab-content',
		rule: {
			marginTop: '-1px',
			width: '100%',
			height: '100%',
			paddingBottom: '30px',
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box',
			// IE7用
			'*position': 'absolute',
			'*height': 'auto',
			'*top': '26px',
			'*left': 0,
			'*bottom': 0,
			'*right': '20px',
			'*paddingBottom': 0,
			'*overflow-y': 'auto',
			'*overflow-x': 'hidden'
		}
	}, {
		selector: '.h5devtool .tab-content>*',
		rule: {
			overflow: 'auto',
			float: 'left',
			height: 'inherit',
			width: '100%'
		}
	}, {
		selector: '.h5devtool .tab-content>*',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5devtool .tab-content>.active',
		rule: {
			display: 'block'
		}
	},
	/**
	 * ドロップダウンメニュー(bootstrapから流用)
	 */
	{
		selector: '.h5devtool .dropdown-menu',
		rule: {
			position: ' absolute',
			top: '100%',
			left: '0',
			'z-index': '1000',
			display: 'none',
			float: 'left',
			'min-width': '160px',
			padding: '5px 0',
			margin: '2px 0 0',
			'list-style': 'none',
			'background-color': '#fff',
			border: '1px solid #ccc',
			border: '1px solid rgba(0,0,0,0.2)',
			'-webkit-border-radius': '6px',
			'-moz-border-radius': '6px',
			'border-radius': '6px',
			'-webkit-box-shadow': '0 5px 10px rgba(0,0,0,0.2)',
			'-moz-box-shadow': '0 5px 10px rgba(0,0,0,0.2)',
			'box-shadow': '0 5px 10px rgba(0,0,0,0.2)',
			'-webkit-background-clip': 'padding-box',
			'-moz-background-clip': 'padding',
			'background-clip': 'padding-box'
		}
	}, {
		selector: '.h5devtool .dropdown-menu li',
		rule: {
			fontSize: '0.8em',
			padding: '8px',
			cursor: 'pointer'
		}
	}, {
		selector: '.h5devtool .dropdown-menu li:hover',
		rule: {
			backgroundColor: '#eee'
		}
	}];

	var SPECIAL_H5DEBUG_STYLE = {
	//		IE: [{
	//			// スタイルの調整(IE用)
	//			// IEだと、親要素とそのさらに親要素がpadding指定されているとき、height:100%の要素を置くと親の親のpadding分が無視されている？
	//			// その分を調整する。
	//			selector: '.h5devtool .tab-content .tab-content',
	//			rule: {
	////				paddingBottom: '60px'
	//			}
	//		}]
	};
	/**
	 * デバッグ対象になるページ側のスタイル
	 */
	var H5PAGE_STYLE = [{
		selector: '.h5devtool-overlay, .h5devtool-overlay *',
		rule: {
			position: 'absolute',
			zIndex: 10000,
			'-moz-box-sizing': 'border-box',
			'-webkit-box-sizing': 'border-box',
			boxSizing: 'border-box'
		}
	}, {
		selector: '.h5devtool-overlay .body',
		rule: {
			height: '100%',
			width: '100%',
			opacity: '0.2',
			filter: 'alpha(opacity=20)',
			backgroundColor: 'rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5devtool-overlay.event-target .body',
		rule: {
			backgroundColor: 'rgb(128,255,198)'
		}
	}, {
		selector: '.h5devtool-overlay .border',
		rule: {
			opacity: '0.3',
			filter: 'alpha(opacity=30)',
			position: 'absolute',
			borderTopWidth: '3px',
			borderLeftWidth: '3px',
			borderBottomWidth: 0,
			borderRightWidth: 0
		}
	}, {
		selector: '.h5devtool-overlay.root .border',
		rule: {
			borderStyle: 'solid',
			borderColor: 'rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5devtool-overlay.child .border',
		rule: {
			borderStyle: 'dashed',
			borderColor: 'rgb(64, 214, 255)'
		}
	}, {
		selector: '.h5devtool-overlay.event-target .border',
		rule: {
			borderStyle: 'dashed',
			borderColor: 'rgb(128,255,198)'
		}
	}, {
		selector: '.h5devtool-overlay.borderOnly .body',
		rule: {
			display: 'none'
		}
	}, {
		selector: '.h5devtool-overlay.borderOnly',
		rule: {
			height: '0!important',
			width: '0!important'
		}
	}];

	// =========================================================================
	//
	// Scoped Privates
	//
	// =========================================================================
	// =============================
	// View
	// =============================
	/**
	 * デバッグツールで使用するview
	 */
	var view = h5.core.view.createView();
	// モバイル、タブレット用のラッパー。
	view
			.register(
					'wrapper',
					'<div class="h5devtool-upper-right"><div class="h5devtool-controllBtn showhideBtn hideTool">↑</div><div class="h5devtool-controllBtn opencloseBtn closeTool">×</div></div><div class="h5devtool posfix" style="position:fix; left:0; top:0;"></div>');

	// ルートのタブ
	view.register('debug-tab', '<div class="debug-tab"><ul class="nav nav-tabs">'
			+ '<li class="active" data-tab-page="debug-controller">コントローラ</li>'
			+ '<li data-tab-page="trace">トレース</li>' + '<li data-tab-page="logger">ロガー</li>'
			+ '<li data-tab-page="settings">設定</li>' + '</ul><div class="tab-content">'
			+ '<div class="active debug-controller columnLayoutWrapper"></div>'
			+ '<div class="trace whole"></div>' + '<div class="logger"></div>'
			+ '<div class="settings"></div>' + '</div>');

	// --------------------- コントローラ --------------------- //
	// コントローラデバッグ画面
	view.register('controllerDebugWrapper',
			'<div class="left ovfAuto"></div><div class="right ovfHidden"></div>');

	// コントローラリストul
	view.register('target-list', '<ul class="targetlist"></ul>');

	// コントローラリストli
	view.register('target-list-part',
			'<li><span class="target-name [%= cls %]">[%= name %]</span></li>');

	// 詳細情報画面
	view.register('controller-detail',
			'<div class="detail controller-detail"><ul class="nav nav-tabs">'
					+ '<li class="active" data-tab-page="eventHandler">イベントハンドラ</li>'
					+ '<li data-tab-page="method">メソッド</li>'
					+ '<li data-tab-page="trace">トレース</li>'
					+ '<li data-tab-page="otherInfo">その他情報</li></ul><div class="tab-content">'
					+ '<div class="active eventHandler"></div>' + '<div class="method"></div>'
					+ '<div class="trace"></div>' + '<div class="otherInfo"></div></div>');

	// イベントハンドラリスト
	view
			.register(
					'eventHandler-list',
					'<ul class="liststyle-none no-padding method-list">[% for(var i = 0, l = eventHandlers.length; i < l; i++){ var p = eventHandlers[i]; %]'
							+ '<li class="[%= (methodCount.get(p)?"called":"nocalled") %]"><span class="menu">ターゲット:<select class="eventTarget"></select><button class="trigger">実行</button></span>'
							+ '<span class="key">[%= p %]</span><span class="count">[%= methodCount.get(p) %]</span><pre class="value">[%= _funcToStr(controller[p]) %]</pre></li>'
							+ '[% } %]</ul>');

	// メソッドリスト(コントローラ、ロジック、共通)
	view
			.register(
					'method-list',
					'<ul class="liststyle-none no-padding method-list">[% for(var i = 0, l = methods.length; i < l; i++){ var p = methods[i];%]'
							+ '<li class="[%= (methodCount.get(p)?"called":"nocalled") %]"><span class="name">[%= p %]</span><span class="count">[%= methodCount.get(p) %]</span><pre class="value">[%= _funcToStr(defObj[p]) %]</pre></li>'
							+ '[% } %]</ul>');
	// その他情報
	view
			.register(
					'controller-otherInfo',
					'<dl><dt>名前</dt><dd>[%= controller.__name %]</dd>'
							+ '<dt> ルートコントローラか</dt><dd>[%= controller.__controllerContext.isRoot %]</dd>'
							+ '<dt>ルート要素</dt><dd>[%= _formatDOM(controller.rootElement)  %]</dd>'
							+ '<dt>ルートコントローラ</dt><dd>[%= controller.rootController.__name %]</dd>'
							+ '<dt>親コントローラ</dt><dd>[%= controller.parentController && controller.parentController.__name || "なし" %]</dd>'
							+ '<dt>子コントローラ一覧</dt><dd>[% if(!childControllerNames.length){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% for(var i = 0, l = childControllerNames.length; i < l; i++){ %]<li>[%= childControllerNames[i] %]</li>[% } %]</ul>[% } %]</dd>'
							+ '<dt>テンプレートパス一覧</dt><dd>[% if(!controller.__templates){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% var templates = typeof controller.__templates === "string"? [controller.__templates]: controller.__templates; '
							+ 'for(var i = 0, l = templates.length; i < l; i++){ %]<li>[%= templates[i] %]</li>[% } %]</ul>[% } %]</dd>'
							+ '<dt>有効なテンプレートID一覧</dt><dd>[% if(!$.isEmptyObject(controller.view.__view.__cachedTemplates)){ %]なし'
							+ '[% }else{ %]<ul class="no-padding">[% for(var p in controller.view.__view.__cachedTemplates){ %]<li>[%= p %]p</li>[% } %]</ul>[% } %]</dd>'
							+ '</dl>');

	// --------------------- ロジック --------------------- //

	// 詳細情報画面
	view.register('logic-detail', '<div class="detail logic-detail"><ul class="nav nav-tabs">'
			+ '<li class="active" data-tab-page="method">メソッド</li>'
			+ '<li data-tab-page="trace">トレース</li>'
			+ '<li data-tab-page="otherInfo">その他情報</li></ul><div class="tab-content">'
			+ '<div class="active method"></div>' + '<div class="trace"></div>'
			+ '<div class="otherInfo"></div></div>');

	// その他情報
	view.register('logic-otherInfo', '<dl><dt>名前</dt><dd>[%= defObj.__name %]</dd>'
			+ '<dt>ロジックインスタンスの名前</dt><dd>[%= instanceName %]</dd>' + '</dl>');

	// トレースログ(コントローラ、ロジック、全体、で共通)
	view
			.register(
					'trace',
					'<div class="fixedControlls">'
							+ '<label class="event eventColor"><input type="checkbox" checked name="event"/>イベント</label>'
							+ '<label class="public publicColor"><input type="checkbox" checked name="public" />パブリック</label>'
							+ '<label class="private privateColor"><input type="checkbox" checked name="private" />プライベート</label>'
							+ '<label class="lifecycle lifecycleColor"><input type="checkbox" checked name="lifecycle"/>ライフサイクル</label>'
							+ '<br>'
							+ '<input type="text" class="filter"/><button class="filter-show">絞込み</button><button class="filter-hide">除外</button><button class="filter-clear" disabled>フィルタ解除</button>'
							+ '<span class="font-small">（ログを右クリックで関数にジャンプ）</span></div>'
							+ '<ul class="trace-list liststyle-none no-padding" data-h5-loop-context="logs"></ul>'
							+ '<ul class="contextMenu logContextMenu dropdown-menu"><li class="showFunction"><span>関数を表示</span></li></ul>');

	// トレースログのli
	view.register('trace-list-part', '<li class=[%= cls %]>'
			+ '<span class="time">[%= time %]</span>'
			+ '<span style="margin-left:[%= indentWidth %]" class="tag">[%= tag %]</span>'
			+ '<span class="promiseState">[%= promiseState %]</span>'
			+ '<span class="message [%= cls %] [%= cls %]Color">[%= message %]</span></li>');


	// オーバレイ
	view
			.register(
					'overlay',
					'<div class="h5devtool-overlay [%= cls %]"><div class="body"></div><div class="border top"></div><div class="border right"></div><div class="border bottom"></div><div class="border left"></div></div>');

	// --------------------- デバッガ設定 --------------------- //
	view
			.register(
					'settings',
					'<label for="h5devtool-setting-LogMaxNum">ログの最大表示件数</label>'
							+ '<input type="text" id="h5devtool-setting-LogMaxNum" data-h5-bind="attr(value):LogMaxNum" name="LogMaxNum"/><button class="set">設定</button>');
	// =============================
	// Variables
	// =============================

	/**
	 * デバッグツールで使用するロガー
	 */
	var fwLogger = h5.log.createLogger('h5.devtool');

	/**
	 * デバッグするウィンドウ。window.openなら開いたウィンドウで、そうじゃなければページのwindowオブジェクト。
	 */
	var devtoolWindow = null;

	/**
	 * デバッグするウィンドウが閉じられたかどうかのフラグ
	 */
	var isDebugWindowClosed = false;

	var h5devtoolSettings = h5.core.data.createObservableItem({
		LogMaxNum: {
			type: 'integer',
			defaultValue: 1000,
			constraint: {
				notNull: true,
				min: 0
			}
		}
	});

	/**
	 * タッチイベントがあるか
	 */
	var hasTouchEvent = document.ontouchstart !== undefined;

	/**
	 * ログ用のObservableArrayを要素に持つ配列
	 */
	var logArrays = [];

	/**
	 * コントローラ、ロジック、全体のログ
	 */
	var wholeTraceLogs = createLogArray();
	var wholeTraceLogsIndentLevel = 0;

	/**
	 * コンソール出力のログ
	 */
	var loggerArray = createLogArray();

	/**
	 * アスペクトが掛かっていて元の関数が見えない時に代用する関数
	 */
	var DUMMY_NO_VISIBLE_FUNCTION = function() {
	// ダミー
	};

	/**
	 * コントローラがコントローラ定義オブジェクトを持つか(hifive1.1.9以降かどうか)
	 */
	var CONTROLLER_HAS_CONTROLLER_DEF = true;

	/**
	 * アスペクトのかかった関数のtoString()結果を取得する。アスペクトが掛かっているかどうかの判定で使用する。
	 */
	var ASPECT_FUNCTION_STR = '';
	var dummyAspect = {
		target: 'h5.devtool.dummyController',
		pointCut: 'f',
		interceptors: DUMMY_NO_VISIBLE_FUNCTION
	};
	compileAspects(dummyAspect);
	h5.settings.aspects = [dummyAspect];
	h5.core.controller(document, {
		__name: 'h5.devtool.dummyController',
		__construct: function() {
			// hifive1.1.8以前かどうか(controllerDefがあるか)を判定する
			CONTROLLER_HAS_CONTROLLER_DEF = !!this.__controllerContext.controllerDef;
		},
		f: function() {
		// この関数にアスペクトを掛けた時のtoString()結果を利用する
		}
	}).initPromise.done(function() {
		ASPECT_FUNCTION_STR = this.f.toString();
		this.dispose();
	});
	h5.settings.aspects = null;

	/**
	 * jQueryを使って別ウィンドウのスタイルを取得できるかどうか
	 * <p>
	 * (IEでjQuery2.0.Xなら取得できない。jQuery2系の場合は自分で計算するようにする)
	 * </p>
	 */
	var useJQueryMeasuringFunctions = !$().jquery.match(/^2.*/);

	// =============================
	// Functions
	// =============================
	/**
	 * h5.scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param value 値
	 * @returns 配列化された値、ただし引数がnullまたはundefinedの場合はそのまま
	 */
	function wrapInArray(value) {
		if (value == null) {
			return value;
		}
		return $.isArray(value) ? value : [value];
	}
	/**
	 * h5.core.__compileAspectsからコピペ
	 *
	 * @param {Object|Object[]} aspects アスペクト設定
	 */
	function compileAspects(aspects) {
		var compile = function(aspect) {
			if (aspect.target) {
				aspect.compiledTarget = getRegex(aspect.target);
			}
			if (aspect.pointCut) {
				aspect.compiledPointCut = getRegex(aspect.pointCut);
			}
			return aspect;
		};
		h5.settings.aspects = $.map(wrapInArray(aspects), function(n) {
			return compile(n);
		});
	}
	/**
	 * h5scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param {String} str 文字列
	 * @returns {String} エスケープ済文字列
	 */
	function escapeRegex(str) {
		return str.replace(/\W/g, '\\$&');
	}
	/**
	 * h5scopedglobals.jsからコピペ
	 *
	 * @private
	 * @param {String|RegExp} target 値
	 * @returns {RegExp} オブジェクト
	 */
	function getRegex(target) {
		if ($.type(target) === 'regexp') {
			return target;
		}
		var str = '';
		if (target.indexOf('*') !== -1) {
			var array = $.map(target.split('*'), function(n) {
				return escapeRegex(n);
			});
			str = array.join('.*');
		} else {
			str = target;
		}
		return new RegExp('^' + str + '$');
	}

	/**
	 * h5.core.controller.jsからコピペ
	 */
	function getGlobalSelectorTarget(selector) {
		var specialObj = ['window', 'document', 'navigator'];
		for (var i = 0, len = specialObj.length; i < len; i++) {
			var s = specialObj[i];
			if (selector === s) {
				// 特殊オブジェクトそのものを指定された場合
				return h5.u.obj.getByPath(selector);
			}
			if (h5.u.str.startsWith(selector, s + '.')) {
				// window. などドット区切りで続いている場合
				return h5.u.obj.getByPath(selector);
			}
		}
		return selector;
	}

	/**
	 * h5.devtool.jsが設置されているフォルダを取得 (古いIEのためのblankページを取得するために必要)
	 */
	function getThiScriptPath() {
		var ret = '';
		$('script').each(function() {
			var match = this.src.match(/(^|.*\/)h5\.debug\.js$/);
			if (match) {
				ret = match[1];
				return false;
			}
		});
		return ret;
	}

	/**
	 * デバッグウィンドウを開く
	 */
	function openDebugWindow() {
		var dfd = h5.async.deferred();
		var body = null;
		var w = null;
		if (useWindowOpen) {
			// Firefoxは'about:blank'で開くとDOM追加した後に要素が消されてしまう
			// IE9の場合はnullで開くとDocmodeがquirksになり、'about:blank'で開くとちゃんと9モードになる
			// chromeの場合はどちらでもいい
			// IE9の場合だけ'about:blank'を使うようにしている
			// IE7,8の場合は、about:blankでもnullや空文字でも、Docmodeがquirksになる
			// そのため、IE7,8はDocmode指定済みの空のhtmlを開く
			var url = h5.env.ua.isIE ? (h5.env.ua.browserVersion >= 9 ? 'about:blank'
					: getThiScriptPath() + OLD_IE_BLANK_URL) : null;
			w = window.open(url, '1',
					'resizable=1, menubar=no, width=910, height=700, toolbar=no, scrollbars=yes');
			if (!w) {
				// ポップアップがブロックされた場合
				return dfd.reject().promise();
			}
			if (w._h5devtool) {
				// 既に開いているものがあったら、それを閉じて別のものを開く
				w.close();
				return openDebugWindow();
			} else {
				try {
					// IEで、すでにデバッグウィンドウが開かれているとき、そのデバッグウィンドウのプロパティ_h5devtoolはundefinedになっている。
					// そのため、デバッグウィンドウが開かれているかどうかはdocumentオブジェクトにアクセスしたときにエラーが出るかで確認する
					w.document;
				} catch (e) {
					w.close();
					return openDebugWindow();
				}
			}

			function setupWindow() {
				w._h5devtool = true;

				body = w.document.body;
				$(body).addClass('h5devtool');
				$(w.document.getElementsByTagName('html')).addClass('h5devtoolHTML');

				// タイトルの設定
				w.document.title = 'hifive Developer Tool ver.' + H5_DEV_TOOL_VERSION;
			}


			// IE11の場合、非同期でウィンドウが開くことがある
			// openしたwindowの状態はスクリプトの実行中に変化することがある
			// (= else節を抜けた瞬間にcompleteになることもあり得る)
			// ので、イベントハンドラではなくsetIntervalで設定する
			if (w.document && w.document.readyState === 'complete') {
				setupWindow();
				dfd.resolve(w);
			} else {
				var timer = setInterval(function() {
					if (w.document && w.document.readyState === 'complete') {
						clearInterval(timer);
						setupWindow();
						dfd.resolve(w);
					}
				}, 100);
			}
		} else {
			// モバイル用の擬似ウィンドウを開く
			w = window;
			body = document.body;
			view.append(body, 'wrapper');
			dfd.resolve(w);
		}
		return dfd.promise();
	}

	/**
	 * CSSの設定
	 */
	function hyphenate(str) {
		return str.replace(/[A-Z]/g, function(s) {
			return '-' + s.toLowerCase();
		});
	}
	function setCSS(devWindow, styleDef, specialStyleDef) {
		// ウィンドウが開きっぱなしの時はスタイル追加はしない
		var doc = devWindow.document;
		if ($(doc).find('style.h5devtool-style').length && devWindow != window) {
			return;
		}
		var cssArray = styleDef;
		if (specialStyleDef) {
			for ( var p in specialStyleDef) {
				if (h5.env.ua['is' + p]) {
					cssArray = cssArray.concat(specialStyleDef[p]);
				}
			}
		}
		var style = doc.createElement('style');
		$(style).addClass('h5devtool-style');
		doc.getElementsByTagName('head')[0].appendChild(style);
		var sheet = doc.styleSheets[doc.styleSheets.length - 1];
		if (sheet.insertRule) {
			for (var i = 0, l = cssArray.length; i < l; i++) {
				var def = cssArray[i];
				var selector = def.selector;
				var rule = def.rule;
				var cssStr = selector + '{';
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					cssStr += key + ':' + val + ';';
				}
				cssStr += '}';
				sheet.insertRule(cssStr, sheet.cssRules.length);
			}
		} else {
			for (var i = 0, l = cssArray.length; i < l; i++) {
				var def = cssArray[i];
				var selector = def.selector;
				var rule = def.rule;
				for ( var p in rule) {
					var key = hyphenate(p);
					var val = rule[p];
					sheet.addRule(selector, key + ':' + val);
				}
			}
		}
	}
	/**
	 * 関数を文字列化
	 */
	function funcToStr(f) {
		if (!f) {
			return '' + f;
		}
		if (f === DUMMY_NO_VISIBLE_FUNCTION) {
			// ダミーの関数なら表示できません
			return '関数の中身を表示できません';
		}
		var str = f.toString();
		// タブが余分にあった場合は取り除く
		// フォーマットされている前提で、末尾の"}"の前にあるタブの数分を他の行からも取り除く
		var match = str.match(/(\t+)\}$/);
		var tabs = match && match[1];
		if (tabs) {
			return str.replace(new RegExp('\n' + tabs, 'g'), '\n');
		}
		return str;
	}

	/**
	 * DOM要素を"div#id.cls1.cls2"の形式の文字列に変換
	 */
	function formatDOM(elm) {
		if (elm === window) {
			return 'window';
		} else if (elm.nodeType === 9) {
			return 'document';
		}
		var tagName = elm.tagName;
		var id = elm.id;
		var cls = elm.className;
		return tagName.toLowerCase() + (id && '#' + id) + (cls && '.' + cls.replace(/\s/g, '.'));
	}

	/**
	 * コントローラが持つ子コントローラの定義されたプロパティキーのリストを返す
	 *
	 * @param {Controller} controller
	 * @returns {String[]}
	 */
	function getChildControllerProperties(controller) {
		var ret = [];
		for ( var prop in controller) {
			var target = controller[prop];
			if (h5.u.str.endsWith(prop, 'Controller') && prop !== 'rootController'
					&& prop !== 'parentController' && !$.isFunction(target)
					&& (target && !target.__controllerContext.isRoot)) {
				ret.push(prop);
			}
		}
		return ret;
	}

	/**
	 * イベントハンドラを指定しているキーから対象になる要素を取得
	 */
	function getTargetFromEventHandlerKey(key, controller) {
		var $rootElement = $(controller.rootElement);
		var lastIndex = key.lastIndexOf(' ');
		var selector = $.trim(key.substring(0, lastIndex));
		var isGlobalSelector = !!selector.match(/^\{.*\}$/);
		if (isGlobalSelector) {
			selector = $.trim(selector.substring(1, selector.length - 1));
			if (selector === 'rootElement') {
				return $rootElement;
			}
			return $(getGlobalSelectorTarget(selector));

		}
		return $rootElement.find(selector);
	}

	/**
	 * Dateをフォーマット
	 *
	 * @param {Date} date
	 */
	function timeFormat(date) {
		function formatDigit(val, digit) {
			var d = digit - ("" + val).length;
			for (var i = 0; i < d; i++) {
				val = '0' + val;
			}
			return val;
		}
		var h = formatDigit(date.getHours(), 2);
		var m = formatDigit(date.getMinutes(), 2);
		var s = formatDigit(date.getSeconds(), 2);
		var ms = formatDigit(date.getMilliseconds(), 3);
		return h5.u.str.format('{0}:{1}:{2}.{3}', h, m, s, ms);
	}
	/**
	 * ログメッセージオブジェクトを作成
	 *
	 * @param message
	 * @param cls
	 */
	function createLogObject(target, message, cls, tag, promiseState, __name, indentLevel) {
		return {
			target: target,
			time: timeFormat(new Date()),
			cls: cls,
			message: message,
			tag: tag + ':',
			promiseState: promiseState,
			indentWidth: indentLevel * LOG_INDENT_WIDTH
		};
	}

	/**
	 * 第2引数のログメッセージオブジェクトを第1引数のObservableArrayに追加する。 最大数を超えないようにする
	 */
	function addLogObject(logArray, logObj) {
		// 追加
		logArray.push(logObj);
		// 最大保存件数を超えていたらshift
		if (logArray.length > h5devtoolSettings.get('LogMaxNum')) {
			logArray.shift();
		}
		// dispatchEventでログがアップデートされたことを通知
		// addLogObjectが呼ばれた時だけ更新したいので、カスタムイベントを使って通知している
		logArray.dispatchEvent({
			type: 'logUpdate'
		});
	}

	/**
	 * コントローラ定義オブジェクトを追加する(hifive1.1.8以前用)
	 */
	function addControllerDef(controller, defObj) {
		if (defObj.__controllerContext) {
			// defObjにコントローラインスタンスが渡されたら、
			// メソッドにアスペクトが掛かっているかどうか判定する
			// 掛かっていたら、『表示できません』にする
			defObj = $.extend(true, {}, defObj);
			for ( var p in defObj) {
				if ($.isFunction(defObj[p]) && defObj[p].toString() === ASPECT_FUNCTION_STR) {
					defObj[p] = DUMMY_NO_VISIBLE_FUNCTION;
				}
			}
		}
		controller.__controllerContext.controllerDef = defObj;
		// 子コントローラを探して再帰的に追加
		for ( var p in defObj) {
			if (h5.u.str.endsWith(p, 'Controller') && p !== 'rootController'
					&& p !== 'parentController' && defObj[p]) {
				addControllerDef(controller[p], defObj[p]);
			}
		}
	}

	/**
	 * ログ用のObservableArrayを作成する
	 */
	function createLogArray() {
		var ary = h5.core.data.createObservableArray();
		logArrays.push(ary);
		return ary;
	}


	/**
	 * devtoolWindow内の要素についてouterHeightを計算する。
	 */
	function getOuterHeight(elm) {
		if (useJQueryMeasuringFunctions) {
			return $(elm).outerHeight();
		}
		var elmStyle = devtoolWindow.getComputedStyle($(elm)[0], null);
		parseInt(elmStyle.height) + parseInt(elmStyle.paddingTop)
				+ parseInt(elmStyle.paddingBottom) + parseInt(elmStyle.borderTopWidth)
				+ parseInt(elmStyle.borderBottomWidth) + parseInt(elmStyle.marginTop)
				+ parseInt(elmStyle.marginBottom);
	}

	/**
	 * devtoolWindow内の要素についてouterWidthを計算する。
	 */
	function getOuterWidth(elm) {
		if (useJQueryMeasuringFunctions) {
			return $(elm).outerWidth();
		}
		var elmStyle = devtoolWindow.getComputedStyle($(elm)[0], null);
		return parseInt(elmStyle.width) + parseInt(elmStyle.paddingLeft)
				+ parseInt(elmStyle.paddingRight) + parseInt(elmStyle.borderLeftWidth)
				+ parseInt(elmStyle.borderRightWidth) + parseInt(elmStyle.marginLeft)
				+ parseInt(elmStyle.marginRight);
	}

	/**
	 * offsetParentを取得する。
	 */
	function getOffsetParent(elm) {
		var offsetParent = $(elm)[0];
		while (offsetParent && offsetParent.nodeName !== 'HTML'
				&& (devtoolWindow.getComputedStyle(offsetParent, 'position') === 'static')) {
			offsetParent = offsetParent.offsetParent;
		}
		return offsetParent || elm.ownerDocument;
	}

	/**
	 * コントローラまたはロジックがすでにdisposeされているかどうかを判定する
	 *
	 * @param {Controller|Logic}
	 * @returns {Boolean}
	 */
	function isDisposed(target) {
		// コントローラとロジック共通で見たいので__nameがあるかどうかでチェックしている
		return !target.__name;
	}

	/**
	 * メソッドの実行回数をカウントするクラス。
	 * <p>
	 * (メソッド名をプロパティにしたObservableItemは作成できない(プロパティの命名制限のため)ので、オリジナルのクラスを作成)
	 * </p>
	 *
	 * @param {Controller|Logic} target
	 * @returns {ObservableItem}
	 */
	function MethodCount(target, callback) {
		this._method = {};
		this._callback = callback;

		// 定義オブジェクトを取得
		var defObj = target.__controllerContext ? target.__controllerContext.controllerDef
				: target.__logicContext.logicDef;

		for ( var p in defObj) {
			if ($.isFunction(defObj[p])) {
				this._method[p] = 0;
			}
		}
	}
	$.extend(MethodCount.prototype, {
		count: function(method) {
			this._method[method]++;
			if (this._callback) {
				return this._callback(method);
			}
		},
		get: function(method) {
			return this._method[method];
		},
		registCallback: function(callback) {
			this._callback = callback;
		}
	});

	// =========================================================================
	//
	// Controller
	//
	// =========================================================================

	/**
	 * コンテキストメニューコントローラ
	 */
	var contextMenuController = {

		/**
		 * @memberOf h5.devtool.ui.ContextMenuController
		 */
		__name: 'h5.devtool.ui.ContextMenuController',

		_contextMenu: null,

		contextMenuExp: '',

		targetAll: true,

		__construct: function(context) {
			if (context.args) {
				var targetAll = context.args.targetAll;
				if (targetAll != undefined) {
					this.targetAll = context.args.targetAll;
				}
				var contextMenuExp = context.args.contextMenuExp;
				if (contextMenuExp != undefined) {
					this.contextMenuExp = context.args.contextMenuExp;
				}
			}
		},

		__ready: function(context) {
			var root = $(this.rootElement);
			var targetAll = root.attr('data-targetall');
			if (targetAll != undefined) {
				if (/false/i.test(targetAll)) {
					targetAll = false;
				}
				this.targetAll = !!targetAll;
			}
			var contextMenuExp = root.attr('data-contextmenuexp');
			if (contextMenuExp != undefined) {
				this.contextMenuExp = context.args.contextMenuExp;
			}
			this.close();
		},

		_getContextMenu: function(exp) {
			return this.$find('> .contextMenu' + (exp || this.contextMenuExp));
		},

		close: function(selected) {
			var $contextMenu = this.$find('> .contextMenu');

			if (!$contextMenu.hasClass('open')) {
				// 既に閉じているなら何もしない(イベントもあげない)
				return;
			}
			// selectMenuItemイベントを上げる
			// 選択されたアイテムがあれば、それを引数に入れる
			// そもそもopenしていなかったらイベントは上げない
			this.trigger('selectMenuItem', {
				selected: selected ? selected : null
			});

			$contextMenu.css({
				display: 'none'
			});
			$contextMenu.removeClass('open');
			// イベントを上げる
			this.trigger('hideCustomMenu');
		},

		_open: function(context, exp) {
			var $contextMenu = this._getContextMenu(exp);

			// イベントを上げる
			// 既にopenしていたらイベントは上げない
			if (!$contextMenu.hasClass('open')) {
				var e = this.trigger('showCustomMenu', {
					orgContext: context
				});
				if (e.isDefaultPrevented()) {
					// preventDefaultされていたらメニューを出さない
					return;
				}
			}

			$contextMenu.css({
				display: 'block',
				visibility: 'hidden',
				left: 0,
				top: 0
			});
			// contextMenu要素のスタイルの取得、offsetParentの取得はjQueryを使わないようにしている
			// jQuery2.0.Xで、windowに属していない、別ウィンドウ内の要素についてwindow.getComputedStyle(elm)をしており、
			// IEだとそれが原因でエラーになるため。
			$contextMenu.addClass('open');
			var offsetParent = getOffsetParent($contextMenu);
			var offsetParentOffset = $(offsetParent).offset();
			var left = context.event.pageX - offsetParentOffset.left;
			var top = context.event.pageY - offsetParentOffset.top;
			var outerWidth = getOuterWidth($contextMenu);
			var outerHeight = getOuterHeight($contextMenu);
			var scrollLeft = scrollPosition('Left')();
			var scrollTop = scrollPosition('Top')();
			var windowWidth = getDisplayArea('Width');
			var windowHeight = getDisplayArea('Height');
			var windowRight = scrollLeft + windowWidth;
			var windowBottom = scrollTop + windowHeight;
			var right = left + outerWidth;
			if (right > windowRight) {
				left = windowRight - outerWidth;
				if (left < scrollLeft)
					left = scrollLeft;
			}
			var bottom = top + outerHeight;
			if (bottom > windowBottom) {
				top = top - outerHeight;
				if (top < scrollTop)
					top = scrollTop;
			}

			initSubMenu($contextMenu, right, top);

			$contextMenu.css({
				visibility: 'visible',
				left: left,
				top: top
			});

			function initSubMenu(menu, _right, _top) {
				menu.find('> .dropdown-submenu > .dropdown-menu').each(function() {
					var subMenu = $(this);
					var nextRight;
					var display = subMenu[0].style.display;
					subMenu.css({
						display: 'block'
					});
					var subMenuWidth = subMenu.outerWidth(true);
					if (subMenuWidth > windowRight - _right) {
						subMenu.parent().addClass('pull-left');
						nextRight = _right - subMenuWidth;
					} else {
						subMenu.parent().removeClass('pull-left');
						nextRight = _right + subMenuWidth;
					}

					var parent = subMenu.parent();
					var subMenuTop = _top + parent.position().top;
					var subMenuHeight = subMenu.outerHeight(true);
					if (subMenuHeight > windowBottom - subMenuTop) {
						subMenuTop = subMenuTop - subMenuHeight + parent.height();
						subMenu.css({
							top: 'auto',
							bottom: '0'
						});
					} else {
						subMenu.css({
							top: '0',
							bottom: 'auto'
						});
					}

					initSubMenu(subMenu, nextRight, subMenuTop);

					subMenu.css({
						display: display
					});
				});
			}

			//hifiveから流用(13470)
			function getDisplayArea(prop) {
				var compatMode = (document.compatMode !== 'CSS1Compat');
				var e = compatMode ? document.body : document.documentElement;
				return h5.env.ua.isiOS ? window['inner' + prop] : e['client' + prop];
			}

			//hifiveから流用(13455)
			function scrollPosition(propName) {
				var compatMode = (document.compatMode !== 'CSS1Compat');
				var prop = propName;

				return function() {
					// doctypeが「XHTML1.0 Transitional DTD」だと、document.documentElement.scrollTopが0を返すので、互換モードを判定する
					// http://mokumoku.mydns.jp/dok/88.html
					var elem = compatMode ? document.body : document.documentElement;
					var offsetProp = (prop === 'Top') ? 'Y' : 'X';
					return window['page' + offsetProp + 'Offset'] || elem['scroll' + prop];
				};
			}
		},

		/**
		 * コンテキストメニューを出す前に実行するフィルタ。 falseを返したらコンテキストメニューを出さない。
		 * 関数が指定された場合はその関数の実行結果、セレクタが指定された場合は右クリック時のセレクタとマッチするかどうかを返す。
		 */
		_filter: null,

		/**
		 * コンテキストメニューを出すかどうかを判定するフィルタを設定する。 引数には関数またはセレクタを指定できる。
		 * 指定する関数はcontextを引数に取り、falseを返したらコンテキストメニューを出さないような関数を指定する。
		 * セレクタを指定した場合は、右クリック時のevent.targetがセレクタにマッチする場合にコンテキストメニューを出さない。
		 *
		 * @memberOf ___anonymous46_5456
		 * @param selectorOrFunc
		 */
		setFilter: function(selectorOrFunc) {
			if (selectorOrFunc == null) {
				this._filter = null;
			} else if ($.isFunction(selectorOrFunc)) {
				// 渡された関数をthis._filterにセット
				this._filter = selectorOrFunc;
			} else if (typeof (selectorOrFunc) === 'string') {
				this._filter = function(context) {
					// targetがセレクタとマッチしたらreturn false;
					if ($(context.event.target).filter(selectorOrFunc).length) {
						return false;
					}
				};
			}
		},

		'{rootElement} contextmenu': function(context) {
			this.close();
			// _filterがfalseを返したら何もしない
			if (this._filter && this._filter(context) === false) {
				return;
			}
			if (this.targetAll) {
				context.event.preventDefault();
				context.event.stopPropagation();
				this._open(context);
			}
		},

		'{document.body} click': function(context) {
			this.close();
		},

		'{document.body} contextmenu': function(context) {
			this.close();
		},

		'.contextMenuBtn contextmenu': function(context) {
			context.event.preventDefault();
			context.event.stopPropagation();
			var current = context.event.currentTarget;
			var exp = $(current).attr('data-contextmenuexp');
			this._open(context, exp);
		},

		'> .contextMenu .dropdown-menu click': function(context) {
			context.event.stopPropagation();
			this.close();
		},
		//
		//		'> .contextMenu .dropdown-submenu click': function(context) {
		//			context.event.stopPropagation();
		//		},
		//
		//		'> .contextMenu contextmenu': function(context) {
		//			context.event.stopPropagation();
		//		},
		//
		//		'> .contextMenu click': function(context) {
		//			context.event.stopPropagation();
		//		},

		'> .contextMenu li a click': function(context) {
			context.event.stopPropagation();
			this.close(context.event.target);
		}
	};
	h5.core.expose(contextMenuController);

	/**
	 * コントローラデバッグコントローラ<br>
	 * デバッグコントローラの子コントローラ
	 *
	 * @name h5.devtool.ControllerDebugController
	 */
	var controllerDebugController = {
		/**
		 * @name h5.devtool.ControllerDebugController
		 */
		__name: 'h5.devtool.ControllerDebugController',
		/**
		 * @name h5.devtool.ControllerDebugController
		 */
		win: null,
		/**
		 * @name h5.devtool.ControllerDebugController
		 */
		$info: null,
		/**
		 * 選択中のコントローラまたはロジック
		 *
		 * @name h5.devtool.ControllerDebugController
		 */
		selectedTarget: null,

		__init: function() {
			// 既存のコントローラにコントローラ定義オブジェクトを持たせる(hifive1.1.8以前用)
			// このコントローラがコントローラ定義オブジェクトを持ってるかどうかでhifiveのバージョン判定
			if (!this.__controllerContext.controllerDef) {
				// コントローラを取得(__initの時点なので、このコントローラは含まれていない)。
				var controllers = h5.core.controllerManager.getAllControllers();
				for (var i = 0, l = controllers.length; i < l; i++) {
					addControllerDef(controllers[i], controllers[i]);
				}
			}
		},
		/**
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param context
		 */
		__ready: function(context) {

			// 初期化処理
			this.win = context.args.win;
			setCSS(this.win, H5DEBUG_STYLE, SPECIAL_H5DEBUG_STYLE);
			setCSS(window, H5PAGE_STYLE);
			// コントローラの詳細表示エリア
			view.append(this.$find('.left'), 'target-list');
			view.append(this.$find('.right'), 'controller-detail');
			view.append(this.$find('.right'), 'logic-detail');
			this.$find('.right>.detail').css('display', 'none');

			// この時点ですでにバインドされているコントローラがあった場合、h5controllerboundイベントで拾えないので
			// コントローラリストの更新を行う
			// TODO すでにバインド済みのコントローラに対してはアスペクトを掛けられないので、ログが出ない。
			// コントローラ化済みのものに対してログを出すようにする機構が必要。
			// h5controllerboundが上がってくるのは__initの後、__readyの前なので、__initはその前に書き換える必要がある
			var controllers = h5.core.controllerManager.getAllControllers();
			for (var i = 0, l = controllers.length; i < l; i++) {
				this._h5controllerbound(controllers[i]);
			}
		},
		/**
		 * クローズ時のイベント
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		'{.h5devtool} close': function() {
			this.removeOverlay(true);
		},
		/**
		 * 左側の何もない箇所がクリックされたらコントローラの選択なしにする
		 */
		'{.h5devtool} leftclick': function() {
			this.unfocus();
		},

		/**
		 * コントローラが新たにバインドされた
		 *
		 * @memberOf h5.devtool.DebugController
		 * @param context
		 */
		'{document} h5controllerbound': function(context) {
			var target = context.evArg;
			// すでにdispose済みだったら何もしない
			if (isDisposed(target)) {
				return;
			}
			this._h5controllerbound(context.evArg);
		},

		/**
		 * openerがあればそっちのdocumentにバインドする
		 */
		'{window.opener.document} h5controllerbound': function(context) {
			this._h5controllerbound(context.evArg);
		},
		_h5controllerbound: function(controller) {
			this.appendTargetToList(controller);
		},

		/**
		 * コントローラがアンバインドされた
		 *
		 * @memberOf h5.devtool.DebugController
		 * @param context
		 */
		'{document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context.evArg);
		},
		/**
		 * openerがあればそっちのdocumentにバインドする
		 */
		'{window.opener.document} h5controllerunbound': function(context) {
			this._h5controllerunbound(context.evArg);
		},
		_h5controllerunbound: function(controller) {
			var $selected = this.$find('.selected');
			if (controller === this.getTargetFromElem($selected)) {
				this.unfocus();
			}
			this.removeControllerList(controller);
		},
		/**
		 * マウスオーバーでコントローラのバインド先オーバレイ表示(PC用)
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name mouseover': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			var target = this.getTargetFromElem($el);
			this.removeOverlay();
			if (!isDisposed(target) && target.__controllerContext) {
				// disposeされていないコントローラならオーバレイを表示
				$el.data('h5devtool-overlay', this.overlay(target.rootElement,
						target.__controllerContext.isRoot ? 'root' : 'child'));
			}
		},
		/**
		 * マウスアウト
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name mouseout': function(context, $el) {
			if (hasTouchEvent) {
				return;
			}
			this.removeOverlay();
		},

		/**
		 * コントローラリスト上のコントローラをクリック
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param context
		 * @param $el
		 */
		'.targetlist .target-name click': function(context, $el) {
			if ($el.hasClass('selected')) {
				// 既に選択済み
				return;
			}
			var target = this.getTargetFromElem($el);
			this.$find('.target-name').removeClass('selected');
			$el.addClass('selected');
			this.setTarget(target);
			// ターゲットリストと紐づいているオーバレイ要素を取得
			var $overlay = $el.data('h5devtool-overlay');
			if ($overlay) {
				this.removeOverlay(true, $overlay);
				// ボーダーだけのオーバレイに変更
				$('.h5devtool-overlay').addClass('borderOnly');
			}
		},

		setTarget: function(target) {
			this.selectedTarget = target;
			this.setDetail(target);
		},
		/**
		 * イベントハンドラにマウスオーバーで選択(PC用)
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		' .eventHandler li:not(.selected) mouseover': function(context, $el) {
			this.selectEventHandler($el);
		},
		/**
		 * イベントハンドラをクリックで選択(タブレット用)
		 *
		 * @memberOf h5.devtool.DebugController
		 */
		'.eventHandler li:not(.selected) click': function(context, $el) {
			this.selectEventHandler($el);
		},
		/**
		 * イベントハンドラからカーソルを外した時(PC用)
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		' .eventHandler li.selected mouseleave': function(context, $el) {
			this.selectEventHandler(null);
		},

		/**
		 * イベントハンドラの選択
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param $el
		 */
		selectEventHandler: function($el) {
			this.$find('.eventHandler li').removeClass('selected');
			this.removeOverlay();
			if ($el == null) {
				return;
			}
			$el.addClass('selected');
			var controller = this.getTargetFromElem(this.$find('.target-name.selected'));
			var key = $.trim($el.find('.key').text());
			var $target = getTargetFromEventHandlerKey(key, controller);

			// 取得結果を保存。これはクリックしてイベントを発火させるとき用です。
			// 再度mosueoverされ場合は新しく取得しなおします。
			$el.data('h5devtool-eventTarget', $target);
			this.overlay($target, 'event-target');

			// 実行メニューの表示
			var $select = $el.closest('li').find('select.eventTarget').html('');
			if (!$target.length) {
				var $option = $(devtoolWindow.document.createElement('option'));
				$option.text('該当なし');
				$select.append($option);
				$select.attr('disabled', 'disabled');
			} else {
				$target.each(function() {
					var $option = $(devtoolWindow.document.createElement('option'));
					$option.data('h5devtool-eventTarget', this);
					$option.text(formatDOM(this));
					$select.append($option);
				});
			}
		},

		/**
		 * イベントを実行
		 */
		' .eventHandler .trigger click': function(context, $el) {
			var evName = $.trim($el.closest('li').find('.key').text()).match(/ (\S+)$/)[1];
			var target = $el.closest('.menu').find('option:selected').data('h5devtool-eventTarget');
			if (target) {
				// TODO evNameがmouse/keyboard/touch系ならネイティブのイベントでやる
				$(target).trigger(evName);
			} else {
				alert('イベントターゲットがありません');
			}
		},
		/**
		 * タブの切り替え
		 */
		'{.h5devtool} tabChange': function(context) {
			var target = context.evArg;
			if (target !== 'eventHandler') {
				// イベントハンドラの選択状態を解除
				this.removeOverlay();
				this.$find('.eventHandler li').removeClass('selected');
			}
		},
		/**
		 * 詳細画面(右側画面)をコントローラまたはロジックを基に作成。nullが渡されたら空白にする
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param target
		 */
		setDetail: function(target) {
			if (target == null) {
				this.$find('.detail .tab-content>*').html('');
				return;
			}

			// methodCountオブジェクトを持たせる
			if (!target._h5devtoolContext.methodCount._method) {
				target._h5devtoolContext.methodCount._method = new MethodCount(target);
			}

			// 詳細ビューに表示されているコントローラを取得
			var controllers = h5.core.controllerManager.getControllers(this.$find('.detail'), {
				deep: true
			});

			// コントローラの場合はコントローラの詳細ビューを表示
			if (target.__controllerContext) {
				this._showControllerDetail(target);
			} else {
				// ロジックの場合はロジックの詳細ビューを表示
				this._showLogicDetail(target);
			}

			// 元々詳細ビューにバインドされていたコントローラをアンバインド
			for (var i = 0, l = controllers.length; i < l; i++) {
				controllers[i].dispose();
			}
		},
		/**
		 * コントローラの詳細表示
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param controller
		 */
		_showControllerDetail: function(controller) {
			this.$find('.logic-detail').css('display', 'none');
			this.$find('.controller-detail').css('display', 'block');

			// メソッド(イベントハンドラ以外)とイベントハンドラを列挙
			var methods = [];
			var eventHandlers = [];
			for ( var p in controller._h5devtoolContext.methodCount._method) {
				if (p.indexOf(' ') === -1) {
					methods.push(p);
				} else {
					eventHandlers.push(p);
				}
			}

			methods.sort(function(a, b) {
				// lifecycle, public, privateの順でソート
				// lifecycleはライフサイクルの実行順、public、privateは辞書順
				if ($.inArray(a, LIFECYCLE_METHODS) !== -1
						&& $.inArray(b, LIFECYCLE_METHODS) !== -1) {
					// 両方ともライフサイクルメソッド
					return $.inArray(a, LIFECYCLE_METHODS) - $.inArray(b, LIFECYCLE_METHODS);
				}
				// lifecycle, public, privateの順でソート
				var ret = 0;
				ret -= $.inArray(a, LIFECYCLE_METHODS) >= 0 ? 1 : 0;
				ret += $.inArray(b, LIFECYCLE_METHODS) >= 0 ? 1 : 0;
				ret -= h5.u.str.startsWith(a, '_') && $.inArray(a, LIFECYCLE_METHODS) === -1 ? -1
						: 0;
				ret += h5.u.str.startsWith(b, '_') && $.inArray(b, LIFECYCLE_METHODS) === -1 ? -1
						: 0;
				return ret === 0 ? (a > b ? 1 : -1) : ret;
			});

			this._updateEventHandlerView({
				controller: controller.__controllerContext.controllerDef,
				eventHandlers: eventHandlers,
				_funcToStr: funcToStr,
				methodCount: controller._h5devtoolContext.methodCount
			});

			this._updateMethodView({
				defObj: controller.__controllerContext.controllerDef,
				methods: methods,
				_funcToStr: funcToStr,
				methodCount: controller._h5devtoolContext.methodCount
			});

			controller._h5devtoolContext.methodCount
					.registCallback(this
							.own(function(method) {
								// 表示中であればカウントを更新
								if (this.selectedTarget !== controller) {
									return;
								}
								var $targetLi = null
								if ($.inArray(method, methods) !== -1
										&& this
												.$find('.controller-detail .tab-content .method.active').length) {
									$targetLi = this.$find(
											'.controller-detail .tab-content .method.active .name:contains('
													+ method + ')').parent();
								} else if ($.inArray(method, eventHandlers) !== -1
										&& this
												.$find('.controller-detail .tab-content .eventHandler.active').length) {
									$targetLi = this.$find(
											'.controller-detail .tab-content .eventHandler.active .key:contains('
													+ method + ')').parent();
								}
								if (!$targetLi || !$targetLi.length) {
									return;
								}
								var $count = $targetLi.find('.count');
								$count.text(parseInt($count.text()) + 1);
							}));

			// ログ
			var logAry = controller._h5devtoolContext.debugLog;
			h5.core.controller(this.$find('.controller-detail .trace'), traceLogController, {
				traceLogs: logAry,
				// トレースログと違ってログのコントローラからコントローラデバッグコントローラが辿れなくなるため
				// 引数で渡してログコントローラに覚えさせておく
				_parentControllerDebugCtrl: this
			});

			// その他情報
			var childControllerProperties = getChildControllerProperties(controller);
			var childControllerNames = [];
			for (var i = 0, l = childControllerProperties.length; i < l; i++) {
				childControllerNames.push(controller[childControllerProperties[i]].__name);
			}
			view.update(this.$find('.controller-detail .tab-content .otherInfo'),
					'controller-otherInfo', {
						controller: controller,
						childControllerNames: childControllerNames,
						_formatDOM: formatDOM
					});
		},
		_updateEventHandlerView: function(obj) {
			var $target = this.$find('.controller-detail .tab-content .eventHandler');
			view.update($target, 'eventHandler-list', obj);
		},
		_updateMethodView: function(obj) {
			var $target = this.$find('.controller-detail .tab-content .method');
			view.update($target, 'method-list', obj);
		},
		/**
		 * 表示中のタブが押されたら更新する
		 */
		'.detail>.nav-tabs>.active click': function(context, $el) {
			if ($el.data('tab-page') === 'method' || $el.data('tab-page') === 'eventHandler') {
				var target = this.getTargetFromElem(this.$find('.target-name.selected'));
				this.setDetail(target);
			}
		},

		/**
		 * ロジックの詳細表示
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param logic
		 */
		_showLogicDetail: function(logic) {
			this.$find('.logic-detail').css('display', 'block');
			this.$find('.controller-detail').css('display', 'none');

			// メソッドリスト
			// public, privateの順で辞書順ソート
			var privateMethods = [];
			var publicMethods = [];
			for ( var p in logic.__logicContext.logicDef) {
				if ($.isFunction(logic.__logicContext.logicDef[p])) {
					// メソッド
					// publicかprivateかを判定する
					if (h5.u.str.startsWith(p, '_')) {
						privateMethods.push(p);
					} else {
						publicMethods.push(p);
					}
				}
			}

			// ソート
			privateMethods.sort();
			publicMethods.sort();
			var methods = publicMethods.concat(privateMethods);

			view.update(this.$find('.logic-detail .tab-content .method'), 'method-list', {
				defObj: logic.__logicContext.logicDef,
				methods: methods,
				_funcToStr: funcToStr,
				methodCount: logic._h5devtoolContext.methodCount
			});

			logic._h5devtoolContext.methodCount.registCallback(this.own(function(method) {
				// 表示中であればカウントを更新
				if (this.selectedTarget !== logic) {
					return;
				}
				var $targetLi = null
				if ($.inArray(method, methods) !== -1
						&& this.$find('.logic-detail .tab-content .method.active').length) {
					$targetLi = this.$find(
							'.logic-detail .tab-content .method.active .name:contains(' + method
									+ ')').parent();
				}
				if (!$targetLi || !$targetLi.length) {
					return;
				}
				var $count = $targetLi.find('.count');
				$count.text(parseInt($count.text()) + 1);
			}));

			// ログ
			var logAry = logic._h5devtoolContext.debugLog;
			h5.core.controller(this.$find('.logic-detail .trace'), traceLogController, {
				traceLogs: logAry,
				// トレースログと違ってログのコントローラからコントローラデバッグコントローラが辿れなくなるため
				// 引数で渡してログコントローラに覚えさせておく
				_parentControllerDebugCtrl: this
			});

			// その他情報
			view.update(this.$find('.logic-detail .tab-content .otherInfo'), 'logic-otherInfo', {
				defObj: logic.__logicContext.logicDef,
				instanceName: logic._h5devtoolContext.instanceName
			});
		},

		/**
		 * エレメントにコントローラまたはロジックを持たせる
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param el
		 * @param target
		 */
		setTargetToElem: function(el, target) {
			$(el).data('h5devtool-target', target);
		},
		/**
		 * エレメントに覚えさせたコントローラまたはロジックを取得する
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param el
		 * @returns {Controller|Logic}
		 */
		getTargetFromElem: function(el) {
			return $(el).data('h5devtool-target');
		},
		/**
		 * 選択を解除
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		unfocus: function() {
			this.setDetail(null);
			this.$find('.target-name').removeClass('selected');
			this.removeOverlay(true);
		},
		/**
		 * 引数に指定された要素にオーバレイ
		 *
		 * @param elem オーバレイ対象要素
		 * @param classNames オーバレイ要素に追加するクラス名
		 * @returns 追加したオーバレイ要素
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		overlay: function(elem, classNames) {
			var className = ($.isArray(classNames) ? classNames : [classNames]).join(' ');
			var $el = $(elem);
			var $ret = $();
			$el.each(function() {
				var $overlay = $(view.get('overlay', {
					cls: className
				}));

				var width = $(this).outerWidth();
				var height = $(this).outerHeight();
				// documentオブジェクトならoffset取得できないので、0,0にする
				var offset = $(this).offset() || {
					top: 0,
					left: 0
				};

				$overlay.css({
					width: width,
					height: height,
					top: offset.top,
					left: offset.left
				});
				var $borderTop = $overlay.find('.border.top');
				var $borderRight = $overlay.find('.border.right');
				var $borderBottom = $overlay.find('.border.bottom');
				var $borderLeft = $overlay.find('.border.left');

				$borderTop.css({
					top: 0,
					left: 0,
					width: width,
					height: OVERLAY_BORDER_WIDTH
				});
				$borderRight.css({
					top: 0,
					left: width,
					width: OVERLAY_BORDER_WIDTH,
					height: height
				});
				$borderBottom.css({
					top: height,
					left: 0,
					width: width,
					height: OVERLAY_BORDER_WIDTH
				});
				$borderLeft.css({
					top: 0,
					left: 0,
					width: OVERLAY_BORDER_WIDTH,
					height: height
				});

				$(window.document.body).append($overlay);
				$ret = $ret.add($overlay);
			});
			return $ret;
		},
		/**
		 * オーバレイの削除。deleteAllにtrueが指定された場合ボーダーだけのオーバーレイも削除
		 *
		 * @param {Boolean} [deleteAll=false] ボーダーだけのオーバレイも削除するかどうか
		 * @param {jQuery} $exclude 除外するオーバーレイ要素
		 * @memberOf h5.devtool.ControllerDebugController
		 */
		removeOverlay: function(deleteAll, $exclude) {
			var $target = deleteAll ? $('.h5devtool-overlay')
					: $('.h5devtool-overlay:not(.borderOnly)');
			($exclude ? $target.not($exclude) : $target).remove();
		},
		/**
		 * コントローラまたはロジックをコントローラリストに追加
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param target
		 */
		appendTargetToList: function(target, $ul) {
			if (h5.u.str.startsWith(target.__name, 'h5.devtool')) {
				// デバッグ用にバインドしたコントローラは無視
				return;
			}
			// _h5devtoolContextを持たせる
			target._h5devtoolContext = target._h5devtoolContext || {};

			$ul = $ul || this.$find('.targetlist:first');
			// ログ用のObservableArrayを持たせる
			if (!target._h5devtoolContext.debugLog) {
				target._h5devtoolContext.debugLog = createLogArray();
			}

			// メソッド・イベントハンドラの実行回数を保持するオブジェクトを持たせる
			target._h5devtoolContext.methodCount = new MethodCount(target);

			if (target.__controllerContext) {
				// コントローラの場合
				var isRoot = target.__controllerContext.isRoot;
				var $li = $(view.get('target-list-part', {
					name: target.__name,
					cls: isRoot ? 'root' : 'child'
				}), $ul[0].ownerDocument);
				// データにコントローラを持たせる
				this.setTargetToElem($li.children('.target-name'), target);
				$ul.append($li);
				// 子コントローラも追加
				var childControllerProperties = getChildControllerProperties(target);
				if (childControllerProperties.length) {
					for (var i = 0, l = childControllerProperties.length; i < l; i++) {
						// 『コントローラ名#定義名』を覚えさせておく
						var p = childControllerProperties[i];
						var controller = target[p];
						controller._h5devtoolContext = controller._h5devtoolContext || {};
						controller._h5devtoolContext.instanceName = target.__name + '#' + p;
						view.append($li, 'target-list');
						this.appendTargetToList(controller, $li.find('ul:last'));
					}
				}
				// ロジックを列挙して追加
				var isAppendedLogiccUl = false;
				for ( var p in target) {
					if (h5.u.str.endsWith(p, 'Logic')) {
						// ロジックがある場合、ロジックのulを追加
						if (!isAppendedLogiccUl) {
							view.append($li, 'target-list');
							isAppendedLogiccUl = true;
						}
						// 『コントローラ名#定義名』を覚えさせておく
						target[p]._h5devtoolContext = target[p]._h5devtoolContext || {};
						target[p]._h5devtoolContext.instanceName = target.__name + '#' + p;
						this.appendTargetToList(target[p], $li.find('ul:last'));
					}
				}
			} else {
				// ロジックの場合
				// コントローラ名とログ用のObserbableArrayを持たせる
				target._h5devtoolContext = target._h5devtoolContext || {
					name: target.__name + '#' + p,
					debugLog: createLogArray()
				};
				var $li = $(view.get('target-list-part', {
					name: target.__name,
					cls: 'root'
				}), $ul[0].ownerDocument);

				// データにロジックを持たせる
				this.setTargetToElem($li.children('.target-name'), target);

				// 子コントローラの後にロジック追加
				$ul.append($li);
			}
		},
		/**
		 * コントローラをコントローラリストから削除
		 *
		 * @memberOf h5.devtool.ControllerDebugController
		 * @param controller
		 */
		removeControllerList: function(controller) {
			var that = this;
			this.$find('.targetlist .target-name').each(function() {
				if (that.getTargetFromElem(this) === controller) {
					$(this).closest('li').remove();
					return false;
				}
			});
		}
	};
	h5.core.expose(controllerDebugController);

	/**
	 * デバッガの設定を行うコントローラ
	 *
	 * @name h5.devtool.SettingsController
	 */
	var settingsController = {
		/**
		 * @memberOf h5.devtool.SettingsController
		 */
		__name: 'h5.devtool.SettingsController',

		/**
		 * @memberOf h5.devtool.SettingsController
		 */
		__ready: function() {
			// settingsをバインドする
			view.bind(this.rootElement, h5devtoolSettings);

			// -------------------------------------------------
			// デバッガ設定変更時のイベント
			// -------------------------------------------------
			h5devtoolSettings.addEventListener('change', function(e) {
				for ( var p in e.props) {
					var val = e.props[p].newValue;
					switch (p) {
					case 'LogMaxNum':
						for (var i = 0, l = logArrays.length; i < l; i++) {
							if (val >= logArrays[i].length) {
								continue;
							}
							logArrays[i].splice(0, logArrays[i].length - val);
						}
					}
				}
			});
		},
		/**
		 * @memberOf h5.devtool.SettingsController
		 */
		'.set click': function() {
			var setObj = {};
			this.$find('input').each(function() {
				setObj[this.name] = this.value;
			});
			try {
				h5devtoolSettings.set(setObj);
			} catch (e) {
				// TODO エラー処理
				devtoolWindow.alert(e.message);
			}
		}
	};
	h5.core.expose(settingsController);

	/**
	 * トレースログ、ロガーの共通処理を抜き出したコントローラ
	 *
	 * @name h5.devtool.BaseLogConttoller
	 */
	var baseLogController = {
		/**
		 * @memberOf h5.devtool.BaseLogController
		 */
		__name: 'h5.devtool.BaseLogController',

		/**
		 * 右クリックコントローラ
		 */
		_contextMenuController: h5.devtool.ui.ContextMenuController,

		/**
		 * ログリストが一番下までスクロールされているかどうか
		 *
		 * @memberOf h5.devtool.BaseLogController
		 */
		_isScrollLast: false,

		/**
		 * ログ配列
		 *
		 * @memberOf h5.devtool.BaseLogController
		 */
		_logArray: null,

		/**
		 * logArrayからHTMLに変換する関数 setCreateHTMLで登録する
		 *
		 * @memberOf h5.devtool.BaseLogController
		 */
		_createLogHTML: function() {},

		_selectLogObject: null,

		_parentControllerDebugCtrl: null,

		__ready: function(context) {
			this._contextMenuController.contextMenuExp = '.logContextMenu';
			this._contextMenuController.setFilter('*:not(.trace-list>li>*)');

			// コントローラデバッグコントローラを参照できるように覚えておく
			this._parentControllerDebugCtrl = context.args._parentControllerDebugCtrl
					|| this.parentController.parentController._controllerDebugController;
		},
		/**
		 * ログ配列のセット
		 *
		 * @memberOf h5.devtool.BaseLogController
		 */
		setLogArray: function(logArray, target) {
			logArray._viewBindTarget = target;
			this._logArray = logArray;
			// logArrayにハンドラを登録して、ログの更新があった時にdispatchEventしてもらう
			logArray.addEventListener('logUpdate', this.own(this._update));
			if (this._logArray.length) {
				this._updateView();
			}
			// scrollイベントはバブリングしないので、要素追加後にbindでイベントハンドラを追加
			$(target).bind('scroll', this.ownWithOrg(function(elm, ev) {
				// 一番下までスクロールされているか。30pxの余裕を持たせて判定
				this._isScrollLast = elm.scrollTop > elm.scrollHeight - elm.clientHeight - 30;
			}));
		},
		setCreateLogHTML: function(func) {
			this._createLogHTML = func;
		},
		_update: function() {
			// ログ出力箇所が表示されていなければ(タブがactiveになっていなければ)なにもしない
			if (!$(this.rootElement).hasClass('active')) {
				return;
			}

			// ログを更新する。
			// 前のlogUpdateがLOG_DELAYミリ秒以内であれば、前のログも合わせてLOG_DELAYミリ秒後に表示する
			// LOG_DELAYミリ秒の間隔をあけずに立て続けにlogUpdateが呼ばれた場合はログは出ない。
			// LOG_DELAYミリ秒の間にlogUpdateが呼ばれなかった時に今まで溜まっていたログを出力する。
			// ただし、MAX_LOG_DELAY経ったら、logUpdateの間隔に関わらずログを出力する

			// LOG_DELAYミリ秒後に出力するタイマーをセットする。
			// すでにタイマーがセット済みなら何もしない(セット済みのタイマーで出力する)
			var logArray = this._logArray;
			logArray._logUpdatedInMaxDelay = true;
			if (logArray._logDelayTimer) {
				clearTimeout(logArray._logDelayTimer);
			}
			logArray._logDelayTimer = setTimeout(this.own(function() {
				this._updateView();
			}), LOG_DELAY);
		},
		_updateView: function() {
			// コントローラがdisposeされていたら何もしない(非同期で呼ばれるメソッドなのであり得る)
			if (!this.__controllerContext) {
				// コントローラがdisposeされていたら何もしない(非同期で呼ばれるメソッドなのであり得る)
				return;
			}
			var logArray = this._logArray;
			clearTimeout(logArray._logDelayTimer);
			clearTimeout(logArray._logMaxDelayTimer);
			logArray._logDelayTimer = null;
			logArray._logMaxDelayTimer = null;

			// ポップアップウィンドウのDOM生成がIEだと重いのでinnerHTMLでやっている。
			// innerHTMLを更新(html()メソッドが重いので、innerHTMLでやっている)
			var logList = logArray._viewBindTarget;
			if (logList) {
				logList.innerHTML = this._createLogHTML(logArray);
			}

			// 元々一番下までスクロールされていたら、一番下までスクロールする
			if (this._isScrollLast) {
				logList.scrollTop = logList.scrollHeight - logList.clientHeight;
			}

			// MAX_LOG_DELAYのタイマーをセットする
			logArray._logUpdatedInMaxDelay = false;
			logArray._logMaxDelayTimer = setTimeout(this.own(function() {
				if (logArray._logUpdatedInMaxDelay) {
					this._updateView();

				}
			}), MAX_LOG_DELAY);
		},

		'{rootElement} tabSelect': function() {
			this._updateView();
		},

		'{rootElement} showCustomMenu': function(context) {
			this._unselect();
			var orgContext = context.evArg.orgContext;
			var $li = $(orgContext.event.target).closest('li');
			$li.addClass('selected');
			this._selectLogObject = this._logArray.get($li.attr('data-h5devtool-logindex'));
		},

		'{rootElement} hideCustomMenu': function(context) {
			this._unselect();
		},

		_unselect: function() {
			this.$find('.trace-list>li').removeClass('selected');
		},

		'.showFunction click': function(context, $el) {
			// エレメントからログオブジェクトを取得
			// コントローラまたはロジックを取得
			var ctrlOrLogic = this._selectLogObject.target;
			var debugCtrl = this._parentControllerDebugCtrl;
			// コントローラタブに切替
			var $controllerTab = $(this.rootElement).parents('.h5devtool').find(
					'*[data-tab-page="debug-controller"]');
			if (!$controllerTab.hasClass('active')) {
				$controllerTab.trigger('click');
				debugCtrl.setTarget(ctrlOrLogic);
			}

			// 対応するコントローラまたはロジックを選択
			debugCtrl.$find('.target-name').each(function() {
				if (debugCtrl.getTargetFromElem(this) === ctrlOrLogic) {
					$(this).trigger('mouseover');
					$(this).trigger('click');
					return false;
				}
			});


			// 詳細コントローラバインド後なので、以降は非同期で処理する
			var message = this._selectLogObject.message;
			setTimeout(function() {
				// メソッドまたはイベントハンドラタブを選択
				// メソッド名を取得
				var method = $.trim(message.slice(message.indexOf('#') + 1));
				// ログメッセージからイベントハンドラなのかメソッドなのか判定する
				// メソッド名に空白文字がありかつターゲットがコントローラならイベントハンドラ
				var isEventHandler = method.indexOf(' ') !== -1 && ctrlOrLogic.__controllerContext;
				var tabCls = isEventHandler ? 'eventHandler' : 'method';
				// イベントハンドラのタブを選択
				var $tab = debugCtrl.$find('.controller-detail>.nav-tabs>*[data-tab-page="'
						+ tabCls + '"]');
				if (!$tab.hasClass('active')) {
					$tab.trigger('click');
				}
				var $activeList = debugCtrl
						.$find('.controller-detail .' + tabCls + ' .method-list');


				// 該当箇所までスクロール
				var scrollVal = 0;
				var textElmSelector = isEventHandler ? '.key' : '.name';
				var li = null;
				$activeList.find('li').each(function() {
					if ($.trim($(this).find(textElmSelector).text()) === method) {
						scrollVal = this.offsetTop - this.parentNode.offsetTop;
						li = this;
						return false;
					}
				});
				if (li) {
					$activeList.parent().scrollTop(scrollVal);
				}
			}, 0);
		}
	};
	h5.core.expose(baseLogController);

	/**
	 * トレースログコントローラ<br>
	 *
	 * @name h5.devtool.TraceLogController
	 */
	var traceLogController = {
		/**
		 * @memberOf h5.devtool.TraceLogController
		 */
		__name: 'h5.devtool.TraceLogController',
		/**
		 * 表示する条件を格納するオブジェクト
		 *
		 * @memberOf h5.devtool.TraceLogController
		 */
		_condition: {
			filterStr: '',
			exclude: false,
			hideCls: {}
		},

		/**
		 * ログ出力共通コントローラ
		 *
		 * @memberOf h5.devtool.BaseLogController
		 */
		baseController: baseLogController,

		/**
		 * @memberOf h5.devtool.TraceLogController
		 * @param context.evArg.logArray logArray
		 */
		__ready: function(context) {
			view.update(this.rootElement, 'trace');
			this.baseController.setCreateLogHTML(this.own(this._createLogHTML));
			this.baseController.setLogArray(context.args.traceLogs, this.$find('.trace-list')[0]);
		},
		_createLogHTML: function(logArray) {
			var str = this._condition.filterStr;
			var reg = this._condition.filterReg;
			var isExclude = this._condition.filterStr && this._condition.exclude;
			var hideCls = this._condition.hideCls;

			var html = '';
			// TODO view.getが重いので、文字列を直接操作する
			// (view.get, str.formatを1000件回してIE10で20msくらい。ただの文字列結合なら10msくらい)

			for (var i = 0, l = logArray.length; i < l; i++) {
				var logObj = logArray.get(i);
				var part = view.get('trace-list-part', logObj);
				// index番号を覚えさせる
				part = $(part).attr('data-h5devtool-logindex', i)[0].outerHTML;
				// フィルタにマッチしているか
				if (!isExclude === !(reg ? logObj.message.match(reg)
						: logObj.message.indexOf(str) !== -1)) {
					html += $(part).css('display', 'none')[0].outerHTML;
					continue;
				} else if (hideCls && hideCls[logObj.cls]) {
					// クラスのフィルタにマッチしているか
					part = $(part).css('display', 'none')[0].outerHTML;
				}

				html += part;
			}
			return html;
		},
		'.fixedControlls input[type="checkbox"] change': function(context, $el) {
			var cls = $el.attr('name');
			if ($el.prop('checked')) {
				this._condition.hideCls[cls] = false;
			} else {
				this._condition.hideCls[cls] = true;
			}
			this.refresh();
		},
		/**
		 * フィルタを掛ける
		 *
		 * @memberOf h5.devtool.TraceLogController
		 */
		'input.filter keydown': function(context) {
			// エンターキー
			if (context.event.keyCode === 13) {
				var val = this.$find('input.filter').val();
				if (!val) {
					return;
				}
				this._executeFilter(val);
				this.$find('.filter-clear').prop('disabled', false);
			}
		},
		/**
		 * 入力欄が空になったらフィルタを解除
		 *
		 * @memberOf h5.devtool.TraceLogController
		 */
		'input.filter keyup': function(context) {
			// エンターキー
			var val = this.$find('input.filter').val();
			if (val === '') {
				this._executeFilter('');
			}
		},
		'button.filter-show click': function(context) {
			var val = this.$find('input.filter').val();
			if (!val) {
				return;
			}
			this._executeFilter(val);
			this.$find('.filter-clear').prop('disabled');
		},
		'button.filter-hide click': function(context) {
			var val = this.$find('input.filter').val();
			if (!val) {
				return;
			}
			this._executeFilter(val, true);
			this.$find('.filter-clear').prop('disabled');
		},
		'button.filter-clear click': function(context) {
			this._executeFilter('');
			this.$find('.filter-clear').prop('disabled', true);
		},
		_executeFilter: function(val, execlude) {
			this._condition.filterStr = val;
			this._condition.filterReg = val.indexOf('*') !== -1 ? getRegex(val) : null;
			this._condition.exclude = !!execlude;
			this.refresh();
		},

		/**
		 * 表示されているログについてフィルタを掛けなおす
		 *
		 * @memberOf h5.devtool.TraceLogController
		 */
		refresh: function() {
			this.$find('.trace-list')[0].innerHTML = this
					._createLogHTML(this.baseController._logArray);
		}
	};
	h5.core.expose(traceLogController);

	/**
	 * ロガーコントローラ
	 *
	 * @name h5.devtool.LoggerController
	 */
	var loggerController = {
		/**
		 * @memberOf h5.devtool.LoggerController
		 */
		__name: 'h5.devtool.LoggerController',

		/**
		 * ログ出力共通コントローラ
		 *
		 * @memberOf h5.devtool.LoggerController
		 */
		baseController: h5.devtool.BaseLogController,

		/**
		 * @memberOf h5.devtool.BaseLogController
		 */
		_logArray: null,

		/**
		 * @memberOf h5.devtool.LoggerController
		 * @param context
		 */
		__ready: function(context) {
			this.baseController.setCreateLogHTML(this.own(this._createLogHTML));
			this.baseController.setLogArray(context.args.loggerArray, this.rootElement);

			//--------------------------------------------
			// window.onerrorで拾った例外も出すようにする
			// (bindするのはwindowはデバッグウィンドウのwindowじゃなくてアプリ側のwindowオブジェクト)
			// unbindするときのためにコントローラでハンドラを覚えておく
			//--------------------------------------------
			this._onnerrorHandler = this.own(function(ev) {
				var message = ev.originalEvent.message;
				var file = ev.originalEvent.fileName || '';
				var lineno = ev.originalEvent.lineno || '';

				loggerArray.push({
					levelString: 'EXCEPTION',
					date: new Date(),
					args: ['{0} {1}:{2}', message, file, lineno]
				});
				this.baseController._updateView();
			});
			$(window).bind('error', this._onnerrorHandler);
		},

		/**
		 * Log出力するHTML文字列を作成
		 *
		 * @memberOf h5.devtool.LoggerController
		 * @param logArray
		 * @returns {String}
		 */
		_createLogHTML: function(logArray) {
			var html = '';
			for (var i = 0, l = logArray.length; i < l; i++) {
				var obj = logArray.get(i);
				var msg = '[' + obj.levelString + ']' + timeFormat(obj.date) + ' '
						+ h5.u.str.format.apply(h5.u.str, obj.args);
				var cls = obj.levelString;
				html += '<p class="' + cls + '">' + msg + '</p>';

			}
			return html;
		},

		/**
		 * @memberOf h5.devtool.LoggerController
		 */
		__unbind: function() {
			// コントローラのハンドラがunbindされるときにerrorハンドラもunbindする
			$(window).unbind('error', this._onnerrorHandler);
		}
	};
	h5.core.expose(loggerController);

	/**
	 * タブコントローラ タブ表示切替をサポートする
	 *
	 * @name h5.devtool.TabController
	 */
	var tabController = {
		/**
		 * @memberOf h5.devtool.TabController
		 */
		__name: 'h5.devtool.TabController',
		/**
		 * @memberOf h5.devtool.TabController
		 */
		__ready: function() {
			// 非アクティブのものを非表示
			this.$find('tab-content').not('.active').css('display', 'none');
		},
		/**
		 * 指定されたクラスのタブへ切替
		 *
		 * @param {String} tabClass タブのクラス名
		 */
		selectTab: function(tabClass) {
			this.$find('.nav-tabs li.' + tabClass).trigger('click');
		},
		/**
		 * タブをクリック
		 *
		 * @memberOf h5.devtool.TabController
		 * @param context
		 * @param $el
		 */
		'.nav-tabs li click': function(context, $el) {
			if ($el.hasClass('active')) {
				return;
			}
			var $navTabs = $el.parent();
			$navTabs.find('>.active').removeClass('active');
			$el.addClass('active');
			var targetContent = $el.data('tab-page');
			var $tabContentsRoot = $el.closest('.nav-tabs').next();
			$tabContentsRoot.find('>.active').removeClass('active');
			var $selectedContents = $tabContentsRoot.find('>.' + targetContent);
			$selectedContents.addClass('active');
			this.trigger('tabChange', targetContent);
			$selectedContents.trigger('tabSelect');
		}
	};
	h5.core.expose(tabController);

	/**
	 * デバッグコントローラ
	 *
	 * @name h5.devtool.DebugController
	 */
	var debugController = {
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		__name: 'h5.devtool.DebugController',
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		win: null,
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		_controllerDebugController: h5.devtool.ControllerDebugController,

		/**
		 * @memberOf h5.devtool.DebugController
		 */
		_tabController: h5.devtool.TabController,
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		_traceLogController: h5.devtool.TraceLogController,
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		_loggerController: h5.devtool.LoggerController,
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		_settingsController: h5.devtool.SettingsController,
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		__meta: {
			_controllerDebugController: {
			// rootElementは__constructで追加してから設定している
			},
			_traceLogController: {},
			_settingsController: {},
			_loggerController: {}
		},
		/**
		 * @memberOf h5.devtool.DebugController
		 */
		__construct: function(context) {
			this.win = context.args.win;
			// 必要な要素を追加

			// 全体を包むタブの中身を追加
			view.append(this.rootElement, 'debug-tab');
			view.append(this.$find('.debug-controller'), 'controllerDebugWrapper');
			view.append(this.$find('.settings'), 'settings');
			this.__meta._controllerDebugController.rootElement = this.$find('.debug-controller');
			this.__meta._traceLogController.rootElement = this.$find('.trace');
			this.__meta._loggerController.rootElement = this.$find('.logger');
			this.__meta._settingsController.rootElement = this.$find('.settings');

			// -------------------------------------------------
			// ロガーをフックする
			// -------------------------------------------------
			h5.settings.log = {
				target: {
					view: {
						type: {
							log: function(obj) {
								var args = obj.args;
								if (args[1] && typeof args[1] === 'string'
										&& args[1].indexOf('h5.devtool.') === 0) {
									// デバッグツールが吐いてるログは出力しない
									return;
								}
								loggerArray.push(obj);
								loggerArray.dispatchEvent({
									type: 'logUpdate'
								});
							}
						}
					}
				},
				out: [{
					category: '*',
					targets: ['view']
				}]
			};
			h5.log.configure();
		},

		/**
		 * 何もない箇所をクリック
		 */
		'.left click': function(context, $el) {
			if (context.event.target !== $el[0]) {
				return;
			}
			this.trigger('leftclick');
		},
		/**
		 * 閉じるボタン(モバイル用) 閉じて、オーバレイも消える。
		 */
		'{.h5devtool-controllBtn.opencloseBtn.closeTool} click': function(context, $el) {
			$el.text('▼').removeClass('closeTool').addClass('openTool');
			$('.h5devtool-controllBtn').not($el).css('display', 'none');
			$(this.rootElement).css('display', 'none');
			this.trigger('close');
		},
		/**
		 * 開くボタン(モバイル用)
		 */
		'{.h5devtool-controllBtn.opencloseBtn.openTool} click': function(context, $el) {
			$el.text('×').removeClass('openTool').addClass('closeTool');
			$('.h5devtool-controllBtn').not($el).css('display', 'inline-block');
			$(this.rootElement).css('display', 'block');
			$('.h5devtool-controllBtn.showhideBtn.showTool').trigger('click');
			this.trigger('open');
		},

		/**
		 * 隠すボタン
		 * <p>
		 * オーバレイを隠す。タブレット版の場合はデバッグツールも隠す。
		 * </p>
		 */
		'{.h5devtool-controllBtn.showhideBtn.hideTool} click': function(context, $el) {
			$el.text('↓').removeClass('hideTool').addClass('showTool');
			if (!useWindowOpen) {
				$(this.rootElement).css({
					display: 'none'
				});
			}
		},
		/**
		 * 見るボタン
		 */
		'{.h5devtool-controllBtn.showhideBtn.showTool} click': function(context, $el) {
			$el.text('↑').removeClass('showTool').addClass('hideTool');
			if (!useWindowOpen) {
				$(this.rootElement).css({
					display: ''
				});
			}
		}
	};
	h5.core.expose(debugController);

	// =========================================================================
	//
	// Body
	//
	// =========================================================================

	// ログを出力する
	fwLogger.info('hifive Developer Tool(ver.{0})の読み込みが完了しました。', H5_DEV_TOOL_VERSION);

	// アスペクトを掛ける
	// TODO アスペクトでやるのをやめる。
	// アスペクトだと、メソッドがプロミスを返した時が分からない。(プロミスがresolve,rejectされた時に初めてpostに入るので。)
	var preTarget = null;
	var aspect = {
		target: '*',
		interceptors: h5.u.createInterceptor(function(invocation, data) {
			var target = invocation.target;
			if (isDebugWindowClosed || isDisposed(target)
					|| h5.u.str.startsWith(target.__name, 'h5.devtool')) {
				// デバッグウィンドウが閉じられた、またはdisposeされた、またはデバッグコントローラなら何もしない
				return invocation.proceed();
			}

			// 関数名を取得
			var fName = invocation.funcName;

			// ControllerDebugControllerまたはLogicDebugControllerがバインドされる前にバインドされたコントローラの場合
			// _h5devtoolContextがないので追加
			target._h5devtoolContext = target._h5devtoolContext || {};
			// ログのインデントレベルを設定
			target._h5devtoolContext.indentLevel = target._h5devtoolContext.indentLevel || 0;
			// メソッドの呼び出し回数をカウント
			var methodCount = target._h5devtoolContext.methodCount;
			if (!methodCount) {
				methodCount = new MethodCount(target);
				target._h5devtoolContext.methodCount = methodCount;
			}
			methodCount.count(fName);

			var indentLevel = target._h5devtoolContext.indentLevel;
			var cls = '';
			if (fName.indexOf(' ') !== -1 && target.__controllerContext) {
				// コントローラかつ空白を含むメソッドの場合はイベントハンドラ
				cls = 'event';
			} else if ($.inArray(fName, LIFECYCLE_METHODS) !== -1 && target.__controllerContext) {
				// ライフサイクルメソッド
				cls = 'lifecycle';
			} else if (fName.indexOf('_') === 0) {
				// '_'始まりならprivate
				cls = 'private';
			} else {
				// それ以外はpublic
				cls = 'public';
			}

			// BEGINを出力したターゲットのログを覚えておいてENDの出力場所が分かるようにする
			// 全体のトレースログ以外で、ログを出した場所を覚えさせておく
			data.beginLog = [];

			// ログを保持する配列をターゲットに持たせる
			if (!target._h5devtoolContext.debugLog) {
				target._h5devtoolContext.debugLog = createLogArray();
			}

			// 呼び出し元のターゲットにもログを出す(ただし呼び出し元がdispose済みなら何もしない)
			if (preTarget && preTarget !== target && preTarget._h5devtoolContext) {
				var logObj = createLogObject(target, target.__name + '#' + fName, cls, 'BEGIN', '',
						target.__name, preTarget._h5devtoolContext.indentLevel);
				addLogObject(preTarget._h5devtoolContext.debugLog, logObj);
				preTarget._h5devtoolContext.indentLevel += 1;
				data.beginLog.push({
					target: preTarget,
					logObj: logObj
				});
			}

			// ターゲットのログ
			var logObj = createLogObject(target, fName, cls, 'BEGIN', '', target.__name,
					indentLevel);
			data.logObj = logObj;
			addLogObject(target._h5devtoolContext.debugLog, logObj);
			target._h5devtoolContext.indentLevel += 1;
			data.beginLog.push({
				target: target,
				logObj: logObj
			});

			// コントローラ全部、ロジック全部の横断トレースログ
			var wholeLog = createLogObject(target, target.__name + '#' + fName, cls, 'BEGIN', '',
					target.__name, wholeTraceLogsIndentLevel);
			wholeTraceLogsIndentLevel++;
			addLogObject(wholeTraceLogs, wholeLog);
			data.wholeLog = wholeLog;

			preTarget = target;
			return invocation.proceed();
		}, function(invocation, data) {
			var target = invocation.target;
			if (isDebugWindowClosed || isDisposed(target)) {
				// デバッグウィンドウが閉じた、またはdisposeされたターゲットの場合は何もしない
				// target.__nameがない(===disposeされた)場合は何もしない
				return;
			}
			if (h5.u.str.startsWith(target.__name, 'h5.devtool')) {
				return;
			}
			target._h5devtoolContext = target._h5devtoolContext || {};
			target._h5devtoolContext.indentLevel = target._h5devtoolContext.indentLevel || 0;

			// プロミスの判定
			// penddingのプロミスを返した時はPOSTに入ってこないので、RESOLVEDかREJECTEDのどっちかになる。
			var ret = invocation.result;
			var isPromise = ret && $.isFunction(ret.promise) && !h5.u.obj.isJQueryObject(ret)
					&& $.isFunction(ret.done) && $.isFunction(ret.fail);
			var promiseState = '';
			var tag = 'END';
			if (isPromise) {
				tag = 'DFD';
				// すでにresolve,rejectされていたら状態を表示
				if (ret.state() === 'resolved') {
					promiseState = '(RESOLVED)';
				} else if (ret.state() === 'rejected') {
					promiseState = '(REJECTED)';
				}
			}

			var time = timeFormat(new Date());

			// BEGINのログを出したターゲット(コントローラまたはロジック)にログを出す
			if (data.beginLog) {
				for (var i = 0, l = data.beginLog.length; i < l; i++) {
					var t = data.beginLog[i].target;
					var logObj = $.extend({}, data.beginLog[i].logObj);
					logObj.tag = tag;
					logObj.promiseState = promiseState;
					logObj.time = time;
					// プロミスならインデントを現在のインデント箇所で表示
					logObj.indentWidth = isPromise ? 0 : logObj.indentWidth;
					addLogObject(t._h5devtoolContext.debugLog, logObj);
					t._h5devtoolContext.indentLevel -= 1;
				}
			}

			// コントローラ全部、ロジック全部の横断トレースログにログオブジェクトの登録
			var wholeLog = $.extend({}, data.wholeLog);
			wholeLog.tag = tag;
			wholeLog.promiseState = promiseState;
			wholeLog.time = time;
			wholeLog.indentWidth = isPromise ? 0 : wholeLog.indentWidth;
			addLogObject(wholeTraceLogs, wholeLog);
			wholeTraceLogsIndentLevel -= 1;
			preTarget = null;
		}),
		pointCut: '*'
	};
	compileAspects(aspect);
	h5.settings.aspects = [aspect];

	// コントローラのフック
	if (!CONTROLLER_HAS_CONTROLLER_DEF) {
		// controllerDefを持たせるためにh5.core.controllerをフック(hifive1.1.8以前用)
		var orgController = h5.core.controller;
		h5.core.controller = function(/* var_args */) {
			var defObj = $.extend({}, arguments[1]);
			var c = orgController.apply(this, arguments);
			if (defObj && h5.u.str.startsWith(defObj.__name, 'h5.devtool')) {
				return;
			}
			c.initPromise.done(function() {
				if (!this.__controllerContext.controllerDefObj) {
					// hifive1.1.8以前用
					addControllerDef(this, defObj);
				}
			});
			return c;
		};
	}

	// -------------------------------------------------
	// コントローラのバインド
	// -------------------------------------------------
	$(function() {
		openDebugWindow().done(function(win) {
			devtoolWindow = win;
			h5.core.controller($(win.document).find('.h5devtool'), debugController, {
				win: win,
				// 全体のトレースログ
				traceLogs: wholeTraceLogs,
				// ロガー
				loggerArray: loggerArray

			}).readyPromise.done(function() {
				// 閉じられたときにdebugControllerをdispose
				var controller = this;
				function unloadFunc() {
					// オーバレイを削除
					controller._controllerDebugController.removeOverlay(true);
					// コントローラをdispose
					controller.dispose();
					// デバッグウィンドウが閉じられたフラグを立てる
					// 以降、デバッグ用のアスペクトは動作しなくなる
					isDebugWindowClosed = true;
				}
				if (win.addEventListener) {
					win.addEventListener('unload', unloadFunc);
				} else {
					win.attachEvent('onunload', unloadFunc);
				}
			});
		}).fail(function() {
			// ポップアップブロックされると失敗する
			// アラートをだして何もしない
			alert('別ウィンドウのオープンに失敗しました。ポップアップブロックを設定している場合は一時的に解除してください。');
		});
	});
})(jQuery);
