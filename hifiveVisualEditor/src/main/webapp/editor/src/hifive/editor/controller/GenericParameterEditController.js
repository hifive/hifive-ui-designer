(function() {

	var genericParameterEditController = {

		__name: 'hifive.editor.controller.GenericParameterEditController',

		__construct: function() {
		// 空construct
		},

		_form: null,

		_view: null,

		_schemaArray: null,

		_viewTabLink: null,

		_htmlTab: null,

		_htmlEditBox: null,

		_defaultUnitArray: ['px', '%', 'em'],

		NO_UNIT: '_NO_UNIT_',

		__ready: function(context) {
			var root = $(this.rootElement);
			root.addClass('__genericParameterEditorBox');

			var parameterTabId = this._makeId();
			var htmlTabId = this._makeId();

			root
					.append('<div class="tabbable">'
							+ '<ul class="nav nav-tabs">'
							+ '<li class="view active"><a href="#'
							+ parameterTabId
							+ '" data-toggle="tab">パラメータ</a></li>'
							+ '<li class="html disabled"><a href="#'
							+ htmlTabId
							+ '" data-toggle="tab">HTML</a></li>'
							+ '</ul>'
							+ '<div class="tab-content">'
							+ '<div class="tab-pane active" id="'
							+ parameterTabId
							+ '">'
							+ '<form class=""></form>'
							+ '</div>'
							+ '<div class="tab-pane html" id="'
							+ htmlTabId
							+ '">'
							+ '<div class="output"><button type="button" class="btn-small apply">適用</button><br>'
							+ '<textarea></textarea></div>' + '</div>' + '</div>' + '</div>');

			this._form = this.$find('div#' + parameterTabId + ' form');
			this._viewTabLink = this.$find('li.view a');
			this._htmlTab = this.$find('li.html');
			this._htmlEditBox = this.$find('div.html textarea');

		},

		_acitivateHTMLTab: function() {
			if (this._htmlTab.hasClass('disabled')) {
				this._htmlTab.removeClass('disabled');
			}
		},

		_makeId: function() {
			var time = new Date().getTime().toString(16);
			var rand = (Math.ceil(Math.random() * 1024)).toString(16);
			return 'genericParameterEditController' + '_' + time + rand;
		},

		_outerHTML: function(elm) {
			return $("<div>").append(elm.eq(0).clone()).html();
		},

		'a[data-toggle="tab"] show': function(context) {
			var tabLink = $(context.event.target);
			if (tabLink.parent().hasClass('disabled')) {
				context.event.preventDefault();
				return;
			}
			var content = this.$find(tabLink.attr('href'));

			if (content.hasClass('html')) {
				this._htmlEditBox.val(this._outerHTML(this._view));
			} else if (!this._targetChanged) {
				this._replaceView();
				this._show(this._view, this._schemaArray);
			}
		},

		'div.html textarea change': function(context) {
			this._replaceView();
		},

		'div.html textarea keydown': function(context) {
			var that = this;
			setTimeout(function() {
				that._replaceView();
			}, 0);
		},

		'div.html button click': function(context) {
			this._replaceView();
		},

		_replaceView: function() {
			var newView = $(this._htmlEditBox.val());
			this._view.replaceWith(newView);
			this._view = newView;

			//TODO リプレース処理はPageControllerに寄せたい
			this._triggerPageChange();
		},

		'.closeBtn click': function() {
			this.trigger('closeEditor');
		},

		show: function(view, schemaArray, form) {
			this._targetChanged = true;
			this._show(view, schemaArray, form);
		},

		_show: function(view, schemaArray, form) {
			var that = this;
			var root = $(this.rootElement);

			schemaArray = $.extend(true, {}, schemaArray);

			this._acitivateHTMLTab();
			if (this._targetChanged) {
				this._htmlEditBox.val('');
				this._viewTabLink.trigger('click');
			}
			this._targetChanged = false;

			if (!form) {
				form = this._form;
				this._view = view;
				this._schemaArray = schemaArray;
			}

			form.empty();

			// 適用ボタン追加
			form.append('<button type="button" class="btn-small apply">適用</button>');

			//Enter押下時のsubmit抑制用。要検証 Opera、Android、iOS
			form.append($('<input type="text"/>').css({
				margin: 0,
				padding: 0,
				width: '0px',
				height: '0px',
				'border-style': 'none',
				visibility: 'hidden',
				position: 'absolute'
			}));

			var designatedClassNamesHash = {};
			$
					.each(
							schemaArray,
							function(schemaArray_count, schema) {
								if (schema.target != 'class')
									return;
								if (schema.selector in designatedClassNamesHash == false) {
									designatedClassNamesHash[schema.selector] = [];
								}
								if (schema.enumValue) {
									var enumValue = [];
									$.each(schema.enumValue, function(i, v) {
										//名前付き配列の場合、値のみに置き換える。
										if ($.isArray(v)) {
											enumValue.push(v[1]);
										} else {
											enumValue.push(v);
										}
									});
									designatedClassNamesHash[schema.selector] = designatedClassNamesHash[schema.selector]
											.concat(enumValue);
								} else if (schema.booleanValue) {
									designatedClassNamesHash[schema.selector]
											.push(schema.booleanValue);
								}
							});

			function _appendControl(_controls, _control, _schema) {
				_control.data('schema', _schema);
				_controls.children('div.input-wrap').append(_control);
			}

			$
					.each(
							schemaArray,
							function(schemaArray_count, schema) {
								if (!schema.constraint)
									schema.constraint = {};

								var group = $('<div class="control-group"></div>');

								var controlId = this.__name + new Date().getTime().toString(16)
										+ schemaArray_count;

								var label = $('<label class="control-label"></label>').text(
										schema.label).attr('for', controlId);
								group.append(label);

								var element;
								if (schema.selector) {
									element = view.find(schema.selector);
								} else {
									element = view;
								}
								var controls = $('<div class="controls"></div>');
								var control;
								var value;

								var wrap = $('<div class="input-wrap"></div>');
								controls.append(wrap);

								schema._element = element;
								schema._designatedClassNames = designatedClassNamesHash[schema.selector];

								switch (schema.type) {
								case 'boolean':
									var booleanValue = schema.booleanValue = schema.booleanValue || true;
									control = $('<input type="checkbox" />').val(booleanValue);
									schema._elementInput = control;
									control.attr('id', controlId);
									value = that._getValue(element, schema.target, {
										booleanValue: booleanValue,
										getValue: schema.getValue
									});
									if (typeof value == 'boolean') {
										control.prop('checked', value);
									} else {
										control.prop('checked', value == schema.booleanValue);
									}
									_appendControl(controls, control, schema);
									break;

								case 'enum':
									control = $('<select class="input"></select>');
									schema._elementInput = control;
									control.attr('id', controlId);
									var enumValue = [];
									$.each(schema.enumValue, function(i, v) {
										var name,value;
										if ($.isArray(v)) {
											name = v[0];
											value = v[1];
										} else {
											name = v;
											value = v;
										}
										var option = $('<option></option>').text(name).val(value);
										control.append(option);
										enumValue.push(value);
									});
									//名前付きの配列の場合、値のみに置き換える
									schema.enumValue = enumValue;
									value = that._getValue(element, schema.target, {
										enumValue: enumValue,
										getValue: schema.getValue
									});
									control.val(value);
									_appendControl(controls, control, schema);
									break;

								case 'number':
								case 'integer':
									controls.addClass('integer');
									value = that._getValue(element, schema.target, {
										getValue: schema.getValue
									});

									var currentUnit = '';
									var unitIndex;
									var min = (schema.constraint) ? schema.constraint.min : null;
									var max = (schema.constraint) ? schema.constraint.max : null;

									//判定条件は要検討
									var isRange = (!h5.env.ua.isIE && !h5.env.ua.isFirefox
											&& min != null && max != null && schema.inputType != 'text');

									var unit = schema.unit;
									if (unit == null)
										unit = schema.unit = that._defaultUnitArray;

									if (unit != that.NO_UNIT) {
										var match = value.match(/([+-]?\d+(?:\.\d+)?)([^\d]+)?/);
										if (match) {
											value = parseFloat(match[1]);
											currentUnit = match[2];

											if ($.isArray(unit)) {
												unitIndex = $.inArray(currentUnit, unit);
												if (unitIndex == -1)
													value = null;

												if (isRange) {
													if (unitIndex == -1) {
														unit = schema.unit = unit[0];
													} else {
														unit = schema.unit = currentUnit;
													}
												}
											} else {
												if (unit != currentUnit)
													value = null;
											}
										} else {
											value = null;
										}
									} else {
										unit = schema.unit = '';
										value = parseFloat(value);
										if (isNaN(value))
											value = null;
									}

									if (isRange) {

										control = $('<input type="range" />').val(
												value != null ? value : min).attr('min',
												schema.constraint.min).attr('max', max);
										;

										schema._elementInput = control;
										control.attr('id', controlId);

										var text = (value != null && value != '') ? value + unit
												: '指定なし';
										var label = $('<span class="label"></span><br/>')
												.text(text);
										controls.prepend(label);
										schema._elementRangeLabel = label;

										if (!schema.constraint.notNull) {
											var checkbox = $('<input type="checkbox"/>');
											checkbox.val(value != null ? value : min);
											checkbox.prop('checked', value != null);
											schema._elementRangeCheckbox = checkbox;
											_appendControl(controls, checkbox, schema);
										}

										if (schema.constraint.step != null) {
											control.attr('step', schema.constraint.step);
										}

										_appendControl(controls, control, schema);

									} else {

										function _makeBtn(btnName, btnVal) {
											var btn = $(
													'<button  type="button" class="btn-small succ" ></button>')
													.val(btnVal).text(btnName);
											var afterSucc = (value || min || max || 0)
													+ (parseInt(btnVal, 10));
											if ((min != null && afterSucc < min)
													|| (max != null && afterSucc > max)) {
												btn.prop('disabled', true);
											}
											return btn;
										}

										var back100Btn = _makeBtn('<<', -100);
										var back10Btn = _makeBtn('<', -10);
										var backBtns = $('<div class="back-value"></div>').append(
												back10Btn, back100Btn);

										var forward10Btn = _makeBtn('>', 10);
										var forward100Btn = _makeBtn('>>', '100');
										var forwardBtns = $('<div class="forward-value"></div>')
												.append(forward10Btn, forward100Btn);

										schema._elementButtonSuccArray = [back100Btn, back10Btn,
												forward10Btn, forward100Btn];

										var selectUnit = null;
										var labelUnit = null;

										if ($.isArray(unit)) {
											selectUnit = $('<select class="span1 unit"></select>');
											$.each(unit, function(i, v) {
												var option = $('<option></option>').text(v).val(v);
												if (i == unitIndex)
													option.prop('selected', true);
												selectUnit.append(option);
											});
											schema._elementSelectUnit = selectUnit;
										} else if (unit != '') {
											labelUnit = $(
													'<span class="span1 uneditable-input" type="text"></span>')
													.text(unit);
										}

										control = $('<input type="text" class="span1" />').val(
												value);
										schema._elementInput = control;
										control.attr('id', controlId);

										if (schema.constraint && schema.constraint.maxLength) {
											control.attr('maxlength', schema.constraint.maxLength);
										}
										backBtns.children().each(function() {
											$(this).data('schema', schema);
										});
										_appendControl(controls, backBtns, schema);
										_appendControl(controls, control, schema);
										if (selectUnit) {
											_appendControl(controls, selectUnit, schema);
										} else if (labelUnit) {
											wrap.append(labelUnit);
										}
										forwardBtns.children().each(function() {
											$(this).data('schema', schema);
										});
										_appendControl(controls, forwardBtns, schema);
									}

									break;

								case 'color':
									control = $('<input type="text" />');
									schema._elementInput = control;
									control.val(that._getValue(element, schema.target));
									control.attr('id', controlId);
									_appendControl(controls, control, schema);
									break;
								case 'string':
									//if(schema.target == 'class'){
									//	wrap.append('<span class="add-on">@</span>');
									//}
									if (schema.inputType == 'textarea') {
										control = $('<textarea rows="5"></textarea>');
									} else {
										control = $('<input type="text" />');
										if (schema.constraint && schema.constraint.maxLength) {
											control.attr('maxlength', schema.constraint.maxLength);
										}
									}
									value = that
											._getValue(
													element,
													schema.target,
													{
														ignore: schema.ignore,
														designatedClassNames: designatedClassNamesHash[schema.selector],
														getValue: schema.getValue
													});
									control.val(value);
									schema._elementInput = control;
									control.attr('id', controlId);
									_appendControl(controls, control, schema);
									break;

								case 'multiple':
									group.append('<br>');
									if (schema.schema) {
										// schemaが定義されている場合、各項目についての編集があるのでselect
										control = $('<select class="subForm span1"></select>');
									} else {
										// 定義されていない場合(+,-ボタンで数を操作するだけ)は、ただのinput
										controls.addClass('integer');
										control = $('<input type="text" class="span1" disable/>');
									}
									schema._elementSelectSubForm = control;
									control.attr('id', controlId);

									// itemParentはエディット画面表示時に取得する。
									// schema.itemParentはユーザの指定したもので、
									// schema._itemParentが実際に追加先になる要素。
									if (element.length) {
										if (schema.schema) {
											for ( var i = 0; i < element.length; i++) {
												var option = $('<option></option>').text(i).val(i);
												control.append(option);
											}
											control.prop('selectedIndex', 0);
										}
										schema._itemParent = element.parent();
									} else {
										if (schema.itemParent == null || schema.itemParent == '') {
											schema._itemParent = view;
										} else {
											schema._itemParent = view.find(schema.itemParent);
										}
									}
									if (!schema.schema) {
										control.val(element.length);
									}

									var addBtn = $('<button class="btn-mini addItem"><i class="icon-plus"></i></button>');
									var removeBtn = $('<button class="btn-mini removeItem"><i class="icon-remove"></i></button>');
									var subForm = $('<form class="subForm"></form>');
									schema._elementSubForm = subForm;

									_appendControl(controls, control, schema);
									_appendControl(controls, addBtn, schema);
									_appendControl(controls, removeBtn, schema);

									if (schema.schema) {
										controls.append(subForm);
									}

									if (element.length) {
										that.show(element.eq(0), schema.schema, subForm);
									}
									break;

								default:
									throw new Error('type指定が不正です');
								}

								group.append(controls);
								form.append(group);
							});
		},

		_getValue: function(element, target, option) {
			option = option || {};
			switch (target) {
			case 'text':
				return element.text();
				break;
			case 'html':
				return element.html();
				break;
			case 'class':
				if (option.enumValue) {
					var ret = $.map(option.enumValue, function(className) {
						if (className == '')
							return;
						if (element.hasClass(className)) {
							return className;
						}
					});
					if (ret.length == 0)
						ret.push('');
					return ret;
				} else if (option.booleanValue != null) {
					return element.hasClass(option.booleanValue);
				} else {
					var currentValueArray = element.attr('class').split(/\s/);
					var ignoreArray = [];
					var resultArray = [];
					function findIgnoreValue(i, r) {
						if (r == null || r == '')
							return;
						$.each(currentValueArray, function(j, v) {
							if (typeof r == 'string') {
								if (v == r)
									ignoreArray.push(v);
							} else {
								if (r.test(v))
									ignoreArray.push(v);
							}
						});
					}
					var ignore = option.ignore || [];
					if (!$.isArray(ignore))
						ignore = [ignore];
					$.each(ignore, findIgnoreValue);
					var designatedClassNames = option.designatedClassNames || [];
					$.each(designatedClassNames, findIgnoreValue);
					if (ignoreArray.length > 0) {
						$.each(currentValueArray, function(i, v) {
							if ($.inArray(v, ignoreArray) == -1) {
								resultArray.push(v);
							}
						});
						//対象外とした値をoption経由で返却
						option.ignoreArray = ignoreArray;
					}
					return resultArray.join(' ');
				}
				break;
			case 'func':
				return option.getValue(element, option);
				break;
			default:
				var match = (target || '').match(/^(attr|style)\((.+)\)$/);
				if (match) {
					switch (match[1]) {
					case 'attr':
						switch (match[2]) {
						case 'disabled':
						case 'checked':
						case 'multiple':
						case 'selected':
						case 'autoplay':
						case 'controls':
						case 'loop':
							return element.prop(match[2]);
							break;
						default:
							return element.attr(match[2]);
						}
						break;
					case 'style':
						var name = this._camelize(match[2]);
						return element[0].style[name];
						break;
					}
				} else {
					throw new Error('target指定が不正です');
				}
			}
		},

		//prototype.js v1.5.0 259
		_camelize: function(str) {
			var parts = str.split('-'),len = parts.length;
			if (len == 1)
				return parts[0];

			var camelized = str.charAt(0) == '-' ? parts[0].charAt(0).toUpperCase()
					+ parts[0].substring(1) : parts[0];

			for ( var i = 1; i < len; i++)
				camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

			return camelized;
		},

		'.controls select.subForm change': function(context) {
			var input = $(context.event.currentTarget);
			var schema = input.data('schema');
			var subForm = schema._elementSubForm;
			this.show(schema._element.eq(input.val()), schema.schema, subForm);
		},

		'.controls button.addItem click': function(context) {
			context.event.preventDefault();
			var current = $(context.event.currentTarget);
			var schema = current.data('schema');
			var newItem = schema.newItem;
			var selectSubForm = schema._elementSelectSubForm;
			var length = selectSubForm.prop('length');
			if (typeof newItem == 'function')
				newItem = newItem(length);
			newItem = $(newItem);
			schema._element = schema._element.add(newItem);

			if (schema.appendItem) {
				schema.appendItem(newItem, schema._itemParent);
			} else {
				schema._itemParent.append(newItem);
			}

			if (schema.schema) {
				var option = $('<option></option>').text(length).val(length);
				var newSelectSubForm = selectSubForm.clone(true);
				newSelectSubForm.append(option).prop('selectedIndex', length);
				selectSubForm.replaceWith(newSelectSubForm);
				schema._elementSelectSubForm = newSelectSubForm;
				var subForm = schema._elementSubForm;
				this.show(newItem, schema.schema, subForm);
			} else {
				selectSubForm.val(schema._element.length);
			}
		},

		'.controls button.removeItem click': function(context) {
			context.event.preventDefault();
			var current = $(context.event.currentTarget);
			var schema = current.data('schema');
			var selectSubForm = schema._elementSelectSubForm;
			// schema.schemaがない(=subFormの値がindexじゃなくて個数)なら、値から1引いてindexにしてitemを取得する
			var item = schema._element.eq(selectSubForm.val() - (schema.schema ? 0 : 1));
			schema._element = schema._element.not(item);
			if (schema.removeItem) {
				schema.removeItem(item);
			} else {
				item.remove();
			}

			if (schema.schema) {
				var newSelectSubForm = selectSubForm.clone(true);
				newSelectSubForm.empty();
				var subForm = schema._elementSubForm;
				if (schema._element.length) {
					for ( var i = 0; i < schema._element.length; i++) {
						var option = $('<option></option>').text(i).val(i);
						newSelectSubForm.append(option);
					}
					newSelectSubForm.prop('selectedIndex', 0);
					this.show(schema._element.eq(0), schema.schema, subForm);
				} else {
					subForm.empty();
				}
				selectSubForm.replaceWith(newSelectSubForm);
				schema._elementSelectSubForm = newSelectSubForm;
			} else {
				selectSubForm.val(schema._element.length);
			}
		},

		'.controls select.unit change': function(context, $target) {
			this._onApply($target.prev());
		},

		'.controls button.succ click': function(context) {
			context.event.preventDefault();
			var current = $(context.event.currentTarget);
			var schema = current.data('schema');
			var min = (schema.constraint) ? schema.constraint.min : null;
			var input = schema._elementInput;
			var value = parseFloat(input.val());
			if (isNaN(value))
				value = min || 0;
			value += parseInt(current.val());
			input.val(value);
			this._onApply(input);
		},

		'.controls input, .controls textarea, .controls select.input change': function(context,
				$target) {
			var input = $(context.event.currentTarget);
			var schema = input.data('schema');
			// 単位も入力されていたら自動でセレクトボックスからその単位を選ぶ
			if (schema.unit) {
				var unitVal = $target.val().match(/(\d*)(.*?)$/);
				var val = unitVal && unitVal[1];
				var unit = unitVal && unitVal[2];
				if (unit && $.inArray(unit, schema.unit) !== -1) {
					schema._elementSelectUnit.val(unit);
					$target.val(val);
				}
			}
			if ($.isFunction(schema.onchange)) {
				// onchangeに関数が登録されていたら関数を実行
				schema.onchange(schema._element, $target.val());
			}

			this._onApply(input);
		},

		'.controls input[type="text"], .controls textarea keydown': function(context) {
			// 上下キーの入力かつ、typeが数値型なら数値を上下する
			var $target = $(context.event.currentTarget);
			var type = $target.data('schema').type;
			var event = context.event;
			var keyCode = event.keyCode;
			if ((keyCode === 38 || keyCode === 40)
					&& (!event.altKey && !event.shiftKey && !event.ctrlKey)
					&& (type === 'number' || type === 'integer')) {
				event.preventDefault();
				var val = parseFloat($target.val());
				if (!isNaN(val)) {
					$target.val(parseFloat(val + (39 - keyCode)));
				}
			} else if (keyCode === 13 && $target.is('input')) {
				// inputでのエンターキーをフォームまでバブリングさせない
				event.preventDefault();
			}

			// input[tye="text"]とtextareaはフォーカスはずれないとイベント起きないが、
			// キー入力のたびに更新させたいのでchangeをトリガする
			setTimeout(function() {
				// バックスペース入力時に、valueへの反映が送れるのでsetTimeout()してからトリガ
				$target.trigger('change');
			}, 0);
		},

		'button.apply click': function(context) {
			var button = $(context.event.currentTarget);
			// 各input,textarea,selectについて_onApplyを実行
			var $form = button.parent('form');
			var that = this;
			$form.find('.controls input, .controls textarea, .controls select.input').each(
					function() {
						that._onApply($(this));
					});
		},

		_onApply: function(input) {
			var schema = input.data('schema');
			var validationResult = this._validate(input, schema.type, schema.constraint,
					schema._designatedClassNames);

			if (!validationResult)
				return;

			var option = {};
			switch (schema.type) {
			case 'color':
			case 'string':
				option.inputType = schema.inputType;
				break;

			case 'boolean':
				option.booleanValue = schema.booleanValue;
				break;

			case 'enum':
				option.enumValue = schema.enumValue;
				break;

			case 'number':
			case 'integer':
				option.unit = schema.unit;
				option.elementRangeLabel = schema._elementRangeLabel;
				option.elementRangeCheckbox = schema._elementRangeCheckbox;
				option.elementSelectUnit = schema._elementSelectUnit;
				option.elementButtonSuccArray = schema._elementButtonSuccArray;
				break;
			default:
				option.ignore = schema.ignore;
				option.designatedClassNames = schema._designatedClassNames;
			}

			option.reflect = schema.reflect;

			var newElement = this._reflect(schema._element, schema.target, input, option);
			if (newElement) {
				schema._element = newElement;
			}

			//TODO セット処理はPageControllerに寄せたい
			this._triggerPageChange();
		},

		_validationMessage: {
			VIORATION_NOT_NULL: '指定は必須です',
			VIORATION_MIN_LENGTH: '{0}文字以上で指定してください',
			VIORATION_MAX_LENGTH: '{0}文字以下で指定してください',
			VIORATION_PATTERN: '指定正規表現「{0}」に一致しません',
			VIORATION_TYPE_INTEGER: '整数で指定してください',
			VIORATION_TYPE_NUMBER: '数値で指定してください',
			VIORATION_MIN: '{0}以上で指定してください',
			VIORATION_MAX: '{0}以下で指定してください'
		},

		_validate: function(input, type, constraint, designatedClassNames) {
			var value = input.val();
			var group = input.closest('.control-group');
			var help = group.find('.help-inline');
			var that = this;

			function _onError(msgId, params) {
				group.addClass('error');
				var message = that._validationMessage[msgId];
				var args = [message].concat(params);
				message = h5.u.str.format.apply(null, args);
				help.text(message);
			}

			if (constraint.notNull) {
				if (input.val().length == 0) {
					_onError('VIORATION_NOT_NULL');
					return false;
				}
			} else {
				if (input.val().length == 0) {
					group.removeClass('error');
					help.text('');
					return true;
				}
			}

			switch (type) {
			case 'string':
				if (constraint.minLength != null && value.length < constraint.minLength) {
					_onError('VIORATION_MIN_LENGTH', [constraint.minLength]);
					return false;
				}
				if (constraint.maxLength != null && value.length > constraint.maxLength) {
					_onError('VIORATION_MAX_LENGTH', [constraint.maxLength]);
					return false;
				}
				if (constraint.pattern && !constraint.pattern.test(value)) {
					_onError('VIORATION_PATTERN', [constraint.pattern.source]);
					return false;
				}
				break;

			case 'integer':
				if (!/^\s*[+-]?\d+\s*$/.test(value)) {
					_onError('VIORATION_TYPE_INTEGER');
					return false;
				}
				value = parseInt(value, 10);
				if (constraint.min != null && value < constraint.min) {
					_onError('VIORATION_MIN', [constraint.min]);
					return false;
				}
				if (constraint.max != null && value > constraint.max) {
					_onError('VIORATION_MAX', [constraint.max]);
					return false;
				}
				break;

			case 'number':
				if (!/^\s*[+-]?\d+(?:\.\d+)?\s*$/.test(value)) {
					_onError('VIORATION_TYPE_NUMBER');
					return false;
				}
				value = parseFloat(value);
				if (constraint.min != null && value < constraint.min) {
					_onError('VIORATION_MIN', [constraint.min]);
					return false;
				}
				if (constraint.max != null && value > constraint.max) {
					_onError('VIORATION_MAX', [constraint.max]);
					return false;
				}
				break;
			}
			group.removeClass('error');
			help.text('');
			return true;
		},

		_reflect: function(element, target, input, option) {
			option = option || {};
			var value = input.val();
			var newElement = null;

			if (input.is('input[type="checkbox"]')) {
				if (!input.prop('checked'))
					value = '';
			}

			if (value != null && value != '' && option.unit != null) {
				if ($.isArray(option.unit)) {
					value += option.elementSelectUnit.val();
				} else {
					value += option.unit;
				}
			}

			switch (target) {
			case 'text':
				if (option.inputType == 'textarea') {
					element.html(h5.u.str.escapeHtml(value).replace(/(\r\n|\r|\n)/g, '<br/>')
							.replace(/ /g, '&nbsp;'));
				} else {
					element.text(value);
				}
				if (option.reflect)
					newElement = option.reflect(element, value, input, option);
				break;

			case 'html':
				element.html(value);
				if (option.reflect)
					newElement = option.reflect(element, value, input, option);
				break;

			case 'class':
				if (option.enumValue) {
					$.each(option.enumValue, function(i, className) {
						if (className == '' || className == value)
							return;
						element.removeClass(className);
					});

					if (!(value instanceof Array)) {
						value = [value];
					}
					$.each(value, function(i, className) {
						if (this == '')
							return;
						element.addClass(className);
					});
				} else if (option.booleanValue != null) {
					if (value == option.booleanValue) {
						element.addClass(option.booleanValue);
					} else {
						element.removeClass(option.booleanValue);
					}
				} else {
					var currentValueArray = element.attr('class').split(/\s+/);
					var resultArray = [];
					function addValue(i, r) {
						if (r == null || r == '')
							return;
						$.each(currentValueArray, function(j, v) {
							if (typeof r == 'string') {
								if (v == r) {
									resultArray.push(v);
									return false;
								}
							} else {
								if (r.test(v)) {
									resultArray.push(v);
									return false;
								}
							}
						});
					}
					var ignore = option.ignore || [];
					if (!$.isArray(ignore))
						ignore = [ignore];
					$.each(ignore, addValue);
					var designatedClassNames = option.designatedClassNames || [];
					$.each(designatedClassNames, addValue);
					if (resultArray.length > 0) {
						value += ' ' + resultArray.join(' ');
					}
					element.attr('class', value);
				}
				if (option.reflect)
					newElement = option.reflect(element, value, input, option);
				break;

			case 'func':
				newElement = option.reflect(element, value, input, option);
				break;

			default:
				var match = target.match(/^(attr|style)\((.+)\)$/);
				if (match) {
					switch (match[1]) {
					case 'attr':
						switch (match[2]) {
						case 'disabled':
						case 'checked':
						case 'multiple':
						case 'selected':
						case 'autoplay':
						case 'controls':
						case 'loop':
							element.prop(match[2], !!value);
							break;
						default:
							element.attr(match[2], value);
						}
					case 'style':
						//var name = this._camelize(match[2]);
						//element[0].style[name] = value;
						element.css(match[2], value);
					}
					if (option.reflect)
						newElement = option.reflect(element, value, input, option);
				} else {
					throw new Error('target指定が不正です');
				}
			}

			if (input.is('input[type="range"]') && option.elementRangeCheckbox) {
				option.elementRangeCheckbox.prop('checked', true).val(value);
			}

			if (option.elementButtonSuccArray) {
				$.each(option.elementButtonSuccArray, function(i, btn) {
					var schema = btn.data('schema');
					var min = schema.constraint != null ? schema.constraint.min : null;
					var max = schema.constraint != null ? schema.constraint.max : null;
					var wk = parseFloat(value);
					if (isNaN(wk))
						wk = min || max || 0;
					var afterSucc = wk + (parseInt(btn.val(), 10));
					btn.prop('disabled', afterSucc < min || afterSucc > max);
				});
			}

			if (option.elementRangeLabel) {
				var text = (value != null && value != '') ? value : '指定なし';
				option.elementRangeLabel.text(text);
			}

			return newElement;
		},

		_triggerPageChange: function() {
			var pageController = hifive.editor.u.getFocusedPageController();
			//pageController.trigger(hifive.editor.consts.EVENT_PAGE_CONTENTS_CHANGE);
			pageController._triggerPageContentsChange(); //TODO 本当はPageController側でやるべき
		}
	};

	h5.core.expose(genericParameterEditController);
})();
