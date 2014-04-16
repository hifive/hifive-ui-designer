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
h5.core.controller.define('hifive.editor.controller.GenericEditorController', function() {

	var genericEditorController = {
		_targetCell: null,

		_init: function() {
			if (!this._targetCell) {
				return;
			}

			this.$find('textarea').val(this._targetCell.innerHTML);
		},

		__ready: function() {
			this._init();
		},

		__dispose: function() {
			this.$find('textarea').val('');
		},

		setTarget: function(targetCell) {
			this._targetCell = targetCell;
			this._init();
		},

		'[name="cancel"] click': function(context) {
			this.log.debug('編集をキャンセルします。');
			this.trigger('editorclose');
		},

		'[name="commit"] click': function(context) {
			$(this._targetCell).html(this.$find('textarea').val());
			this.trigger('editorclose');
		}
	};

	return genericEditorController;
});