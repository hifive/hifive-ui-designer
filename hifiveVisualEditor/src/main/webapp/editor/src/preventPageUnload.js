(function() {
	window.addEventListener('beforeunload', function(ev) {
		var msg = '※※注意※※\n' + 'ページ遷移しようとしています。内容が失われないよう、キャンセルしてください。';

		ev.returnValue = msg;
		return msg;
	});
})();
