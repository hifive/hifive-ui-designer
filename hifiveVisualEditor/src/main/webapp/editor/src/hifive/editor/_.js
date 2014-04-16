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