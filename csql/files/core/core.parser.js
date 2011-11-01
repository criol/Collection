// Лексический анализатор
CSQL.prototype.runSubQuery = function (str, j) {
	alert(j)
};
CSQL.prototype.query = function (queryStr, link) {
	var
		cacheObj = CSQL.cache,
		cacheLexeme = cacheObj.lexeme,
		helper = cacheObj.helper,
		
		lexeme,
		lexemeLength,
		
		// Лимит
		limitFrom = null,
		limitCount = null,
		mult = true,
		
		// Анализ сортировки
		order = "",
	
		// Токены
		token = "",
		tmpToken,
		
		// Анализ выборки
		action,
		actionStr = "",
		prevTable,
		
		// Анализ объединения
		qCheck = queryStr.search("JOIN"),
		join,
		
		// Контроллер запроса типа SELECT
		select,
		
		// Поля выборки
		fields = [],
		fieldsName = [],
		fieldsLink = link && link.fieldsLink ? link.fieldsLink : {},
		
		// Таблица выборки
		from = "",
		tmpTable,
		tablesName = link && link.tablesName ? link.tablesName : {},
		
		// Анализ условия
		whereStr = "return ",
		where = false,
		
		i = -1, key,
		result;
	
	// Преоброзауем строку запроса во множество лексем
	lexeme = cacheLexeme.makeLexeme(cacheLexeme.prepareStr(queryStr));
	lexemeLength = lexeme.length - 1;
	
	// 
	for (; i++ < lexemeLength;) {
		// Разбираем токены
		tmpToken = cacheLexeme.makeTokens(lexeme[i], token);
		if (tmpToken !== true) {
			token = tmpToken;
			continue;
		}
		
		// Анализ SELECT условия
		if (token === "SELECT") {
			fields.push(lexeme[i]);
			if (lexeme[i + 1] !== "AS") {
				fieldsName.push(lexeme[i].replace(/.*?(?:\[|)([\w'"]+)(?:\]|)$/, "$1").split(/'|"/).join(""));
			}
			select = true;	
		// Псевдонимы полей выбора	
		} else if (token === "SELECT AS") {
			fieldsName.push(lexeme[i]);
			fieldsLink[lexeme[i]] = lexeme[i - 2];
			
			token = "SELECT";
						
		// Анализ FROM условия
		} else if (token === "FROM") {
			from = lexeme[i].split("`").join("");
			tablesName[from] = from;
		// Псевдонимы источника
		} else if (token === "FROM AS") {
			tablesName[lexeme[i]] = from;	
			token = "FROM";
		
		// Анализ WHERE условия
		} else if (token === "WHERE") {
			if (qCheck !== -1) { whereStr += "&&"; }
			qCheck = -1;
			
			whereStr += helper.tableCSQLReplacer(lexeme[i], tablesName, fieldsLink);	
		
		// Анализ ORDER BY условия
		} else if (token === "ORDER BY") {
			order = lexeme[i];
		}
	}
	
	console.log(whereStr);
	// Компиляция условия
	if (whereStr !== "return ") { where = new Function("$this", "i", "aLength", "$obj", "id", whereStr); }
	
	// Компиляция SELECT запроса
	if (select === true) {
		result = {};
		
		actionStr = "\
			var custObj = {};\
			if (!CSQL.tmp.result[id]) {\
				CSQL.tmp.result[id] = [];\
			}\
			if ('" + fields[0].replace(/'/g, "\\'") + "' === '*') {\
				$.extend(custObj, $this[0]";		
		//
		for (key in tablesName) {
			if (tablesName.hasOwnProperty(key)) {
				if (tablesName[key] !== from && tablesName[key] !== prevTable) {
					prevTable = tablesName[key];
					actionStr += "," + helper.tableCSQLReplacer("`" + key + "`", tablesName, fieldsLink) + "[i]";
				}
			}
		}
		//
		actionStr += ");CSQL.tmp.result[id].push(custObj);\
			}\
		";
		
		// проверка уникальности ключа результата
		while (CSQL.tmp.result[from]) { from += "_" + Math.random(); }
		
		if (fields[0] !== "*") {
			actionStr += "else {";
			for (i = fields.length; i--;) {
				if (fieldsName[i].search("\\*") === -1) {
					actionStr += "custObj['" + fieldsName[i] + "']=" + helper.tableCSQLReplacer(fields[i], tablesName, fieldsLink) + ";";
				} else {
					actionStr += "$.extend(custObj," + helper.tableCSQLReplacer(fields[i], tablesName, fieldsLink) + ");";
				}
			}
			actionStr += "} CSQL.tmp.result[id].push(custObj);";
		}
		actionStr += "return true;";
		action = new Function ("$this", "i", "aLength", "$obj", "id", actionStr);

		this.each(action, where, from, mult, limitCount, limitFrom);
		
		result = mult === true ? CSQL.tmp.result[from] || [] : CSQL.tmp.result[from][0];
		delete CSQL.tmp.result[from];
			
		if (order) {
			result.sort($.Collection.cache.sort.sortBy(order, token === "DESC" ? true : false, null));
		}
		
		return result;
	}
		
	return this;
};