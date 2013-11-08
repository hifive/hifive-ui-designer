(function() {

	var PARENT_ORIGIN = '*';

	var CMD_INIT = 'init';

	var CMD_INIT_ACK = 'initAck';

	var PROTOCOL_VERSION = 1;

	if(!window.postMessage) {
		alert('このブラウザはpostMessageをサポートしていません。');
		return;
	}

	if (window === window.parent) {
		//iframe内でロードされているかをチェック
		alert('Agentがインラインフレームで読み込まれていません。');
		return;
	}


	var CURRENT_SEREALIZER_VERSION = '1';

	function throwFwError(code) {
		throw new Error('serdes error! code=' + code);
	}

	function isString(target) {
		return typeof target === 'string';
	}

	/**
	 * 型情報の文字列をコードに変換します。
	 *
	 * @private
	 * @returns {String} 型を表すコード（１字）
	 */
	function typeToCode(typeStr) {
		switch (typeStr) {
		case 'string':
			return 's';
		case 'number':
			return 'n';
		case 'boolean':
			return 'b';
		case 'String':
			return 'S';
		case 'Number':
			return 'N';
		case 'Boolean':
			return 'B';
		case 'infinity':
			return 'i';
		case '-infinity':
			return 'I';
		case 'nan':
			return 'x';
		case 'date':
			return 'd';
		case 'regexp':
			return 'r';
		case 'array':
			return 'a';
		case 'object':
			return 'o';
		case 'null':
			return 'l';
		case TYPE_OF_UNDEFINED:
			return 'u';
		case 'undefElem':
			return '_';
		case 'objElem':
			return '@';
		}
	}

	function serialize(value) {
		if ($.isFunction(value)) {
			throw new Error('hifiveEditorAgent: serialize -> value is function');
		}
		// 循環参照チェック用配列
		var objStack = [];
		function existStack(obj) {
			for ( var i = 0, len = objStack.length; i < len; i++) {
				if (obj === objStack[i]) {
					return true;
				}
			}
			return false;
		}

		function popStack(obj) {
			for ( var i = 0, len = objStack.length; i < len; i++) {
				if (obj === objStack[i]) {
					objStack.splice(i, 1);
				}
			}
		}

		function func(val) {
			var ret = val;
			var type = $.type(val);

			// プリミティブラッパークラスを判別する
			if (typeof val === 'object') {
				if (val instanceof String) {
					type = 'String';
				} else if (val instanceof Number) {
					type = 'Number';
				} else if (val instanceof Boolean) {
					type = 'Boolean';
				}
			}

			// オブジェクトや配列の場合、JSON.stringify()を使って書けるが、json2.jsのJSON.stringify()を使った場合に不具合があるため自分で実装した。
			switch (type) {
			case 'String':
			case 'string':
				ret = typeToCode(type) + ret;
				break;
			case 'Boolean':
				ret = ret.valueOf();
			case 'boolean':
				ret = typeToCode(type) + ((ret) ? 1 : 0);
				break;
			case 'Number':
				ret = ret.valueOf();
				if (($.isNaN && $.isNaN(val)) || ($.isNumeric && !$.isNumeric(val))) {
					if (val.valueOf() === Infinity) {
						ret = typeToCode('infinity');
					} else if (val.valueOf() === -Infinity) {
						ret = typeToCode('-infinity');
					} else {
						ret = typeToCode('nan');
					}
				}
				ret = typeToCode(type) + ret;
				break;
			case 'number':
				if (($.isNaN && $.isNaN(val)) || ($.isNumeric && !$.isNumeric(val))) {
					if (val === Infinity) {
						ret = typeToCode('infinity');
					} else if (val === -Infinity) {
						ret = typeToCode('-infinity');
					} else {
						ret = typeToCode('nan');
					}
				} else {
					ret = typeToCode(type) + ret;
				}
				break;
			case 'regexp':
				ret = typeToCode(type) + ret.toString();
				break;
			case 'date':
				ret = typeToCode(type) + (+ret);
				break;
			case 'array':
				if (existStack(val)) {
					throwFwError(ERR_CODE_REFERENCE_CYCLE);
				}
				objStack.push(val);
				var indexStack = [];
				ret = typeToCode(type) + '[';
				for ( var i = 0, len = val.length; i < len; i++) {
					indexStack[i.toString()] = true;
					var elm;
					if (!val.hasOwnProperty(i)) {
						elm = typeToCode('undefElem');
					} else if ($.type(val[i]) === 'function') {
						elm = typeToCode(TYPE_OF_UNDEFINED);
					} else {
						elm = (func(val[i])).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
					}
					ret += '"' + elm + '"';
					if (i !== val.length - 1) {
						ret += ',';
					}
				}
				var hash = '';
				for ( var key in val) {
					if (indexStack[key]) {
						continue;
					}
					if ($.type(val[key]) !== 'function') {
						hash += '"' + key + '":"'
								+ (func(val[key])).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
								+ '",';
					}
				}
				if (hash) {
					ret += ((val.length) ? ',' : '') + '"' + typeToCode('objElem') + '{'
							+ hash.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
					ret = ret.replace(/,$/, '');
					ret += '}"';
				}
				ret += ']';
				popStack(val);
				break;
			case 'object':
				if (existStack(val)) {
					throwFwError(ERR_CODE_CIRCULAR_REFERENCE);
				}
				objStack.push(val);
				ret = typeToCode(type) + '{';
				for ( var key in val) {
					if (val.hasOwnProperty(key)) {
						if ($.type(val[key]) === 'function') {
							continue;
						}
						ret += '"' + key + '":"'
								+ (func(val[key])).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
								+ '",';
					}
				}
				ret = ret.replace(/,$/, '');
				ret += '}';
				popStack(val);
				break;
			case 'null':
			case TYPE_OF_UNDEFINED:
				ret = typeToCode(type);
				break;
			}

			return ret;
		}

		return CURRENT_SEREALIZER_VERSION + '|' + func(value);
	}

	function deserialize(value) {
		if (!isString(value)) {
			throwFwError(ERR_CODE_DESERIALIZE_ARGUMENT);
		}

		value.match(/^(.)\|(.*)/);
		var version = RegExp.$1;
		if (version !== CURRENT_SEREALIZER_VERSION) {
			throwFwError(ERR_CODE_SERIALIZE_VERSION, [version, CURRENT_SEREALIZER_VERSION]);
		}
		var ret = RegExp.$2;

		function func(val) {
			/**
			 * 型情報のコードを文字列に変換します。
			 *
			 * @private
			 * @returns {String} 型を表す文字列
			 */
			function codeToType(typeStr) {
				switch (typeStr) {
				case 's':
					return 'string';
				case 'n':
					return 'number';
				case 'b':
					return 'boolean';
				case 'S':
					return 'String';
				case 'N':
					return 'Number';
				case 'B':
					return 'Boolean';
				case 'i':
					return 'infinity';
				case 'I':
					return '-infinity';
				case 'x':
					return 'nan';
				case 'd':
					return 'date';
				case 'r':
					return 'regexp';
				case 'a':
					return 'array';
				case 'o':
					return 'object';
				case 'l':
					return 'null';
				case 'u':
					return TYPE_OF_UNDEFINED;
				case '_':
					return 'undefElem';
				case '@':
					return 'objElem';
				}
			}
			val.match(/^(.)(.*)/);
			var type = RegExp.$1;
			ret = (RegExp.$2) ? RegExp.$2 : '';
			if (type !== undefined && type !== '') {
				switch (codeToType(type)) {
				case 'String':
					ret = new String(ret);
					break;
				case 'string':
					break;
				case 'Boolean':
					if (ret === '0' || ret === '1') {
						ret = new Boolean(ret === '1');
					} else {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					break;
				case 'boolean':
					if (ret === '0' || ret === '1') {
						ret = ret === '1';
					} else {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					break;
				case 'nan':
					if (ret !== '') {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					ret = NaN;
					break;
				case 'infinity':
					if (ret !== '') {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					ret = Infinity;
					break;
				case '-infinity':
					if (ret !== '') {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					ret = -Infinity;
					break;
				case 'Number':
					if (codeToType(ret) === 'infinity') {
						ret = new Number(Infinity);
					} else if (codeToType(ret) === '-infinity') {
						ret = new Number(-Infinity);
					} else if (codeToType(ret) === 'nan') {
						ret = new Number(NaN);
					} else {
						ret = new Number(ret);
						if (isNaN(ret.valueOf())) {
							throwFwError(ERR_CODE_DESERIALIZE_VALUE);
						}
					}
					break;
				case 'number':
					ret = new Number(ret).valueOf();
					if (isNaN(ret)) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					break;
				case 'array':
					var obj;
					try {
						obj = $.parseJSON(ret);
					} catch (e) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					if (!$.isArray(obj)) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					for ( var i = 0; i < obj.length; i++) {
						switch (codeToType(obj[i].substring(0, 1))) {
						case 'undefElem':
							delete obj[i];
							break;
						case 'objElem':
							var extendObj = func(typeToCode('object') + obj[i].substring(1));
							var tempObj = [];
							for ( var i = 0, l = obj.length - 1; i < l; i++) {
								tempObj[i] = obj[i];
							}
							obj = tempObj;
							for ( var key in extendObj) {
								obj[key] = extendObj[key];
							}
							break;
						default:
							obj[i] = func(obj[i]);
						}
					}
					ret = obj;
					break;
				case 'object':
					var obj;
					try {
						obj = $.parseJSON(ret);
					} catch (e) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					if (!$.isPlainObject(obj)) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					for ( var key in obj) {
						obj[key] = func(obj[key]);
					}
					ret = obj;
					break;
				case 'date':
					ret = new Date(parseInt(ret, 10));
					break;
				case 'regexp':
					ret.match(/^\/(.*)\/(.*)$/);
					var regStr = RegExp.$1;
					var flg = RegExp.$2;
					try {
						ret = new RegExp(regStr, flg);
					} catch (e) {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					break;
				case 'null':
					if (ret !== '') {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					ret = null;
					break;
				case TYPE_OF_UNDEFINED:
					if (ret !== '') {
						throwFwError(ERR_CODE_DESERIALIZE_VALUE);
					}
					ret = undefined;
					break;
				default:
					throwFwError(ERR_CODE_DESERIALIZE_TYPE);
				}
			}

			return ret;
		}
		return func(ret);
	}

	var messageMagicNumber = null;

	var parentWindow = window.parent;

	function send(message) {
		if(!isInitiating && !isInitiated) {
			alert('エディットサーバとの通信が確立していません。');
			return;
		}

		message.magicNumber = messageMagicNumber;

		var msg = serialize(message);

		parentWindow.postMessage(msg, PARENT_ORIGIN);
	}

	var isInitiating = false;

	var isInitiated = false;

	function window_init_messageHandler(event) {
		window.removeEventListener('message', window_init_messageHandler);

		if(!isInitiating) {
			alert('init開始前にmessageイベントを受け取りました。初期化を中止します。');
			return;
		}

		var msg = deserialize(event.data);

		if(msg.command !== CMD_INIT_ACK) {
			alert('commandが異なります。');
			return;
		}

		if(msg.version !== PROTOCOL_VERSION) {
			alert('プロトコルバージョンが異なります。ライブラリを更新してください。');
			return;
		}

		messageMagicNumber = msg.magicNumber;

		window.addEventListener('message', window_messageHandler);

		isInitiated = true;

		alert('サーバとの接続を確立しました。');
	}

	/**
	 * { command: function }
	 */
	var commandMap = {};

	function window_messageHandler(event) {
		var msg = deserialize(event.data);

		if(msg.messageMagicNumber !== messageMagicNumber) {
			alert('messageMagicNumberが異なります。');
			return;
		}

		var command = msg.command;

		//ここでディスパッチ
		if(!commandMap[command]) {
			alert('不明なコマンドです。command=' + command);
			return;
		}
		commandMap[command](msg);
	}

	function init() {
		isInitiating = true;

		window.addEventListener('message', window_init_messageHandler);

		send({
			command: CMD_INIT,
			version: PROTOCOL_VERSION
		});
	}

	init();

	/* ===== 個別コマンド ===== */
	var CMD_GET_PAGE_POS = 'getPagePos';
	commandMap[CMD_GET_PAGE_POS] = getPagePosHandler;

	function getPagePosHandler(message) {
		send({
			command: CMD_GET_PAGE_POS,
			token: message.token
		});
	}

})();
