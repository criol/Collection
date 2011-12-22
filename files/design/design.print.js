	
	/////////////////////////////////
	//// design methods (print)
	/////////////////////////////////
	
	/**
	 * simple templating (in context)
	 * 
	 * @this {Colletion Object}
	 * @param param - object settings
	 * @param {Template} [param.template=this.dObj.active.template] - template
	 * @param {jQuery Object|Boolean} [param.target=this.dObj.active.target] - element to output the result ("false" - if you print a variable)
	 * @param {String} [param.variable=this.dObj.sys.variableID] - variable ID (if param.target === false)
	 * @param {Filter|String|Boolean} [filter=false] - filter function, string expressions or "false"
	 * @param {Parser|String|Boolean} [param.parser=this.dObj.active.parser] - parser function, string expressions or "false"
	 * @param {String} [param.appendType=this.dObj.active.appendType] - type additions to the DOM
	 * @param {String} [param.resultNull=this.dObj.active.resultNull] - text displayed if no results
	 * @param {Boolean} [mult=true] - enable mult mode
	 * @param {Number|Boolean} [count=false] - maximum number of results (by default: all object)
	 * @param {Number|Boolean} [from=false] - skip a number of elements (by default: -1)
	 * @param {Number|Boolean} [indexOf=false] - starting point (by default: -1)
	 * @return {Colletion Object}
	 */
	$.Collection.fn.print = function (param, mult, count, from, indexOf) {
		// values by default
		mult = mult === false ? false : true;
		count = parseInt(count) >= 0 ? parseInt(count) : false;
		from = parseInt(from) || false;
		indexOf = parseInt(indexOf) || false;
		
		var
			dObj = this.dObj,
			opt = {},
	
			result = "", action;
		//
		$.extend(true, opt, dObj.active, param);
		action = function (data, i, cOLength, self, id) {
			// callback
			opt.callback && opt.callback.apply(this, arguments);
			//
			result += opt.template.call(data[i], data, i, cOLength, self, id);
			if (mult !== true) { return false; }
			
			return true;
		};
		// "callee" link
		dObj.sys.callee.template = opt.template;		
		this.each(action, opt.filter, this.config.constants.active, mult, count, from, indexOf);
		
		result = !result ? opt.resultNull === false ? '<div class="' + dObj.css.noResult + '">' + dObj.viewVal.noResult + '</div>' : opt.resultNull : result;
		result = opt.parser !== false ? this.customParser(opt.parser, result) : result;
		
		if (opt.target === false) {
			if (!opt.variable) {
				this.$_("variable", result);
			} else {
				this._push("variable", opt.variable, result);
			}
		} else { opt.target[opt.appendType](result); }
	
		return this;
	};