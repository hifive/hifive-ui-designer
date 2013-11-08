$(function() {
	// if-modified-since
	var IF_MODIFIED_SINCE = 'If-Modified-Since';

	// 問い合わせる間隔
	var INTERVAL_TIME = 5000;

	// リロードがキャンセルされたかどうか
	var reloadCanceled = false;
	// 今後のリロード全てがキャンセルされたかどうか
	var reloadStopped = false;

	// 通知用DOM作成
	var $info = $('<div style="display:none;background-color:rgba(0,255,0,0.8); width:100%; position:fixed; top:0; left:0">'
			+ '<div class="cancelled" style="display:none">今回の更新をスキップしました。</div>'
			+ '<div class="stopped" style="display:none">今後の更新全てスキップします。</div>'
			+ '<div class="reload">変更がありました。3秒後にリロードします。</div>'
			+ '<div class="btns" style="margin:0;padding:0;">'
			+ '<button style="width:33%;cursor:pointer;float:left;box-sizing: border-box;text-align: center;padding: 5px 0 5px 0;margin: 5px 0 5px 0;" class="btn reload">今すぐ更新</button>'
			+ '<button style="width:33%;cursor:pointer;float:left;box-sizing: border-box;text-align: center;padding: 5px 0 5px 0;margin: 5px 0 5px 0;" class="btn skip">今回の更新のみスキップ</button>'
			+ '<button style="width:33%;cursor:pointer;float:left;box-sizing: border-box;text-align: center;padding: 5px 0 5px 0;margin: 5px 0 5px 0;" class="btn stop">今後の更新全てスキップ</button>'
			+ '</div>"');
	$('body').append($info);

	// 通知DOM上のボタンのイベントハンドリング
	$info.find('.reload').bind('click', function() {
		// 今すぐリロード
		window.location.reload();
	});
	$info.find('.skip').bind('click', function() {
		reloadCanceled = true;
		// 1秒間メッセージ表示
		$info.find('.cancelled').css('display', 'block');
		$info.find('.btns').css('display', 'none');
		$info.find('.reload').css('display', 'none');
		setTimeout(function() {
			$info.find('.reload').css('display', 'block');
			$info.find('.btns').css('display', 'block');
			$info.find('.cancelled').css('display', 'none');
			$info.css('display', 'none');
		}, 1000);
	});
	$info.find('.stop').bind('click', function() {
		reloadStopped = true;
		reloadCanceled = true;
		// 1秒間メッセージ表示
		$info.find('.stopped').css('display', 'block');
		$info.find('.btns').css('display', 'none');
		$info.find('.reload').css('display', 'none');
		setTimeout(function() {
			$info.css('display', 'none');
		}, 1000);
	});

	var lastModified = null;

	function intervalFunc() {
		if (reloadStopped) {
			return;
		}
		// 更新されているかどうか問い合わせる
		// ヘッダとリクエストパラメータ両方にif-modified-sinceを入れている(proxyにヘッダを削られる可能性を考慮している)
		var data = {};
		data[IF_MODIFIED_SINCE] = lastModified;
		$.ajax(location.href, {
			beforeSend: function(xhr) {
				xhr.setRequestHeader(IF_MODIFIED_SINCE, lastModified);
			},
			data: data
		}).always(function(arg1, status, arg2) {
			if (status === "success") {
				// 200(更新がある==notmodifiedじゃない)なら3秒後に更新
				// 通知DOM表示
				$info.css('display', 'block');
				setTimeout(function() {
					if (reloadCanceled) {
						reloadCanceled = false;
						// キャンセルされた場合は、If-Modified-Sinceの時刻をキャンセルした時刻にする
						// またINTERVAL_TIME後にチェック
						lastModified = arg2.getResponseHeader('Date');
						setTimeout(intervalFunc, INTERVAL_TIME);
						return;
					}
					window.location.reload();
				}, 3000);
			} else {
				setTimeout(intervalFunc, INTERVAL_TIME);
			}
		});
	}

	// サーバー時刻を取得
	$.ajax(location.href).done(function(data, status, xhr) {
		lastModified = xhr.getResponseHeader('Date');
		// サーバー時刻を取得したら更新チェック開始
		setTimeout(intervalFunc, INTERVAL_TIME);
	});
});