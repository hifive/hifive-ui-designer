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

	var CMD_INIT_ACK = 'initAck';
	var CMD_INIT = 'init';

	var TARGET_ORIGIN = '*';

	var PROTOCOL_VERSION = 1;

	var agentWindow = null;

	var PROTOCOL_VERSION = 1;

	var MESSAGE_MAGIC_NUMBER = parseInt(Math.random() * 1000000);

	var lastToken = 0;

	/**
	 * { token: deferred }
	 */
	var tokenMap = {};

	function send(message, dfd) {
		if (!agentWindow) {
			throw new Error('agentWindowがnullです');// TODO throwError
		}

		message.magicNumber = MESSAGE_MAGIC_NUMBER;

		if (dfd) {
			message.token = ++lastToken;
			tokenMap[message.token] = dfd;
		}

		var msg = h5.u.obj.serialize(message);
		agentWindow.postMessage(msg, TARGET_ORIGIN);
		// TODO init時に保持したオリジンにするか
	}

	function window_messageHandler(event) {
		var msg = h5.u.obj.deserialize(event.data);

		agentWindow = event.source;

		var command = msg.command;

		if (command !== CMD_INIT && msg.magicNumber !== MESSAGE_MAGIC_NUMBER) {
			// CMD_INITの場合はマジックナンバーはない
			alert('マジックナンバーが異なります。');
			return;
		}

		if (msg.token) {
			var dfd = tokenMap[msg.token];
			if (!dfd) {
				alert('トークンに対応するDeferredがありません。');
				return;
			}
			dfd.resolve(msg);
			delete tokenMap[msg.token];
			return;
		}

		// ここでディスパッチ
		if (!commandMap[command]) {
			alert('不明なコマンドです。command=' + command);
			return;
		}
		commandMap[command](msg);
	}

	window.addEventListener('message', window_messageHandler);

	/* ===== 個別コマンド ===== */

	/**
	 * { command: function }
	 */
	var commandMap = {};

	commandMap[CMD_INIT] = initHandler;
	function initHandler(message) {

		send({
			command : CMD_INIT_ACK,
			version : PROTOCOL_VERSION
		});
	}

	var CMD_GET_PAGE_POS = 'getPagePos';
	function getPagePos() {
		var dfd = h5.async.deferred();

		send({
			command : CMD_GET_PAGE_POS
		}, dfd);

		return dfd.promise();
	}

	h5.u.obj.expose('hifive.editor.page', {
		getPagePos : getPagePos
	});

})();
