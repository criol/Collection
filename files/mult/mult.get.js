	
	/////////////////////////////////
	//// mult methods (get)
	/////////////////////////////////
	
	/**
	 * get elements (in context)
	 *
	 * // overloads:
	 * 1) if the id is a Boolean, it is considered as mult.
	 * 
	 * @this {Colletion Object}
	 * @param {Filter|String|Boolean|Context|Null} [filter=false] - filter function, string expressions or "false" or context (overload)
	 * @param {String} [id=this.ACTIVE] - collection ID
	 * @param {Boolean} [mult=true] - enable mult mode
	 * @param {Number|Boolean} [count=false] - maximum number of results (by default: all object)
	 * @param {Number|Boolean} [from=false] - skip a number of elements (by default: -1)
	 * @param {Number|Boolean} [indexOf=false] - starting point (by default: -1)
	 * @return {mixed}
	 */
	$.Collection.fn.get = function (filter, id, mult, count, from, indexOf) {
		if ($.isNumeric(filter) || (arguments.length < 2 && $.isString(filter)
			&& !this.filterTest(filter)) || arguments.length === 0 || (arguments.length < 2 && filter === null)) {
				return this._getOne(filter, id || "");
			}
		//
		filter = $.isExist(filter) && filter !== true ? filter : this.getActiveParam("filter");
		id = $.isExist(id) ? id : this.ACTIVE;
	
		// if id is Boolean
		if ($.isBoolean(id)) {
			indexOf = from;
			from = count;
			count = mult;
			mult = id;
			id = this.ACTIVE;
		}
	
		// values by default
		mult = mult === false ? false : true;
		count = parseInt(count) >= 0 ? parseInt(count) : false;
		from = parseInt(from) || false;
		indexOf = parseInt(indexOf) || false;
	
		var
			result = mult === true ? [] : -1,
			action = function (el, i, data, aLength, self, id) {
				if (mult === true) {
					result.push(data[i]);
				} else { result = data[i]; }
	
				return true;
			};
	
		this.forEach(action, filter, id, mult, count, from, indexOf);
	
		return result;
	};
	/**
	 * get element (in context)
	 * 
	 * @this {Colletion Object}
	 * @param {Filter|String|Boolean|Context} [filter=false] - filter function, string expressions or "false" or context (overload)
	 * @param {String} [id=this.ACTIVE] - collection ID
	 * @return {mixed}
	 */
	$.Collection.fn.getOne = function (filter, id) {
		return this.get($.isExist(filter) ? filter : "", id || "", false);
	};