(function() {

	/**
	 * creatorをhifive.editor.creators以下にexposeする _opt.fullnameにcreators.以下からのフルパスを覚えさせておく
	 *
	 * @param {Object} creator コンポーネント情報
	 * @param {String} creator.id コンポーネントのid
	 * @param {String} creator.label コンポーネント名。パレットに表示される名前。
	 * @param {String} creator.palette コンポーネントのパレット(jstree)上の位置。
	 * @param {Number} creator.priority 優先度。パレット上に表示される順番を定義。数字が若い方が優先的に上にくる。指定無しは一番下。
	 * @param {Function} creator.createView ビューを作成する関数
	 * @param {Array} creator.createEditor エディタ(編集画面)を作成するためのスキーマ
	 */
	function addCreator(creator) {
		hifive.editor.u.setComponentCreator(creator.id, $.extend({}, creator));
	}

	h5.u.obj.expose('hifive.editor', {
		addCreator: addCreator
	});
})();