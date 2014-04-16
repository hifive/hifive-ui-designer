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

	// ------------- 各パーツ共通の変数/関数定義 -------------
	var holderData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAACMCAYAAACuwEE+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATmSURBVHhe7Zi7TiNBEEVnN+IVQYhEiEQIITGfzTdACCIDQUCASXhlu1sjlTR47cWX5HLZ05LlYbrsqjl13NPDj9ls9mtgQGBFAj9XjCMMAiMBhEEEiQDCSLgIRhgckAggjISLYITBAYkAwki4CEYYHJAIIIyEi2CEwQGJAMJIuAhGGByQCCCMhItghMEBiQDCSLgIRhgckAggjISLYITBAYkAwki4CEYYHJAIIIyEi2CEwQGJAMJIuAhGGByQCCCMhItghMEBiQDCSLgIRhgckAggjISLYITBAYkAwki4CEYYHJAIIIyEi2CEwQGJAMJIuAhGGByQCCCMhItghMEBiQDCSLgIRhgckAggjISLYITBAYkAwki4CEYYHJAIIIyEi2CEwQGJAMJIuAhGGByQCCCMhItghMEBiQDCSLgIRhgckAggjISLYITBAYkAwki4CEYYHJAIIIyEi2CEwQGJAMJIuAhGGByQCCCMhItghMEBiQDCSLgIRhgckAj8mM1mv6RPfMHgP9cwnJ2dDbu7u8PBwcG7CntuZ2dnODw8HOdubm6Gq6ur8XhjY2M4Pj5e+aouLi6Gu7u74ejoaNje3n73uZ7b398f9vb2xrnz8/Ph4eFhPF5U38qJv0hg/ApTzS9Zlo3r6+u/pkqWat7Jycnw8vIyNnWVUXEly7IxP1e1lSwlV0lU83UueUQLM10pFjWhGzad64Ztbm6Op2vl6RWghDg9PR1qVapXHbdM05ViUa5F0vX31krUK06fS5UmWphe5uvXu2j0SjKde35+Hv/c2toa39fW1sb3EqRvWZeXl0O9avS5Oq6VogSbHy1mrVrT8fr6Ot7yetRxnUse0cLUr3Z+z9LNqP1EjWXzy5pWTa/bVL2mApQ483uW/o7b29tRpF61koX4qPZoYZZdXK0WtV9YtvL8C8pUsFVkKzFLrulK9BH05PlvKcz9/f3Yk7ol1T6kRu0dap/Rq8DT09N4/u3tbXzv1WO6F1llM/z4+Dh+vvL0k1e9121qfX19lKlHHde55PEthamVoZ6A+lUN6sfq3nz2Xqb2FL0vme5FejP80VNNPZJ3nl7R+rG6v7c30V0HwoQRqM1r3bJ69enbSe1FapRw8+c+c4klZ+2D6rG//0/Uwn7m+77CZ77FP+6+Asj/pYZveUv6X5rnuE6EcVAPzokwwc1zlI4wDurBOREmuHmO0hHGQT04J8IEN89ROsI4qAfnRJjg5jlKRxgH9eCcCBPcPEfpCOOgHpwTYYKb5ygdYRzUg3MiTHDzHKUjjIN6cE6ECW6eo3SEcVAPzokwwc1zlI4wDurBOREmuHmO0hHGQT04J8IEN89ROsI4qAfnRJjg5jlKRxgH9eCcCBPcPEfpCOOgHpwTYYKb5ygdYRzUg3MiTHDzHKUjjIN6cE6ECW6eo3SEcVAPzokwwc1zlI4wDurBOREmuHmO0hHGQT04J8IEN89ROsI4qAfnRJjg5jlKRxgH9eCcCBPcPEfpCOOgHpwTYYKb5ygdYRzUg3MiTHDzHKUjjIN6cE6ECW6eo3SEcVAPzokwwc1zlI4wDurBOREmuHmO0hHGQT04J8IEN89ROsI4qAfnRJjg5jlKRxgH9eCcCBPcPEfpCOOgHpwTYYKb5ygdYRzUg3MiTHDzHKUjjIN6cE6ECW6eo/Tff5QU4ylJIbEAAAAASUVORK5CYII=';

	/**
	 * ボタンの編集スキーマ。各ボタン共通。
	 */
	function getBaseButtonSchema(selector, option) {
		option = option || {};
		var labelSelector;
		if (selector instanceof Array) {
			labelSelector = selector[0];
			selector = selector[1];
		} else {
			labelSelector = selector;
		}
		var prefixLabel = option.prefixLabel || '';

		var buttonSchema = [{
			label: prefixLabel + 'ラベル',
			selector: labelSelector,
			type: 'string',
			target: 'text'
		}, {
			label: prefixLabel + '無効',
			selector: selector,
			type: 'boolean',
			target: 'attr(disabled)'
		}];
		return buttonSchema;
	}

	/**
	 * ブートストラップ(2)の編集スキーマ。
	 */
	function getBootstrapButtonSchema(selector, option) {

		option = option || {};
		selector = selector instanceof Array ? selector[1] : selector;

		var prefixLabel = option.prefixLabel || '';

		var buttonSchema = getBaseButtonSchema(selector, option);

		buttonSchema.push({
			label: prefixLabel + 'タイプ',
			selector: selector,
			type: 'enum',
			enumValue: [['Default', ''], ['Primary', 'btn-primary'], ['Info', 'btn-info'],
					['Success', 'btn-success'], ['Warning', 'btn-warning'],
					['Danger', 'btn-danger'], ['Inverse', 'btn-inverse'], ['Link', 'btn-link']],
			target: 'class'
		}, {
			label: prefixLabel + 'サイズ',
			selector: selector,
			type: 'enum',
			enumValue: [['Large', 'btn-large'], ['Default', ''], ['Small', 'btn-small'],
					['Mini', 'btn-mini']],
			target: 'class'
		});
		if (!option.notBlock) {
			buttonSchema.push({
				label: prefixLabel + 'ブロック',
				selector: selector,
				type: 'boolean',
				booleanValue: 'btn-block',
				target: 'class'
			});
		}
		return buttonSchema;
	}

	/**
	 * ブートストラップ3の編集スキーマ。
	 */
	function getBootstrap3ButtonSchema(selector, option) {

		option = option || {};
		selector = selector instanceof Array ? selector[1] : selector;

		var prefixLabel = option.prefixLabel || '';

		var buttonSchema = getBaseButtonSchema(selector, option);

		buttonSchema.push({
			label: prefixLabel + 'タイプ',
			selector: selector,
			type: 'enum',
			enumValue: [['Default', ''], ['Primary', 'btn-primary'], ['Info', 'btn-info'],
					['Success', 'btn-success'], ['Warning', 'btn-warning'],
					['Danger', 'btn-danger'], ['Link', 'btn-link']],
			target: 'class'
		}, {
			label: prefixLabel + 'サイズ',
			selector: selector,
			type: 'enum',
			enumValue: [['Large', 'btn-lg'], ['Default', ''], ['Small', 'btn-sm'],
					['Mini', 'btn-xs']],
			target: 'class'
		});
		if (!option.notBlock) {
			buttonSchema.push({
				label: prefixLabel + 'ブロック',
				selector: selector,
				type: 'boolean',
				booleanValue: 'btn-block',
				target: 'class'
			});
		}
		return buttonSchema;
	}

	h5.u.obj.expose('hifive.editor.ui', {
		holderData: holderData,
		getButtonSchema: getBaseButtonSchema,
		getBootstrapButtonSchema: getBootstrapButtonSchema,
		getBootstrap3ButtonSchema: getBootstrap3ButtonSchema
	});

	//-------------------------------------------------------------------
	// jQueryモジュールの追加
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'jquery',
		dependencies: {
			js: '$SYSTEM_LIB$/jquery/jquery.js'
		}
	});
})();