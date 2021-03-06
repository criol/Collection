	
	/////////////////////////////////
	// additional methods
	/////////////////////////////////
	
	/**
	 * calculate custom filter
	 * 
	 * @this {Colletion Object}
	 * @param {Filter|String|Boolean} [filter=false] - filter function, string expressions or "false"
	 * @param {Collection} data - link to collection
	 * @param {Number|String} i - iteration (key)
	 * @param {Number} cOLength - collection length
	 * @param {Collection Object} self - link to collection object
	 * @param {String} id - collection ID
	 * @return {Boolean}
	 */
	$.Collection.fn._customFilter = function (filter, el, i, data, cOLength, self, id) {
		var
			dObj = this.dObj,
			active = dObj.active,
			sys = dObj.sys,
			
			fLength,
			calFilter, tmpFilter,
			
			result = true, tmpResult,
			and, or, inverse,
			
			j = -1;
		
		// if filter is disabled
		if (filter === false) { return true; }
		// if filter is function
		if ($.isFunction(filter)) { return filter.call(filter, el, i, data, cOLength, self, id); }
		
		// if filter is not defined or filter is a string constant
		if (!filter || ($.isString(filter) && $.trim(filter) === this.ACTIVE)) {
			if (active.filter) {
				if ($.isFunction(active.filter)) { return active.filter.call(active.filter, el, i, data, cOLength, self, id); }
				return this._customFilter(active.filter, el, i, data, cOLength, self, id)
			}
			
			return true;
		} else {
			// if filter is string
			if (!$.isArray(filter)) {
				// if simple filter
				if (filter.search(/\|\||&&|!/) === -1) {
					if (filter.search(/^\s*:/) !== -1) {
						tmpFilter = new Function("el", "i", "data", "cOLength", "self", "id", "var key = i; return " + filter.replace(/^\s*:/, "") + ";");
						return tmpFilter.call(tmpFilter, el, i, data, cOLength, self, id);
					}
					//
					if ($.isFunction(sys.tmpFilter[filter])) { return sys.tmpFilter[filter].call(sys.tmpFilter[filter], el, i, data, cOLength, self, id); }
					//
					return this._customFilter(sys.tmpFilter[filter], el, i, data, cOLength, self, id)
				}
				filter = $.trim(
							filter
								.toString()
								.replace(/\s*(\(|\))\s*/g, " $1 ")
								.replace(/\s*(\|\||&&)\s*/g, " $1 ")
								.replace(/(!)\s*/g, "$1")
						).split(" ");
			}
			// calculate deep filter
			calFilter = function (array, iter) {
				var
					i = -1,
					aLength = array.length,
					pos = 0,
					result = [];
				
				for (; (i += 1) < aLength;) {
					iter += 1;
					if (array[i] === "(") { pos += 1; }
					if (array[i] === ")") {
						if (pos === 0) {
							return {result: result, iter: iter};
						} else { pos -= 1; }
					}
					result.push(array[i]);
				}
			};
			
			// calculate filter
			fLength = filter.length;
			for (; (j += 1) < fLength;) {
				// calculate atoms
				if (filter[j] === "(" || filter[j] === "!(") {
					if (filter[j].substring(0, 1) === "!") {
						inverse = true;
						filter[j] = filter[j].substring(1);
					} else { inverse = false; }
					
					tmpFilter = calFilter(filter.slice((j + 1)), j);
					j = tmpFilter.iter;
					//
					tmpResult = this._customFilter(tmpFilter.result, el, i, data, cOLength, self, id);
					if (!and && !or) {
						result = inverse === true ? !tmpResult : tmpResult;
					} else if (and) {
						result = inverse === true ? !tmpResult : tmpResult && result;
					} else { result = inverse === true ? !tmpResult : tmpResult || result; }
				// calculate outer filter
				} else if (filter[j] !== ")" && filter[j] !== "||" && filter[j] !== "&&") {
					if (filter[j].substring(0, 1) === "!") {
						inverse = true;
						filter[j] = filter[j].substring(1);
					} else { inverse = false; }
					
					tmpFilter = filter[j] === this.ACTIVE ? active.filter : sys.tmpFilter[filter[j]];
					tmpResult = tmpFilter.call(tmpFilter, el, i, data, cOLength, self, id);
					if (!and && !or) {
						result = inverse === true ? !tmpResult : tmpResult;
					} else if (and) {
						result = inverse === true ? !tmpResult : tmpResult && result;
					} else { result = inverse === true ? !tmpResult : tmpResult || result; }
				// "and" or "or"
				} else if (filter[j] === "||") {
					and = false;
					or = true;
				} else if (filter[j] === "&&") {
					or = false;
					and = true;
				}
			}
			
			return result;
		}
	};
	/**
	 * calculate custom parser
	 * 
	 * @this {Colletion Object}
	 * @param {Parser|String|Boolean} parser - parser function or string expressions or "false"
	 * @param {String} str - source string
	 * @return {String}
	 */
	$.Collection.fn._customParser = function (parser, str) {
		var
			dObj = this.dObj,
			active = dObj.active,
			sys = dObj.sys,
			
			tmpParser;
		
		// if parser is disabled
		if (parser === false) { return str; }
		// if parser is function
		if ($.isFunction(parser)) { return parser.call(parser, str, this); }
		
		// if parser is not defined or parser is a string constant
		if (!parser || ($.isString(parser) && $.trim(parser) === this.ACTIVE)) {
			if (active.parser) { return active.parser.call(active.parser, str, this); }
	
			return str;
		} else {
			if ($.isString(parser)) {
				parser = $.trim(parser);
				// if simple parser
				if (parser.search("&&") === -1) { return sys.tmpParser[parser].call(sys.tmpParser[parser], str, this); }
				parser = parser.split("&&");
			}
			//
			parser.forEach(function (el) {
				el = $.trim(el);
				tmpParser = el === this.ACTIVE ? active.parser : sys.tmpParser[el];
				
				str = tmpParser.call(tmpParser, str, this);
			}, this);
	
			return str;
		}
	};
	
	/**
	 * calculate parent context
	 * 
	 * @this {Colletion Object}
	 * @param {Number} [n=1] - level up
	 * @param {String} [id=this.ACTIVE] - collection ID
	 * @return {String}
	 */
	$.Collection.fn.parentContext = function (n, id) {
		n = n || 1;
		var context = "", i;
		//
		context = this._get("collection", id || "").split(nimble.CHILDREN);
        for (i = n; (i -= 1) > -1;) { context.splice(-1, 1); }
	
		return context.join(nimble.CHILDREN);
	};
	/**
	 * parent
	 * 
	 * @this {Colletion Object}
	 * @param {Number} [n=1] - level up
	 * @param {String} [id=this.ACTIVE] - collection ID
	 * @return {Colletion Object}
	 */
	$.Collection.fn.parent = function (n, id) {
		var
			dObj = this.dObj,
			sys = dObj.sys,
			active = dObj.active,
	
			contextID = sys.contextID,
			context = this.parentContext.apply(this, arguments);
	
		if (!id || id === this.ACTIVE) {
			if (contextID) { sys.tmpContext[contextID] = context; }
			active.context = context;
		} else {
			sys.tmpContext[id] = context;
			if (contextID && id === contextID) { active.context = context; }
		}
	
		return this;
	};