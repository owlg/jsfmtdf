javascript:(function() {
/* Generated using JavaScripthon: https://github.com/metapensiero/metapensiero.pj */
	var _pj;
	function _pj_snippets(container) {
		function in_es6(left, right) {
			if (((right instanceof Array) || ((typeof right) === "string"))) {
				return (right.indexOf(left) > (- 1));
			} else {
				if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
					return right.has(left);
				} else {
					return (left in right);
				}
			}
		}

		function set_properties(cls, props) {
			var desc, value;
			var _pj_a = props;
			for (var p in _pj_a) {
				if (_pj_a.hasOwnProperty(p)) {
					value = props[p];
					if (((((! ((value instanceof Map) || (value instanceof WeakMap))) && (value instanceof Object)) && ("get" in value)) && (value.get instanceof Function))) {
						desc = value;
					} else {
						desc = {"value": value, "enumerable": false, "configurable": true, "writable": true};
					}
					Object.defineProperty(cls.prototype, p, desc);
				}
			}
		}

		container["in_es6"] = in_es6;
		container["set_properties"] = set_properties;
		return container;
	}

	_pj = {};
	_pj_snippets(_pj);

	class Rules {
	}

	_pj.set_properties(Rules, {"brackets": "[]{}()", "f": ["def", "class"], "fields": ".", "letters": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", "numbers": "0123456789", "one_line_comment": "#", "ops": "=+-*@/%&|^<>:!~\\", "reserved": ["pass", "break", "continue", "global", "nonlocal", "assert", "del", "import", "from", "as", "if", "elif", "else", "while", "for", "in", "with", "try", "except", "finally", "return", "raise", "def", "class", "lambda", "or", "and", "not", "yield"], "spaces": [" ", "\t"], "treated_as_text": "_,.;", "values": ["True", "False", "None"]});

	class Parser {
		constructor(text, rules) {
			this.position = 0;
			this.comment = false;
			this.new_line = true;
			this.opening = "\"";
			this.fname = false;
			this.rules = rules;
			this.text = text;
			this.parsers = ["parse_br", "parse_space", "parse_comment", "parse_string", "parse_number", "parse_bracket", "parse_operator", "parse_text"];
		}

		get_symbol() {
			if ((this.text.length === this.position)) {
				return "";
			}
			this.position = (this.position + 1);
			return this.text[(this.position - 1)];
		}
	
		push_back(sym) {
			if ((sym !== "")) {
				this.position = (this.position - 1);
			}
		}
	
		parse_br() {
			var sym;
			sym = this.get_symbol();
			if ((sym === "\n")) {
				this.new_line = true;
				return [true, "<br>", "none", false];
			}
			this.push_back(sym);
			return [false, "", "", false];
		}
	
		parse_space() {
			var buf, sp, sym;
			this.new_line = false;
			sym = this.get_symbol();
			buf = "";
			while (((sym === " ") || (sym === String.fromCharCode(160)))) {
				if ((sym === " ")) {
					buf = buf.concat(" ");
				} else {
					buf = buf.concat("&nbsp;");
				}
				sym = this.get_symbol();
			}
			this.push_back(sym);
			if ((buf.length > 0)) {
				return [true, buf, "none", false];
			}
			return [false, "", "", false];
		}
	
		parse_comment() {
			var buf, sym;
			sym = this.get_symbol();
			buf = "";
			if ((sym !== this.rules.one_line_comment)) {
				this.push_back(sym);
				return [false, "", "", false];
			}
			while (((sym !== "\n") && (sym !== ""))) {
				buf = buf.concat(sym);
				sym = this.get_symbol();
			}
			this.push_back(sym);
			return [true, buf, "comment", false];
		}
	
		triple_seq(sym) {
			return (((this.text.length > (this.position + 2)) && (this.text[this.position] === sym)) && (this.text[(this.position + 1)] === sym));
		}
	
		parse_string() {
			var buf, esc, sym;
			sym = this.get_symbol();
			buf = "";
			if ((((! this.comment) && (sym !== "\"")) && (sym !== "'"))) {
				this.push_back(sym);
				return [false, "", "", false];
			}
			if ((sym === "")) {
				return [false, "", "", false];
			}
			if ((! this.comment)) {
				this.opening = sym;
				if (this.triple_seq(sym)) {
					buf = sym.concat(sym);
					this.position = (this.position + 2);
					this.comment = true;
				}
				buf = buf.concat(sym);
			} else {
				this.push_back(sym);
			}
			esc = false;
			while (true) {
				sym = this.get_symbol();
				if ((sym === "")) {
					break;
				}
				if ((! this.comment)) {
					if (((sym === this.opening) && (! esc))) {
						buf = buf.concat(sym);
						return [true, buf, "string", false];
					}
				} else {
					if ((sym === "\n")) {
						this.push_back(sym);
						return [true, buf, "string", false];
					}
					if ((((sym === this.opening) && (! esc)) && this.triple_seq(sym))) {
						buf = buf.concat(sym, sym, sym);
						this.position = (this.position + 2);
						this.comment = false;
						return [true, buf, "string", false];
					}
				}
				buf = buf.concat(sym);
				if (esc) {
					esc = false;
				} else {
					if ((sym === "\\")) {
						esc = true;
					}
				}
			}
			return [false, "", "", false];
		}
	
	
		parse_symbols(symbols, ent) {
			var buf, sym;
			sym = this.get_symbol();
			buf = "";
			while (((sym !== "") && _pj.in_es6(sym, symbols))) {
				buf = buf.concat(sym);
				sym = this.get_symbol();
			}
			this.push_back(sym);
			if ((buf.length > 0)) {
				return [true, buf, ent, false];
			}
			return [false, "", "", false];
		}
	
		parse_number() {
			return this.parse_symbols(this.rules.numbers, "number");
		}
	
		parse_bracket() {
			return this.parse_symbols(this.rules.brackets, "bracket");
		}
	
		parse_operator() {
			return this.parse_symbols(this.rules.ops, "operator");
		}
	
		bracket_follow() {
			var forw, found, sym;
			forw = 0;
			found = false;
			while (true) {
				sym = this.get_symbol();
				if ((sym === "")) {
					return false;
				}
				forw = (forw + 1);
				if (_pj.in_es6(sym, this.rules.spaces)) {
					continue;
				}
				if ((sym === "(")) {
					found = true;
				}
				break;
			}
			this.position = (this.position - forw);
			return found;
		}

		parse_text() {
			var buf, func, sym;
			sym = this.get_symbol();
			buf = "";
			func = this.fname;
			this.fname = false;
			while (((sym !== "") && ((_pj.in_es6(sym, this.rules.letters) || _pj.in_es6(sym, this.rules.numbers)) || _pj.in_es6(sym, this.rules.treated_as_text)))) {
				buf = buf.concat(sym);
				sym = this.get_symbol();
				if (_pj.in_es6(sym, this.rules.fields)) {
					buf = buf.concat(sym);
					sym = this.get_symbol();
					break;
				}
			}
			this.push_back(sym);
			if ((buf.length > 0)) {
				this.fname = _pj.in_es6(buf, this.rules.f);
				return [true, buf, ((((_pj.in_es6(buf, this.rules.reserved) && "reserved") || ((func || _pj.in_es6(buf, this.rules.values)) && "function")) || (((_pj.in_es6(buf[0], this.rules.letters) || (buf[0] === "_")) && this.bracket_follow()) && "call")) || "none"), func];
			}
			return [false, "", "", false];
		}

		get_next() {
			var b, e, res, t;
			for (var f, _pj_c = 0, _pj_a = this.parsers, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
				f = _pj_a[_pj_c];
				[res, t, e, b] = this[f]();
				if (res) {
					return [t, e, b];
				}
			}
			return ["", "", false];
		}
	}

	class Formatter {
		constructor(palette) {
			this.palette = palette;
		}

		esc(text) {
			text = text.replace("&", "&amp;");
			text = text.replace("<", "&lt;");
			text = text.replace(">", "&gt;");
			return text;
		}

		format(text, entity, bold) {
			if ((this.palette[entity] === "")) {
				return text;
			}
			var result = "<span class=\"\" style=\"color: ";
			result = result.concat(this.palette[entity], ";\">", ((bold && "<b>") || ""), this.esc(text), ((bold && "</b>") || ""), "</span>");
			return result;
		}
	}

	class Pyfmtdf {
		constructor(palette, rules) {
			this.palette = palette;
			this.rules = rules;
		}

		doformat(f) {
			var bold, buf, etype, fmt, item, prs;
			fmt = new Formatter(this.palette);
			prs = new Parser(f, this.rules);
			buf = "";
			while (true) {
				[item, etype, bold] = prs.get_next();
				if ((item === "")) {
					break;
				}
				buf = buf.concat(fmt.format(item, etype, bold));
			}
			return buf;
		}
	}

	function fmt(f) {
		f = f.replace(/\n\n/g, "\n");
		var fmtr, palette, rules;
		palette = {"none": "", "text": "rgb(240, 240, 240)", "comment": "rgb(130, 130, 130)", "string": "rgb(50, 120, 0)", "function": "rgb(50, 50, 200)", "reserved": "rgb(150, 50, 50)", "operator": "rgb(150, 150, 50)", "call": "rgb(100, 100, 220)", "bracket": "rgb(100, 100, 200)", "number": "rgb(200, 50, 50)"};
		rules = new Rules();
		fmtr = new Pyfmtdf(palette, rules);
		return fmtr.doformat(f);
	}

	var t = window.getSelection();
	if (t.rangeCount) {
		var o = fmt(t.toString());
		var r = t.getRangeAt(0);
		r.deleteContents();
		var n = document.createElement("pre");
		r.insertNode(n);
		n.insertAdjacentHTML('afterbegin', o);
	}
})();
