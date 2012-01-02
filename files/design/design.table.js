	
	/////////////////////////////////
	//// design methods (table)
	/////////////////////////////////
		
	/**
	 * generating the table
	 * 
	 * @this {Colletion Object}
	 * @param {Number} [count=4] - td number to a string
	 * @param {String} [tag="td"] - tag name
	 * @param {Boolean} [empty=true] - display empty cells
	 * @return {Colletion Object}
	 */
	$.Collection.fn.genTable = function (count, tag, empty) {
		count = count || 4;
		tag = tag || "td";
		empty = empty === false ? false : true;
		var
			i = 1, j,
	
			target = this.dObj.active.target,
			tagLength = target.find(tag).length,
	
			queryString = "";
		
		target.find(tag).each(function (n) {
			if (this.tagName !== "td") { $(this).wrap("<td></td>"); }
			//
			if (i === count) {
				queryString = "";
				//
				for (j = -1; ++j < count;) {
					queryString += "td:eq(" + (n - j) + ")";
					if (j !== (count - 1)) { queryString += ","; }
				}
				//
				target.find(queryString).wrapAll("<tr></tr>");
				i = 0;
			} else if (n === (tagLength - 1) && i !== count) {
				queryString = "";
				//
				for (j = -1, i; ++j < i;) {
					queryString += "td:eq(" + (n - j) + ")";
					if (j !== (i - 1)) { queryString += ","; }
				}
				i--;
				target.find(queryString).wrapAll("<tr></tr>");	
				//
				if (empty === true) {
					queryString = "";
					for (; ++i < count;) { queryString += "<td></td>"; }
					target.find("tr:last").append(queryString);
				}
			}
			i++;
		});
		if (target[0].tagName !== "table") { target.children("tr").wrapAll("<table></table>"); }
	
		return this;
	};