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