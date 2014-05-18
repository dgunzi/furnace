/*!
 * Copyright (c) 2011 Simo Kinnunen.
 * Licensed under the MIT license.
 *
 * @version ${Version}
 */

var Cufon = (function() {

	var api = function() {
		return api.replace.apply(null, arguments);
	};

	var DOM = api.DOM = {

		ready: (function() {

			var complete = false, readyStatus = { loaded: 1, complete: 1 };

			var queue = [], perform = function() {
				if (complete) return;
				complete = true;
				for (var fn; fn = queue.shift(); fn());
			};

			// Gecko, Opera, WebKit r26101+

			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', perform, false);
				window.addEventListener('pageshow', perform, false); // For cached Gecko pages
			}

			// Old WebKit, Internet Explorer

			if (!window.opera && document.readyState) (function() {
				readyStatus[document.readyState] ? perform() : setTimeout(arguments.callee, 10);
			})();

			// Internet Explorer

			if (document.readyState && document.createStyleSheet) (function() {
				try {
					document.body.doScroll('left');
					perform();
				}
				catch (e) {
					setTimeout(arguments.callee, 1);
				}
			})();

			addEvent(window, 'load', perform); // Fallback

			return function(listener) {
				if (!arguments.length) perform();
				else complete ? listener() : queue.push(listener);
			};

		})(),

		root: function() {
			return document.documentElement || document.body;
		},

		strict: (function() {
			var doctype;
			// no doctype (doesn't always catch it though.. IE I'm looking at you)
			if (document.compatMode == 'BackCompat') return false;
			// WebKit, Gecko, Opera, IE9+
			doctype = document.doctype;
			if (doctype) {
				return !/frameset|transitional/i.test(doctype.publicId);
			}
			// IE<9, firstChild is the doctype even if there's an XML declaration
			doctype = document.firstChild;
			if (doctype.nodeType != 8 || /^DOCTYPE.+(transitional|frameset)/i.test(doctype.data)) {
				return false;
			}
			return true;
		})()

	};

	var CSS = api.CSS = {

		Size: function(value, base) {

			this.value = parseFloat(value);
			this.unit = String(value).match(/[a-z%]*$/)[0] || 'px';

			this.convert = function(value) {
				return value / base * this.value;
			};

			this.convertFrom = function(value) {
				return value / this.value * base;
			};

			this.toString = function() {
				return this.value + this.unit;
			};

		},

		addClass: function(el, className) {
			var current = el.className;
			el.className = current + (current && ' ') + className;
			return el;
		},

		color: cached(function(value) {
			var parsed = {};
			parsed.color = value.replace(/^rgba\((.*?),\s*([\d.]+)\)/, function($0, $1, $2) {
				parsed.opacity = parseFloat($2);
				return 'rgb(' + $1 + ')';
			});
			return parsed;
		}),

		// has no direct CSS equivalent.
		// @see http://msdn.microsoft.com/en-us/library/system.windows.fontstretches.aspx
		fontStretch: cached(function(value) {
			if (typeof value == 'number') return value;
			if (/%$/.test(value)) return parseFloat(value) / 100;
			return {
				'ultra-condensed': 0.5,
				'extra-condensed': 0.625,
				condensed: 0.75,
				'semi-condensed': 0.875,
				'semi-expanded': 1.125,
				expanded: 1.25,
				'extra-expanded': 1.5,
				'ultra-expanded': 2
			}[value] || 1;
		}),

		getStyle: function(el) {
			var view = document.defaultView;
			if (view && view.getComputedStyle) return new Style(view.getComputedStyle(el, null));
			if (el.currentStyle) return new Style(el.currentStyle);
			return new Style(el.style);
		},

		gradient: cached(function(value) {
			var gradient = {
				id: value,
				type: value.match(/^-([a-z]+)-gradient\(/)[1],
				stops: []
			}, colors = value.substr(value.indexOf('(')).match(/([\d.]+=)?(#[a-f0-9]+|[a-z]+\(.*?\)|[a-z]+)/ig);
			for (var i = 0, l = colors.length, stop; i < l; ++i) {
				stop = colors[i].split('=', 2).reverse();
				gradient.stops.push([ stop[1] || i / (l - 1), stop[0] ]);
			}
			return gradient;
		}),

		quotedList: cached(function(value) {
			// doesn't work properly with empty quoted strings (""), but
			// it's not worth the extra code.
			var list = [], re = /\s*((["'])([\s\S]*?[^\\])\2|[^,]+)\s*/g, match;
			while (match = re.exec(value)) list.push(match[3] || match[1]);
			return list;
		}),

		recognizesMedia: cached(function(media) {
			var el = document.createElement('style'), sheet, container, supported;
			el.type = 'text/css';
			el.media = media;
			try { // this is cached anyway
				el.appendChild(document.createTextNode('/**/'));
			} catch (e) {}
			container = elementsByTagName('head')[0];
			container.insertBefore(el, container.firstChild);
			sheet = (el.sheet || el.styleSheet);
			supported = sheet && !sheet.disabled;
			container.removeChild(el);
			return supported;
		}),

		removeClass: function(el, className) {
			var re = RegExp('(?:^|\\s+)' + className +  '(?=\\s|$)', 'g');
			el.className = el.className.replace(re, '');
			return el;
		},

		supports: function(property, value) {
			var checker = document.createElement('span').style;
			if (checker[property] === undefined) return false;
			checker[property] = value;
			return checker[property] === value;
		},

		textAlign: function(word, style, position, wordCount) {
			if (style.get('textAlign') == 'right') {
				if (position > 0) word = ' ' + word;
			}
			else if (position < wordCount - 1) word += ' ';
			return word;
		},

		textShadow: cached(function(value) {
			if (value == 'none') return null;
			var shadows = [], currentShadow = {}, result, offCount = 0;
			var re = /(#[a-f0-9]+|[a-z]+\(.*?\)|[a-z]+)|(-?[\d.]+[a-z%]*)|,/ig;
			while (result = re.exec(value)) {
				if (result[0] == ',') {
					shadows.push(currentShadow);
					currentShadow = {};
					offCount = 0;
				}
				else if (result[1]) {
					currentShadow.color = result[1];
				}
				else {
					currentShadow[[ 'offX', 'offY', 'blur' ][offCount++]] = result[2];
				}
			}
			shadows.push(currentShadow);
			return shadows;
		}),

		textTransform: (function() {
			var map = {
				uppercase: function(s) {
					return s.toUpperCase();
				},
				lowercase: function(s) {
					return s.toLowerCase();
				},
				capitalize: function(s) {
					return s.replace(/(?:^|\s)./g, function($0) {
						return $0.toUpperCase();
					});
				}
			};
			return function(text, style) {
				var transform = map[style.get('textTransform')];
				return transform ? transform(text) : text;
			};
		})(),

		whiteSpace: (function() {
			var ignore = {
				inline: 1,
				'inline-block': 1,
				'run-in': 1
			};
			var wsStart = /^\s+/, wsEnd = /\s+$/;
			return function(text, style, node, previousElement, simple) {
				if (simple) return text.replace(wsStart, '').replace(wsEnd, ''); // @fixme too simple
				if (previousElement) {
					if (previousElement.nodeName.toLowerCase() == 'br') {
						text = text.replace(wsStart, '');
					}
				}
				if (ignore[style.get('display')]) return text;
				if (!node.previousSibling) text = text.replace(wsStart, '');
				if (!node.nextSibling) text = text.replace(wsEnd, '');
				return text;
			};
		})()

	};

	CSS.ready = (function() {

		// don't do anything in Safari 2 (it doesn't recognize any media type)
		var complete = !CSS.recognizesMedia('all'), hasLayout = false;

		var queue = [], perform = function() {
			complete = true;
			for (var fn; fn = queue.shift(); fn());
		};

		var links = elementsByTagName('link'), styles = elementsByTagName('style');

		var checkTypes = {
			'': 1,
			'text/css': 1
		};

		function isContainerReady(el) {
			if (!checkTypes[el.type.toLowerCase()]) return true;
			return el.disabled || isSheetReady(el.sheet, el.media || 'screen');
		}

		function isSheetReady(sheet, media) {
			// in Opera sheet.disabled is true when it's still loading,
			// even though link.disabled is false. they stay in sync if
			// set manually.
			if (!CSS.recognizesMedia(media || 'all')) return true;
			if (!sheet || sheet.disabled) return false;
			try {
				var rules = sheet.cssRules, rule;
				if (rules) {
					// needed for Safari 3 and Chrome 1.0.
					// in standards-conforming browsers cssRules contains @-rules.
					// Chrome 1.0 weirdness: rules[<number larger than .length - 1>]
					// returns the last rule, so a for loop is the only option.
					search: for (var i = 0, l = rules.length; rule = rules[i], i < l; ++i) {
						switch (rule.type) {
							case 2: // @charset
								break;
							case 3: // @import
								if (!isSheetReady(rule.styleSheet, rule.media.mediaText)) return false;
								break;
							default:
								// only @charset can precede @import
								break search;
						}
					}
				}
			}
			catch (e) {} // probably a style sheet from another domain
			return true;
		}

		function allStylesLoaded() {
			// Internet Explorer's style sheet model, there's no need to do anything
			if (document.createStyleSheet) return true;
			// standards-compliant browsers
			var el, i;
			for (i = 0; el = links[i]; ++i) {
				if (el.rel.toLowerCase() == 'stylesheet' && !isContainerReady(el)) return false;
			}
			for (i = 0; el = styles[i]; ++i) {
				if (!isContainerReady(el)) return false;
			}
			return true;
		}

		DOM.ready(function() {
			// getComputedStyle returns null in Gecko if used in an iframe with display: none
			if (!hasLayout) hasLayout = CSS.getStyle(document.body).isUsable();
			if (complete || (hasLayout && allStylesLoaded())) perform();
			else setTimeout(arguments.callee, 10);
		});

		return function(listener) {
			if (complete) listener();
			else queue.push(listener);
		};

	})();

	function Font(data) {

		var face = this.face = data.face, ligatureCache = [], wordSeparators = {
			'\u0020': 1,
			'\u00a0': 1,
			'\u3000': 1
		};

		this.glyphs = (function(glyphs) {
			var key, fallbacks = {
				'\u2011': '\u002d',
				'\u00ad': '\u2011'
			};
			for (key in fallbacks) {
				if (!hasOwnProperty(fallbacks, key)) continue;
				if (!glyphs[key]) glyphs[key] = glyphs[fallbacks[key]];
			}
			return glyphs;
		})(data.glyphs);

		this.w = data.w;
		this.baseSize = parseInt(face['units-per-em'], 10);

		this.family = face['font-family'].toLowerCase();
		this.weight = face['font-weight'];
		this.style = face['font-style'] || 'normal';

		this.viewBox = (function () {
			var parts = face.bbox.split(/\s+/);
			var box = {
				minX: parseInt(parts[0], 10),
				minY: parseInt(parts[1], 10),
				maxX: parseInt(parts[2], 10),
				maxY: parseInt(parts[3], 10)
			};
			box.width = box.maxX - box.minX;
			box.height = box.maxY - box.minY;
			box.toString = function() {
				return [ this.minX, this.minY, this.width, this.height ].join(' ');
			};
			return box;
		})();

		this.ascent = -parseInt(face.ascent, 10);
		this.descent = -parseInt(face.descent, 10);

		this.height = -this.ascent + this.descent;

		this.spacing = function(chars, letterSpacing, wordSpacing) {
			var glyphs = this.glyphs, glyph,
				kerning, k,
				jumps = [],
				width = 0, w,
				i = -1, j = -1, chr;
			while (chr = chars[++i]) {
				glyph = glyphs[chr] || this.missingGlyph;
				if (!glyph) continue;
				if (kerning) {
					width -= k = kerning[chr] || 0;
					jumps[j] -= k;
				}
				w = glyph.w;
				if (isNaN(w)) w = +this.w; // may have been a String in old fonts
				if (w > 0) {
					w += letterSpacing;
					if (wordSeparators[chr]) w += wordSpacing;
				}
				width += jumps[++j] = ~~w; // get rid of decimals
				kerning = glyph.k;
			}
			jumps.total = width;
			return jumps;
		};

		this.applyLigatures = function(text, ligatures) {
			// find cached ligature configuration for this font
			for (var i=0, ligatureConfig; i<ligatureCache.length && !ligatureConfig; i++)
				if (ligatureCache[i].ligatures === ligatures)
					ligatureConfig = ligatureCache[i];

			// if there is none, it needs to be created and cached
			if (!ligatureConfig) {
				// identify letter groups to prepare regular expression that matches these
				var letterGroups = [];
				for (var letterGroup in ligatures) {
					if (this.glyphs[ligatures[letterGroup]]) {
						letterGroups.push(letterGroup);
					}
				}

				// sort by longer groups first, then alphabetically (to aid caching by this key)
				var regexpText = letterGroups.sort(function(a, b) {
					return b.length - a.length || a > b;
				}).join('|');

				ligatureCache.push(ligatureConfig = {
					ligatures: ligatures,
					// create regular expression for matching desired ligatures that are present in the font
					regexp: regexpText.length > 0 
						? regexpCache[regexpText] || (regexpCache[regexpText] = new RegExp(regexpText, 'g'))
						: null
				});
			}

			// return applied ligatures or original text if none exist for given configuration
			return ligatureConfig.regexp
				? text.replace(ligatureConfig.regexp, function(match) {
					return ligatures[match] || match;
				})
				: text;
		};
	}

	function FontFamily() {

		var styles = {}, mapping = {
			oblique: 'italic',
			italic: 'oblique'
		};

		this.add = function(font) {
			(styles[font.style] || (styles[font.style] = {}))[font.weight] = font;
		};

		this.get = function(style, weight) {
			var weights = styles[style] || styles[mapping[style]]
				|| styles.normal || styles.italic || styles.oblique;
			if (!weights) return null;
			// we don't have to worry about "bolder" and "lighter"
			// because IE's currentStyle returns a numeric value for it,
			// and other browsers use the computed value anyway
			weight = {
				normal: 400,
				bold: 700
			}[weight] || parseInt(weight, 10);
			if (weights[weight]) return weights[weight];
			// http://www.w3.org/TR/CSS21/fonts.html#propdef-font-weight
			// Gecko uses x99/x01 for lighter/bolder
			var up = {
				1: 1,
				99: 0
			}[weight % 100], alts = [], min, max;
			if (up === undefined) up = weight > 400;
			if (weight == 500) weight = 400;
			for (var alt in weights) {
				if (!hasOwnProperty(weights, alt)) continue;
				alt = parseInt(alt, 10);
				if (!min || alt < min) min = alt;
				if (!max || alt > max) max = alt;
				alts.push(alt);
			}
			if (weight < min) weight = min;
			if (weight > max) weight = max;
			alts.sort(function(a, b) {
				return (up
					? (a >= weight && b >= weight) ? a < b : a > b
					: (a <= weight && b <= weight) ? a > b : a < b) ? -1 : 1;
			});
			return weights[alts[0]];
		};

	}

	function HoverHandler() {

		function contains(node, anotherNode) {
			try {
				if (node.contains) return node.contains(anotherNode);
				return node.compareDocumentPosition(anotherNode) & 16;
			}
			catch(e) {} // probably a XUL element such as a scrollbar
			return false;
		}

		// mouseover/mouseout (standards) mode
		function onOverOut(e) {
			var related = e.relatedTarget;
			// there might be no relatedTarget if the element is right next
			// to the window frame
			if (related && contains(this, related)) return;
			trigger(this, e.type == 'mouseover');
		}

		// mouseenter/mouseleave (probably ie) mode
		function onEnterLeave(e) {
			if (!e) e = window.event;
			// ie model, we don't have access to "this", but
			// mouseenter/leave doesn't bubble so it's fine.
			trigger(e.target || e.srcElement, e.type == 'mouseenter');
		}

		function trigger(el, hoverState) {
			// A timeout is needed so that the event can actually "happen"
			// before replace is triggered. This ensures that styles are up
			// to date.
			setTimeout(function() {
				var options = sharedStorage.get(el).options;
				if (hoverState) {
					options = merge(options, options.hover);
					options._mediatorMode = 1;
				}
				api.replace(el, options, true);
			}, 10);
		}

		this.attach = function(el) {
			if (el.onmouseenter === undefined) {
				addEvent(el, 'mouseover', onOverOut);
				addEvent(el, 'mouseout', onOverOut);
			}
			else {
				addEvent(el, 'mouseenter', onEnterLeave);
				addEvent(el, 'mouseleave', onEnterLeave);
			}
		};

		this.detach = function(el) {
			if (el.onmouseenter === undefined) {
				removeEvent(el, 'mouseover', onOverOut);
				removeEvent(el, 'mouseout', onOverOut);
			}
			else {
				removeEvent(el, 'mouseenter', onEnterLeave);
				removeEvent(el, 'mouseleave', onEnterLeave);
			}
		};

	}

	function ReplaceHistory() {

		var list = [], map = {};

		function filter(keys) {
			var values = [], key;
			for (var i = 0; key = keys[i]; ++i) values[i] = list[map[key]];
			return values;
		}

		this.add = function(key, args) {
			map[key] = list.push(args) - 1;
		};

		this.repeat = function() {
			var snapshot = arguments.length ? filter(arguments) : list, args;
			for (var i = 0; args = snapshot[i++];) api.replace(args[0], args[1], true);
		};

	}

	function Storage() {

		var map = {}, at = 0;

		function identify(el) {
			return el.cufid || (el.cufid = ++at);
		}

		this.get = function(el) {
			var id = identify(el);
			return map[id] || (map[id] = {});
		};

	}

	function Style(style) {

		var custom = {}, sizes = {};

		this.extend = function(styles) {
			for (var property in styles) {
				if (hasOwnProperty(styles, property)) custom[property] = styles[property];
			}
			return this;
		};

		this.get = function(property) {
			return custom[property] != undefined ? custom[property] : style[property];
		};

		this.getSize = function(property, base) {
			return sizes[property] || (sizes[property] = new CSS.Size(this.get(property), base));
		};

		this.isUsable = function() {
			return !!style;
		};

	}

	function addEvent(el, type, listener) {
		if (el.addEventListener) {
			el.addEventListener(type, listener, false);
		}
		else if (el.attachEvent) {
			// we don't really need "this" right now, saves code
			el.attachEvent('on' + type, listener);
		}
	}

	function attach(el, options) {
		if (options._mediatorMode) return el;
		var storage = sharedStorage.get(el);
		var oldOptions = storage.options;
		if (oldOptions) {
			if (oldOptions === options) return el;
			if (oldOptions.hover) hoverHandler.detach(el);
		}
		if (options.hover && options.hoverables[el.nodeName.toLowerCase()]) {
			hoverHandler.attach(el);
		}
		storage.options = options;
		return el;
	}

	function cached(fun) {
		var cache = {};
		return function(key) {
			if (!hasOwnProperty(cache, key)) cache[key] = fun.apply(null, arguments);
			return cache[key];
		};
	}

	function getFont(el, style) {
		var families = CSS.quotedList(style.get('fontFamily').toLowerCase()), family;
		for (var i = 0; family = families[i]; ++i) {
			if (fonts[family]) return fonts[family].get(style.get('fontStyle'), style.get('fontWeight'));
		}
		return null;
	}

	function elementsByTagName(query) {
		return document.getElementsByTagName(query);
	}

	function hasOwnProperty(obj, property) {
		return obj.hasOwnProperty(property);
	}

	function merge() {
		var merged = {}, arg, key;
		for (var i = 0, l = arguments.length; arg = arguments[i], i < l; ++i) {
			for (key in arg) {
				if (hasOwnProperty(arg, key)) merged[key] = arg[key];
			}
		}
		return merged;
	}

	function process(font, text, style, options, node, el) {
		var fragment = document.createDocumentFragment(), processed;
		if (text === '') return fragment;
		var separate = options.separate;
		var parts = text.split(separators[separate]), needsAligning = (separate == 'words');
		if (needsAligning && HAS_BROKEN_REGEXP) {
			// @todo figure out a better way to do this
			if (/^\s/.test(text)) parts.unshift('');
			if (/\s$/.test(text)) parts.push('');
		}
		for (var i = 0, l = parts.length; i < l; ++i) {
			processed = engines[options.engine](font,
				needsAligning ? CSS.textAlign(parts[i], style, i, l) : parts[i],
				style, options, node, el, i < l - 1);
			if (processed) fragment.appendChild(processed);
		}
		return fragment;
	}

	function removeEvent(el, type, listener) {
		if (el.removeEventListener) {
			el.removeEventListener(type, listener, false);
		}
		else if (el.detachEvent) {
			el.detachEvent('on' + type, listener);
		}
	}

	function replaceElement(el, options) {
		var name = el.nodeName.toLowerCase();
		if (options.ignore[name]) return;
		if (options.ignoreClass && options.ignoreClass.test(el.className)) return;
		if (options.onBeforeReplace) options.onBeforeReplace(el, options);
		var replace = !options.textless[name], simple = (options.trim === 'simple');
		var style = CSS.getStyle(attach(el, options)).extend(options);
		// may cause issues if the element contains other elements
		// with larger fontSize, however such cases are rare and can
		// be fixed by using a more specific selector
		if (parseFloat(style.get('fontSize')) === 0) return;
		var font = getFont(el, style), node, type, next, anchor, text, lastElement;
		var isShy = options.softHyphens, anyShy = false, pos, shy, reShy = /\u00ad/g;
		var modifyText = options.modifyText;
		if (!font) return;
		for (node = el.firstChild; node; node = next) {
			type = node.nodeType;
			next = node.nextSibling;
			if (replace && type == 3) {
				if (isShy && el.nodeName.toLowerCase() != TAG_SHY) {
					pos = node.data.indexOf('\u00ad');
					if (pos >= 0) {
						node.splitText(pos);
						next = node.nextSibling;
						next.deleteData(0, 1);
						shy = document.createElement(TAG_SHY);
						shy.appendChild(document.createTextNode('\u00ad'));
						el.insertBefore(shy, next);
						next = shy;
						anyShy = true;
					}
				}
				// Node.normalize() is broken in IE 6, 7, 8
				if (anchor) {
					anchor.appendData(node.data);
					el.removeChild(node);
				}
				else anchor = node;
				if (next) continue;
			}
			if (anchor) {
				text = anchor.data;
				if (!isShy) text = text.replace(reShy, '');
				text = CSS.whiteSpace(text, style, anchor, lastElement, simple);
				// modify text only on the first replace
				if (modifyText) text = modifyText(text, anchor, el, options);
				el.replaceChild(process(font, text, style, options, node, el), anchor);
				anchor = null;
			}
			if (type == 1) {
				if (node.firstChild) {
					if (node.nodeName.toLowerCase() == 'cufon') {
						engines[options.engine](font, null, style, options, node, el);
					}
					else arguments.callee(node, options);
				}
				lastElement = node;
			}
		}
		if (isShy && anyShy) {
			updateShy(el);
			if (!trackingShy) addEvent(window, 'resize', updateShyOnResize);
			trackingShy = true;
		}
		if (options.onAfterReplace) options.onAfterReplace(el, options);
	}

	function updateShy(context) {
		var shys, shy, parent, glue, newGlue, next, prev, i;
		shys = context.getElementsByTagName(TAG_SHY);
		// unfortunately there doesn't seem to be any easy
		// way to avoid having to loop through the shys twice.
		for (i = 0; shy = shys[i]; ++i) {
			shy.className = C_SHY_DISABLED;
			glue = parent = shy.parentNode;
			if (glue.nodeName.toLowerCase() != TAG_GLUE) {
				newGlue = document.createElement(TAG_GLUE);
				newGlue.appendChild(shy.previousSibling);
				parent.insertBefore(newGlue, shy);
				newGlue.appendChild(shy);
			}
			else {
				// get rid of double glue (edge case fix)
				glue = glue.parentNode;
				if (glue.nodeName.toLowerCase() == TAG_GLUE) {
					parent = glue.parentNode;
					while (glue.firstChild) {
						parent.insertBefore(glue.firstChild, glue);
					}
					parent.removeChild(glue);
				}
			}
		}
		for (i = 0; shy = shys[i]; ++i) {
			shy.className = '';
			glue = shy.parentNode;
			parent = glue.parentNode;
			next = glue.nextSibling || parent.nextSibling;
			// make sure we're comparing same types
			prev = (next.nodeName.toLowerCase() == TAG_GLUE) ? glue : shy.previousSibling;
			if (prev.offsetTop >= next.offsetTop) {
				shy.className = C_SHY_DISABLED;
				if (prev.offsetTop < next.offsetTop) {
					// we have an annoying edge case, double the glue
					newGlue = document.createElement(TAG_GLUE);
					parent.insertBefore(newGlue, glue);
					newGlue.appendChild(glue);
					newGlue.appendChild(next);
				}
			}
		}
	}

	function updateShyOnResize() {
		if (ignoreResize) return; // needed for IE
		CSS.addClass(DOM.root(), C_VIEWPORT_RESIZING);
		clearTimeout(shyTimer);
		shyTimer = setTimeout(function() {
			ignoreResize = true;
			CSS.removeClass(DOM.root(), C_VIEWPORT_RESIZING);
			updateShy(document);
			ignoreResize = false;
		}, 100);
	}

	var HAS_BROKEN_REGEXP = ' '.split(/\s+/).length == 0;
	var TAG_GLUE = 'cufonglue';
	var TAG_SHY = 'cufonshy';
	var C_SHY_DISABLED = 'cufon-shy-disabled';
	var C_VIEWPORT_RESIZING = 'cufon-viewport-resizing';

	var regexpCache = {};
	var sharedStorage = new Storage();
	var hoverHandler = new HoverHandler();
	var replaceHistory = new ReplaceHistory();
	var initialized = false;
	var trackingShy = false;
	var shyTimer;
	var ignoreResize = false;

	var engines = {}, fonts = {}, defaultOptions = {
		autoDetect: false,
		engine: null,
		forceHitArea: false,
		hover: false,
		hoverables: {
			a: true
		},
		ignore: {
			applet: 1,
			canvas: 1,
			col: 1,
			colgroup: 1,
			head: 1,
			iframe: 1,
			map: 1,
			noscript: 1,
			optgroup: 1,
			option: 1,
			script: 1,
			select: 1,
			style: 1,
			textarea: 1,
			title: 1,
			pre: 1
		},
		ignoreClass: null,
		modifyText: null,
		onAfterReplace: null,
		onBeforeReplace: null,
		printable: true,
		selector: (
				window.Sizzle
			||	(window.jQuery && function(query) { return jQuery(query); }) // avoid noConflict issues
			||	(window.dojo && dojo.query)
			||	(window.glow && glow.dom && glow.dom.get)
			||	(window.Ext && Ext.query)
			||	(window.YAHOO && YAHOO.util && YAHOO.util.Selector && YAHOO.util.Selector.query)
			||	(window.$$ && function(query) { return $$(query); })
			||	(window.$ && function(query) { return $(query); })
			||	(document.querySelectorAll && function(query) { return document.querySelectorAll(query); })
			||	elementsByTagName
		),
		separate: 'words', // 'none' and 'characters' are also accepted
		softHyphens: true,
		textless: {
			dl: 1,
			html: 1,
			ol: 1,
			table: 1,
			tbody: 1,
			thead: 1,
			tfoot: 1,
			tr: 1,
			ul: 1
		},
		textShadow: 'none',
		trim: 'advanced',
		ligatures: {
			'ff': '\ufb00',
			'fi': '\ufb01',
			'fl': '\ufb02',
			'ffi': '\ufb03',
			'ffl': '\ufb04',
			'\u017ft': '\ufb05',
			'st': '\ufb06'
		}
	};

	var separators = {
		// The first pattern may cause unicode characters above
		// code point 255 to be removed in Safari 3.0. Luckily enough
		// Safari 3.0 does not include non-breaking spaces in \s, so
		// we can just use a simple alternative pattern.
		words: /\s/.test('\u00a0') ? /[^\S\u00a0]+/ : /\s+/,
		characters: '',
		none: /^/
	};

	api.now = function() {
		DOM.ready();
		return api;
	};

	api.refresh = function() {
		replaceHistory.repeat.apply(replaceHistory, arguments);
		return api;
	};

	api.registerEngine = function(id, engine) {
		if (!engine) return api;
		engines[id] = engine;
		return api.set('engine', id);
	};

	api.registerFont = function(data) {
		if (!data) return api;
		var font = new Font(data), family = font.family;
		if (!fonts[family]) fonts[family] = new FontFamily();
		fonts[family].add(font);
		return api.set('fontFamily', '"' + family + '"');
	};

	api.replace = function(elements, options, ignoreHistory) {
		options = merge(defaultOptions, options);
		if (!options.engine) return api; // there's no browser support so we'll just stop here
		if (!initialized) {
			CSS.addClass(DOM.root(), 'cufon-active cufon-loading');
			CSS.ready(function() {
				// fires before any replace() calls, but it doesn't really matter
				CSS.addClass(CSS.removeClass(DOM.root(), 'cufon-loading'), 'cufon-ready');
			});
			initialized = true;
		}
		if (options.hover) options.forceHitArea = true;
		if (options.autoDetect) delete options.fontFamily;
		if (typeof options.ignoreClass == 'string') {
			options.ignoreClass = new RegExp('(?:^|\\s)(?:' + options.ignoreClass.replace(/\s+/g, '|') + ')(?:\\s|$)');
		}
		if (typeof options.textShadow == 'string') {
			options.textShadow = CSS.textShadow(options.textShadow);
		}
		if (typeof options.color == 'string' && /^-/.test(options.color)) {
			options.textGradient = CSS.gradient(options.color);
		}
		else delete options.textGradient;
		if (typeof elements == 'string') {
			if (!ignoreHistory) replaceHistory.add(elements, arguments);
			elements = [ elements ];
		}
		else if (elements.nodeType) elements = [ elements ];
		CSS.ready(function() {
			for (var i = 0, l = elements.length; i < l; ++i) {
				var el = elements[i];
				if (typeof el == 'string') api.replace(options.selector(el), options, true);
				else replaceElement(el, options);
			}
		});
		return api;
	};

	api.set = function(option, value) {
		defaultOptions[option] = value;
		return api;
	};

	return api;

})();

Cufon.registerEngine('vml', (function() {

	var ns = document.namespaces;
	if (!ns) return;
	ns.add('cvml', 'urn:schemas-microsoft-com:vml');
	ns = null;

	var check = document.createElement('cvml:shape');
	check.style.behavior = 'url(#default#VML)';
	if (!check.coordsize) return; // VML isn't supported
	check = null;

	var HAS_BROKEN_LINEHEIGHT = (document.documentMode || 0) < 8;
	
	var styleSheet = document.createElement('style');
	styleSheet.type = 'text/css';
	styleSheet.styleSheet.cssText = (
		'cufoncanvas{text-indent:0;}' +
		'@media screen{' +
			'cvml\\:shape,cvml\\:rect,cvml\\:fill,cvml\\:shadow{behavior:url(#default#VML);display:block;antialias:true;position:absolute;}' +
			'cufoncanvas{position:absolute;text-align:left;}' +
			'cufon{display:inline-block;position:relative;vertical-align:' +
			(HAS_BROKEN_LINEHEIGHT
				? 'middle'
				: 'text-bottom') +
			';}' +
			'cufon cufontext{position:absolute;left:-10000in;font-size:1px;text-align:left;}' +
			'cufonshy.cufon-shy-disabled,.cufon-viewport-resizing cufonshy{display:none;}' +
			'cufonglue{white-space:nowrap;display:inline-block;}' +
			'.cufon-viewport-resizing cufonglue{white-space:normal;}' +
			'a cufon{cursor:pointer}' + // ignore !important here
		'}' +
		'@media print{' +
			'cufon cufoncanvas{display:none;}' +
		'}'
	).replace(/;/g, '!important;');
	document.getElementsByTagName('head')[0].appendChild(styleSheet);

	function getFontSizeInPixels(el, value) {
		return getSizeInPixels(el, /(?:em|ex|%)$|^[a-z-]+$/i.test(value) ? '1em' : value);
	}

	// Original by Dead Edwards.
	// Combined with getFontSizeInPixels it also works with relative units.
	function getSizeInPixels(el, value) {
		if (!isNaN(value) || /px$/i.test(value)) return parseFloat(value);
		var style = el.style.left, runtimeStyle = el.runtimeStyle.left;
		el.runtimeStyle.left = el.currentStyle.left;
		el.style.left = value.replace('%', 'em');
		var result = el.style.pixelLeft;
		el.style.left = style;
		el.runtimeStyle.left = runtimeStyle;
		return result;
	}

	function getSpacingValue(el, style, size, property) {
		var key = 'computed' + property, value = style[key];
		if (isNaN(value)) {
			value = style.get(property);
			style[key] = value = (value == 'normal') ? 0 : ~~size.convertFrom(getSizeInPixels(el, value));
		}
		return value;
	}

	var fills = {};

	function gradientFill(gradient) {
		var id = gradient.id;
		if (!fills[id]) {
			var stops = gradient.stops, fill = document.createElement('cvml:fill'), colors = [];
			fill.type = 'gradient';
			fill.angle = 180;
			fill.focus = '0';
			fill.method = 'none';
			fill.color = stops[0][1];
			for (var j = 1, k = stops.length - 1; j < k; ++j) {
				colors.push(stops[j][0] * 100 + '% ' + stops[j][1]);
			}
			fill.colors = colors.join(',');
			fill.color2 = stops[k][1];
			fills[id] = fill;
		}
		return fills[id];
	}

	return function(font, text, style, options, node, el, hasNext) {

		var redraw = (text === null);

		if (redraw) text = node.alt;

		var viewBox = font.viewBox;

		var size = style.computedFontSize || (style.computedFontSize = new Cufon.CSS.Size(getFontSizeInPixels(el, style.get('fontSize')) + 'px', font.baseSize));

		var wrapper, canvas;

		if (redraw) {
			wrapper = node;
			canvas = node.firstChild;
		}
		else {
			wrapper = document.createElement('cufon');
			wrapper.className = 'cufon cufon-vml';
			wrapper.alt = text;

			canvas = document.createElement('cufoncanvas');
			wrapper.appendChild(canvas);

			if (options.printable) {
				var print = document.createElement('cufontext');
				print.appendChild(document.createTextNode(text));
				wrapper.appendChild(print);
			}

			// ie6, for some reason, has trouble rendering the last VML element in the document.
			// we can work around this by injecting a dummy element where needed.
			// @todo find a better solution
			if (!hasNext) wrapper.appendChild(document.createElement('cvml:shape'));
		}

		var wStyle = wrapper.style;
		var cStyle = canvas.style;

		var height = size.convert(viewBox.height), roundedHeight = Math.ceil(height);
		var roundingFactor = roundedHeight / height;
		var stretchFactor = roundingFactor * Cufon.CSS.fontStretch(style.get('fontStretch'));
		var minX = viewBox.minX, minY = viewBox.minY;

		cStyle.height = roundedHeight;
		cStyle.top = Math.round(size.convert(minY - font.ascent));
		cStyle.left = Math.round(size.convert(minX));

		wStyle.height = size.convert(font.height) + 'px';

		var color = style.get('color');
		var chars = Cufon.CSS.textTransform(options.ligatures ? font.applyLigatures(text, options.ligatures) : text, style).split('');

		var jumps = font.spacing(chars,
			getSpacingValue(el, style, size, 'letterSpacing'),
			getSpacingValue(el, style, size, 'wordSpacing')
		);

		if (!jumps.length) return null;

		var width = jumps.total;
		var fullWidth = -minX + width + (viewBox.width - jumps[jumps.length - 1]);

		var shapeWidth = size.convert(fullWidth * stretchFactor), roundedShapeWidth = Math.round(shapeWidth);

		var coordSize = fullWidth + ',' + viewBox.height, coordOrigin;
		var stretch = 'r' + coordSize + 'ns';

		var fill = options.textGradient && gradientFill(options.textGradient);

		var glyphs = font.glyphs, offsetX = 0;
		var shadows = options.textShadow;
		var i = -1, j = 0, chr;

		while (chr = chars[++i]) {

			var glyph = glyphs[chars[i]] || font.missingGlyph, shape;
			if (!glyph) continue;

			if (redraw) {
				// some glyphs may be missing so we can't use i
				shape = canvas.childNodes[j];
				while (shape.firstChild) shape.removeChild(shape.firstChild); // shadow, fill
			}
			else {
				shape = document.createElement('cvml:shape');
				canvas.appendChild(shape);
			}

			shape.stroked = 'f';
			shape.coordsize = coordSize;
			shape.coordorigin = coordOrigin = (minX - offsetX) + ',' + minY;
			shape.path = (glyph.d ? 'm' + glyph.d + 'xe' : '') + 'm' + coordOrigin + stretch;
			shape.fillcolor = color;

			if (fill) shape.appendChild(fill.cloneNode(false));

			// it's important to not set top/left or IE8 will grind to a halt
			var sStyle = shape.style;
			sStyle.width = roundedShapeWidth;
			sStyle.height = roundedHeight;

			if (shadows) {
				// due to the limitations of the VML shadow element there
				// can only be two visible shadows. opacity is shared
				// for all shadows.
				var shadow1 = shadows[0], shadow2 = shadows[1];
				var color1 = Cufon.CSS.color(shadow1.color), color2;
				var shadow = document.createElement('cvml:shadow');
				shadow.on = 't';
				shadow.color = color1.color;
				shadow.offset = shadow1.offX + ',' + shadow1.offY;
				if (shadow2) {
					color2 = Cufon.CSS.color(shadow2.color);
					shadow.type = 'double';
					shadow.color2 = color2.color;
					shadow.offset2 = shadow2.offX + ',' + shadow2.offY;
				}
				shadow.opacity = color1.opacity || (color2 && color2.opacity) || 1;
				shape.appendChild(shadow);
			}

			offsetX += jumps[j++];
		}

		// addresses flickering issues on :hover

		var cover = shape.nextSibling, coverFill, vStyle;

		if (options.forceHitArea) {

			if (!cover) {
				cover = document.createElement('cvml:rect');
				cover.stroked = 'f';
				cover.className = 'cufon-vml-cover';
				coverFill = document.createElement('cvml:fill');
				coverFill.opacity = 0;
				cover.appendChild(coverFill);
				canvas.appendChild(cover);
			}

			vStyle = cover.style;

			vStyle.width = roundedShapeWidth;
			vStyle.height = roundedHeight;

		}
		else if (cover) canvas.removeChild(cover);

		wStyle.width = Math.max(Math.ceil(size.convert(width * stretchFactor)), 0);

		if (HAS_BROKEN_LINEHEIGHT) {

			var yAdjust = style.computedYAdjust;

			if (yAdjust === undefined) {
				var lineHeight = style.get('lineHeight');
				if (lineHeight == 'normal') lineHeight = '1em';
				else if (!isNaN(lineHeight)) lineHeight += 'em'; // no unit
				style.computedYAdjust = yAdjust = 0.5 * (getSizeInPixels(el, lineHeight) - parseFloat(wStyle.height));
			}

			if (yAdjust) {
				wStyle.marginTop = Math.ceil(yAdjust) + 'px';
				wStyle.marginBottom = yAdjust + 'px';
			}

		}

		return wrapper;

	};

})());

Cufon.registerEngine('canvas', (function() {

	// Safari 2 doesn't support .apply() on native methods

	var check = document.createElement('canvas');
	if (!check || !check.getContext || !check.getContext.apply) return;
	check = null;

	var HAS_INLINE_BLOCK = Cufon.CSS.supports('display', 'inline-block');

	// Firefox 2 w/ non-strict doctype (almost standards mode)
	var HAS_BROKEN_LINEHEIGHT = !HAS_INLINE_BLOCK && (document.compatMode == 'BackCompat' || /frameset|transitional/i.test(document.doctype.publicId));

	var styleSheet = document.createElement('style');
	styleSheet.type = 'text/css';
	styleSheet.appendChild(document.createTextNode((
		'cufon{text-indent:0;}' +
		'@media screen,projection{' +
			'cufon{display:inline;display:inline-block;position:relative;vertical-align:middle;' +
			(HAS_BROKEN_LINEHEIGHT
				? ''
				: 'font-size:1px;line-height:1px;') +
			'}cufon cufontext{display:-moz-inline-box;display:inline-block;width:0;height:0;text-align:left;text-indent:-10000in;}' +
			(HAS_INLINE_BLOCK
				? 'cufon canvas{position:relative;}'
				: 'cufon canvas{position:absolute;}') +
			'cufonshy.cufon-shy-disabled,.cufon-viewport-resizing cufonshy{display:none;}' +
			'cufonglue{white-space:nowrap;display:inline-block;}' +
			'.cufon-viewport-resizing cufonglue{white-space:normal;}' +
		'}' +
		'@media print{' +
			'cufon{padding:0;}' + // Firefox 2
			'cufon canvas{display:none;}' +
		'}'
	).replace(/;/g, '!important;')));
	document.getElementsByTagName('head')[0].appendChild(styleSheet);

	function generateFromVML(path, context) {
		var atX = 0, atY = 0;
		var code = [], re = /([mrvxe])([^a-z]*)/g, match;
		generate: for (var i = 0; match = re.exec(path); ++i) {
			var c = match[2].split(',');
			switch (match[1]) {
				case 'v':
					code[i] = { m: 'bezierCurveTo', a: [ atX + ~~c[0], atY + ~~c[1], atX + ~~c[2], atY + ~~c[3], atX += ~~c[4], atY += ~~c[5] ] };
					break;
				case 'r':
					code[i] = { m: 'lineTo', a: [ atX += ~~c[0], atY += ~~c[1] ] };
					break;
				case 'm':
					code[i] = { m: 'moveTo', a: [ atX = ~~c[0], atY = ~~c[1] ] };
					break;
				case 'x':
					code[i] = { m: 'closePath' };
					break;
				case 'e':
					break generate;
			}
			context[code[i].m].apply(context, code[i].a);
		}
		return code;
	}

	function interpret(code, context) {
		for (var i = 0, l = code.length; i < l; ++i) {
			var line = code[i];
			context[line.m].apply(context, line.a);
		}
	}

	return function(font, text, style, options, node, el) {

		var redraw = (text === null);

		if (redraw) text = node.getAttribute('alt');

		var viewBox = font.viewBox;

		var size = style.getSize('fontSize', font.baseSize);

		var expandTop = 0, expandRight = 0, expandBottom = 0, expandLeft = 0;
		var shadows = options.textShadow, shadowOffsets = [];
		if (shadows) {
			for (var i = shadows.length; i--;) {
				var shadow = shadows[i];
				var x = size.convertFrom(parseFloat(shadow.offX));
				var y = size.convertFrom(parseFloat(shadow.offY));
				shadowOffsets[i] = [ x, y ];
				if (y < expandTop) expandTop = y;
				if (x > expandRight) expandRight = x;
				if (y > expandBottom) expandBottom = y;
				if (x < expandLeft) expandLeft = x;
			}
		}

		var chars = Cufon.CSS.textTransform(options.ligatures ? font.applyLigatures(text, options.ligatures) : text, style).split('');

		var jumps = font.spacing(chars,
			~~size.convertFrom(parseFloat(style.get('letterSpacing')) || 0),
			~~size.convertFrom(parseFloat(style.get('wordSpacing')) || 0)
		);

		if (!jumps.length) return null; // there's nothing to render

		var width = jumps.total;

		expandRight += viewBox.width - jumps[jumps.length - 1];
		expandLeft += viewBox.minX;

		var wrapper, canvas;

		if (redraw) {
			wrapper = node;
			canvas = node.firstChild;
		}
		else {
			wrapper = document.createElement('cufon');
			wrapper.className = 'cufon cufon-canvas';
			wrapper.setAttribute('alt', text);

			canvas = document.createElement('canvas');
			wrapper.appendChild(canvas);

			if (options.printable) {
				var print = document.createElement('cufontext');
				print.appendChild(document.createTextNode(text));
				wrapper.appendChild(print);
			}
		}

		var wStyle = wrapper.style;
		var cStyle = canvas.style;

		var height = size.convert(viewBox.height);
		var roundedHeight = Math.ceil(height);
		var roundingFactor = roundedHeight / height;
		var stretchFactor = roundingFactor * Cufon.CSS.fontStretch(style.get('fontStretch'));
		var stretchedWidth = width * stretchFactor;

		var canvasWidth = Math.ceil(size.convert(stretchedWidth + expandRight - expandLeft));
		var canvasHeight = Math.ceil(size.convert(viewBox.height - expandTop + expandBottom));

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// needed for WebKit and full page zoom
		cStyle.width = canvasWidth + 'px';
		cStyle.height = canvasHeight + 'px';

		// minY has no part in canvas.height
		expandTop += viewBox.minY;

		cStyle.top = Math.round(size.convert(expandTop - font.ascent)) + 'px';
		cStyle.left = Math.round(size.convert(expandLeft)) + 'px';

		var wrapperWidth = Math.max(Math.ceil(size.convert(stretchedWidth)), 0) + 'px';

		if (HAS_INLINE_BLOCK) {
			wStyle.width = wrapperWidth;
			wStyle.height = size.convert(font.height) + 'px';
		}
		else {
			wStyle.paddingLeft = wrapperWidth;
			wStyle.paddingBottom = (size.convert(font.height) - 1) + 'px';
		}

		var g = canvas.getContext('2d'), scale = height / viewBox.height;
		var pixelRatio = window.devicePixelRatio || 1;
		if (pixelRatio != 1) {
			canvas.width = canvasWidth * pixelRatio;
			canvas.height = canvasHeight * pixelRatio;
			g.scale(pixelRatio, pixelRatio);
		}

		// proper horizontal scaling is performed later
		g.scale(scale, scale * roundingFactor);
		g.translate(-expandLeft, -expandTop);
		g.save();

		function renderText() {
			var glyphs = font.glyphs, glyph, i = -1, j = -1, chr;
			g.scale(stretchFactor, 1);
			while (chr = chars[++i]) {
				var glyph = glyphs[chars[i]] || font.missingGlyph;
				if (!glyph) continue;
				if (glyph.d) {
					g.beginPath();
					// the following moveTo is for Opera 9.2. if we don't
					// do this, it won't forget the previous path which
					// results in garbled text.
					g.moveTo(0, 0);
					if (glyph.code) interpret(glyph.code, g);
					else glyph.code = generateFromVML('m' + glyph.d, g);
					g.fill();
				}
				g.translate(jumps[++j], 0);
			}
			g.restore();
		}

		if (shadows) {
			for (var i = shadows.length; i--;) {
				var shadow = shadows[i];
				g.save();
				g.fillStyle = shadow.color;
				g.translate.apply(g, shadowOffsets[i]);
				renderText();
			}
		}

		var gradient = options.textGradient;
		if (gradient) {
			var stops = gradient.stops, fill = g.createLinearGradient(0, viewBox.minY, 0, viewBox.maxY);
			for (var i = 0, l = stops.length; i < l; ++i) {
				fill.addColorStop.apply(fill, stops[i]);
			}
			g.fillStyle = fill;
		}
		else g.fillStyle = style.get('color');

		renderText();

		return wrapper;

	};

})());



Cufon.registerFont({"w":207,"face":{"font-family":"bat","font-weight":400,"font-stretch":"normal","units-per-em":"360","panose-1":"0 0 4 0 0 0 0 0 0 0","ascent":"288","descent":"-72","x-height":"13","cap-height":"5","bbox":"8 -305 361 90","underline-thickness":"7.2","underline-position":"-44.28","unicode-range":"U+0020-U+007E"},"glyphs":{" ":{"w":113},"!":{"d":"56,-273v46,-2,19,65,24,100r-6,113r-37,0r-8,-182v1,-24,3,-30,27,-31xm56,10v-20,0,-31,-10,-31,-27v0,-18,11,-27,31,-27v20,0,30,9,30,27v0,18,-10,27,-30,27","w":97,"k":{"u":8,"t":9,"s":10,"q":10,"o":10,"j":46,"i":8,"g":11,"f":8,"e":10,"d":14,"c":9,"a":9,"Y":12,"W":8,"V":9,"T":10,"S":7,"O":8,"J":11,"G":10,"C":8,"@":9,";":7,":":9,"9":13,"7":31,"5":18,"4":14,"3":18,"1":53,"'":7,"#":15}},"\"":{"d":"121,-149r-40,0r0,-109r40,0r0,109xm67,-149r-40,0r0,-109r40,0r0,109","w":136,"k":{"q":10,"o":9,"j":45,"g":9,"e":9,"d":16,"c":8,"a":17,"]":9,"Z":10,"Y":8,"X":13,"J":84,"A":46,"@":14,";":16,":":18,"8":8,"7":30,"6":13,"3":40,"2":50,"1":53,"\/":39,".":76,",":77,")":26,"(":11,"#":32,"!":9}},"#":{"d":"285,-185r-14,41r-52,0r-12,33r55,0r-15,41r-54,0r-27,76r-45,0r27,-76r-33,0r-28,76r-44,0r27,-76r-52,0r14,-41r53,0r11,-33r-55,0r15,-41r55,0r28,-77r44,0r-27,77r33,0r27,-77r45,0r-27,77r51,0xm175,-144r-34,0r-12,33r34,0","w":287,"k":{"y":12,"x":24,"w":13,"v":13,"s":8,"q":15,"o":14,"j":49,"i":9,"g":14,"e":15,"d":17,"c":13,"a":15,"]":26,"\\":20,"Z":24,"Y":28,"X":28,"W":19,"V":23,"T":26,"J":77,"G":8,"A":48,"@":17,";":28,":":31,"9":9,"7":48,"6":11,"5":14,"4":11,"3":41,"2":28,"1":70,"\/":40,".":102,",":102,")":43,"(":10,"'":25,"#":34,"!":9}},"$":{"d":"109,-210v-34,-3,-53,40,-19,51v49,16,98,25,98,84v0,38,-19,67,-48,78r0,55r-28,0r0,-49r-13,0r0,49r-28,0r0,-51v-17,-6,-32,-14,-43,-28r0,-63v22,25,36,44,72,47v39,5,51,-41,25,-56v-40,-23,-102,-22,-102,-86v0,-39,21,-66,52,-77r0,-49r27,0r-1,45v5,-1,11,-1,16,0v-3,-12,0,-31,-1,-45r27,0r0,50v17,4,26,12,36,21r0,71v-18,-25,-35,-44,-70,-47","w":196},"%":{"d":"300,-135r-18,16r-71,0r-15,-16r17,-16r72,0xm317,-116r-7,81r-18,17r-14,-17r7,-81r17,-16xm147,-254r-17,16r-72,0r-15,-16r18,-16r71,0xm164,-235r-7,82r-17,15r-15,-15r7,-82r17,-16xm276,-214r-194,178r-25,0r0,-20r195,-179r24,0r0,21xm208,-117r-8,82r-17,16r-15,-16r8,-82r17,-15xm289,-16r-17,16r-72,0r-15,-16r18,-16r72,0xm55,-235r-7,81r-17,16r-15,-15r7,-82r18,-16xm137,-135r-18,16r-71,0r-15,-16r17,-15r72,0","w":310},"&":{"d":"174,-218v0,30,-23,60,-45,77r39,50v11,-16,26,-50,36,-72r11,2v1,42,2,82,-18,105r48,61r-63,0r-17,-22v-41,50,-146,30,-146,-45v0,-29,15,-56,46,-83v-16,-22,-27,-36,-28,-67v-1,-40,33,-66,74,-66v36,0,63,24,63,60xm105,-175v14,-16,24,-20,24,-39v0,-12,-7,-19,-20,-19v-29,0,-22,44,-4,58xm91,-111v-30,23,-30,72,13,74v14,0,25,-5,33,-15","w":237},"'":{"d":"64,-254r-6,59r-32,0r5,-59r33,0","w":57,"k":{"z":-19,"y":-23,"x":-16,"w":-20,"v":-21,"u":-13,"t":-12,"r":-15,"q":11,"p":-14,"o":9,"n":-10,"m":-10,"l":-15,"k":-21,"j":56,"i":-15,"h":-18,"g":8,"f":-10,"e":11,"d":19,"c":8,"b":-19,"]":-13,"\\":-26,"Z":-14,"Y":-15,"X":-10,"W":-18,"V":-19,"U":-16,"T":-18,"S":-14,"R":-19,"Q":-9,"P":-21,"O":-8,"N":-15,"M":-15,"L":-21,"K":-21,"J":62,"I":-15,"H":-15,"F":-19,"E":-18,"D":-17,"B":-17,"A":55,"@":19,"?":-22,";":57,":":57,"9":-12,"4":-13,"3":18,"2":61,"1":31,"\/":54,".":55,",":55,"'":-12,"#":63,"\"":-15,"!":-12}},"(":{"d":"113,-254v-9,9,-18,19,-40,16r-14,-17v9,-9,18,-18,39,-15xm71,-235r-8,84r-18,16r-14,-15r7,-85r18,-17xm60,-120r-8,85r-17,16r-14,-16r7,-85r17,-15xm91,-16v-9,9,-17,19,-39,16r-14,-16v9,-9,17,-19,39,-16","w":111,"k":{"z":15,"y":30,"x":24,"w":33,"v":32,"u":26,"t":35,"s":25,"r":12,"q":30,"p":13,"o":36,"n":16,"m":16,"k":-8,"j":37,"g":33,"f":29,"e":34,"d":32,"c":32,"a":23,"S":13,"Q":21,"P":-7,"O":23,"L":-7,"K":-8,"J":23,"G":30,"C":25,"A":18,"@":26,";":20,":":22,"9":19,"8":17,"7":22,"6":22,"5":14,"4":10,"3":29,"2":15,"1":44,"0":17,"\/":16,".":13,",":13,")":17,"(":20,"#":43}},")":{"d":"95,-254r-17,16r-23,0r-14,-16v9,-9,17,-19,39,-16xm112,-235r-7,85r-18,15r-14,-16r7,-84r18,-16xm102,-120r-8,85r-17,17r-14,-17r7,-84r17,-16xm75,-15v-9,9,-18,18,-40,15r-14,-16v9,-9,17,-19,39,-16","w":118,"k":{"j":45,"g":8,"d":11,"a":13,"Y":14,"X":15,"J":19,"A":22,";":19,":":22,"9":9,"7":33,"6":12,"5":14,"4":11,"3":37,"2":15,"1":55,"\/":20,".":22,",":21,")":27,"(":10,"#":14}},"*":{"d":"157,-207r-41,5r30,28r-40,29r-17,-37r-17,37r-39,-29r30,-28r-41,-5r15,-46r36,20r-8,-40r49,0r-8,40r35,-20","w":164},"+":{"d":"87,-171r-2,21r-15,13v-9,-7,-14,-17,-11,-34r15,-13xm121,-135v-7,15,-39,21,-48,1v7,-16,39,-20,48,-1xm68,-135v-7,15,-39,22,-47,1v7,-15,39,-21,47,-1xm70,-132v17,9,13,39,-4,46r-13,-13r2,-20","w":115},",":{"d":"62,-30r-3,30r-19,15r-14,-15r3,-30r33,0","w":55,"k":{"z":-21,"y":53,"x":-19,"w":54,"v":54,"t":54,"r":-20,"p":-19,"n":-16,"m":-16,"l":-15,"k":-21,"j":55,"i":-10,"h":-18,"f":12,"b":-15,"a":-12,"]":-15,"\\":58,"Z":-23,"Y":56,"X":-20,"W":53,"V":55,"T":55,"S":-11,"R":-19,"Q":10,"P":-21,"O":10,"N":-15,"M":-15,"L":-21,"K":-21,"J":-19,"I":-15,"H":-15,"G":12,"F":-19,"E":-18,"D":-17,"C":8,"B":-17,"A":-22,"@":-9,"?":8,";":-15,":":-14,"9":-12,"8":-22,"7":74,"6":-17,"4":67,"3":-14,"2":-25,"1":45,"0":-22,"\/":-21,".":-13,",":-13,")":-19,"(":-18,"'":55,"\"":56,"!":-15}},".":{"d":"61,-31r-3,31r-31,0r3,-31r31,0","w":55,"k":{"z":-21,"y":52,"x":-17,"w":53,"v":53,"u":-8,"t":52,"s":-8,"r":-20,"p":-19,"n":-16,"m":-16,"l":-15,"k":-21,"j":54,"i":-10,"h":-18,"f":12,"b":-19,"a":-14,"]":-15,"\\":56,"Z":-23,"Y":55,"X":-18,"W":53,"V":54,"T":54,"S":-13,"R":-19,"P":-21,"O":8,"N":-15,"M":-15,"L":-21,"K":-21,"J":-20,"I":-15,"H":-15,"G":10,"F":-19,"E":-18,"D":-17,"B":-17,"A":-21,"@":-11,"?":8,";":-15,":":-14,"9":-12,"8":-22,"7":73,"6":-17,"4":66,"3":-14,"2":-25,"1":45,"0":-22,"\/":-21,".":-13,",":-14,")":-19,"(":-18,"'":55,"\"":55,"!":-16}},"\/":{"d":"122,-270r-71,270r-33,0r72,-270r32,0","w":117,"k":{"s":16,"q":21,"o":20,"k":-12,"j":33,"h":-9,"g":21,"f":9,"e":21,"d":24,"c":20,"b":-10,"a":21,"\\":-12,"W":-8,"V":-8,"R":-10,"Q":10,"P":-12,"O":12,"L":-12,"K":-13,"J":44,"G":15,"F":-10,"E":-9,"D":-9,"C":12,"B":-8,"A":49,"@":22,";":34,":":36,"9":10,"8":8,"7":20,"6":13,"5":10,"4":8,"3":27,"2":28,"1":42,"\/":48,".":52,",":51,")":15,"(":11,"#":37}},"0":{"d":"174,-254r-18,16r-87,0r-14,-16r17,-16r87,0xm191,-235r-8,85r-17,15r-14,-15r7,-85r17,-16xm66,-235r-7,85r-18,15r-14,-15r7,-85r18,-16xm180,-119r-6,84r-18,16r-15,-16r8,-84r17,-16xm56,-119r-8,84r-17,16r-14,-16r7,-84r17,-16xm152,-16r-17,16r-87,0r-15,-16r18,-16r87,0","k":{"z":10,"x":13,"w":9,"v":9,"u":11,"t":13,"s":16,"q":17,"o":17,"n":10,"m":11,"l":10,"j":55,"i":15,"g":18,"f":13,"e":17,"d":21,"c":17,"a":23,"]":13,"\\":16,"Z":10,"Y":24,"X":26,"W":15,"V":16,"U":10,"T":13,"S":12,"Q":13,"O":14,"N":10,"M":10,"J":30,"I":10,"H":10,"G":17,"D":8,"C":14,"B":9,"A":32,"@":16,"?":9,";":29,":":32,"\/":30,".":31,",":31,")":38,"(":20,"'":11,"#":23,"\"":9,"!":14}},"1":{"d":"137,-270v-18,11,-22,36,-55,32r-14,-17r17,-15r52,0xm140,-266r-11,116r-17,15r-15,-16r7,-84xm126,-120r-8,105r-18,15r-15,-16r10,-104r17,-15","k":{"z":63,"y":61,"x":66,"w":63,"v":63,"u":64,"t":66,"s":70,"r":60,"q":71,"p":61,"o":71,"n":64,"m":64,"l":61,"k":55,"j":100,"i":61,"h":58,"g":72,"f":66,"e":71,"d":75,"c":70,"b":57,"a":77,"]":64,"\\":56,"Z":62,"Y":63,"X":63,"W":60,"V":60,"U":60,"T":64,"S":65,"R":57,"Q":66,"P":55,"O":68,"N":61,"M":61,"L":55,"K":55,"J":83,"I":61,"H":61,"G":70,"F":57,"E":58,"D":59,"C":67,"B":60,"A":81,"@":69,"?":62,";":82,":":85,"\/":80,".":82,",":81,")":81,"(":73,"'":64,"#":77,"\"":60,"!":66}},"2":{"d":"175,-255r-18,17r-87,0r-14,-17r17,-15r88,0xm192,-235r-7,82r-17,15r-15,-15r7,-82r17,-16xm165,-135r-18,15r-87,0r-15,-15r17,-16r88,0xm57,-117r-7,82r-35,32r10,-114r17,-15xm154,-16r-17,16r-120,0r35,-32r88,0","k":{"z":18,"y":16,"x":21,"w":18,"v":18,"u":20,"t":20,"s":24,"r":15,"q":27,"p":15,"o":26,"n":19,"m":19,"l":17,"k":11,"j":62,"i":23,"h":14,"g":27,"f":20,"e":27,"d":30,"c":26,"b":13,"a":32,"]":21,"\\":23,"Z":18,"Y":31,"X":33,"W":22,"V":23,"U":17,"T":20,"S":19,"R":13,"Q":19,"P":12,"O":21,"N":17,"M":17,"L":12,"K":11,"J":55,"I":17,"H":17,"G":23,"F":13,"E":14,"D":15,"C":21,"B":16,"A":50,"@":28,"?":16,";":44,":":47,"\/":48,".":46,",":46,")":45,"(":27,"'":10,"#":46,"\"":8,"!":21}},"3":{"d":"165,-254r-17,16r-88,0r-14,-16r17,-16r87,0xm182,-235r-7,82r-18,15r-14,-15r7,-82r17,-16xm154,-135r-17,16r-87,0r-15,-16r18,-16r87,0xm172,-116r-7,81r-17,17r-15,-17r7,-81r17,-16xm144,-16r-17,16r-88,0r-14,-16r17,-16r88,0","k":{"z":18,"y":16,"x":21,"w":18,"v":18,"u":19,"t":22,"s":24,"r":15,"q":26,"p":16,"o":26,"n":19,"m":19,"l":19,"k":13,"j":64,"i":24,"h":16,"g":27,"f":22,"e":26,"d":30,"c":25,"b":14,"a":32,"]":22,"\\":25,"Z":19,"Y":33,"X":35,"W":24,"V":26,"U":18,"T":22,"S":20,"R":15,"Q":21,"P":13,"O":23,"N":19,"M":19,"L":13,"K":13,"J":38,"I":19,"H":19,"G":25,"F":15,"E":16,"D":17,"C":22,"B":18,"A":40,"@":24,"?":18,";":38,":":41,"\/":38,".":40,",":40,")":46,"(":29,"'":19,"#":32,"\"":17,"!":22}},"4":{"d":"186,-255r-9,102r-16,15r-15,-15r9,-102r17,-15xm62,-255r-9,102r-18,15r-14,-15r9,-102r18,-15xm157,-135r-17,16r-87,0r-15,-16r17,-15r88,0xm175,-116r-9,100r-17,16r-14,-15r8,-101r17,-15","k":{"z":15,"y":13,"x":18,"w":15,"v":15,"u":17,"t":18,"s":22,"r":13,"q":23,"p":13,"o":23,"n":17,"m":17,"l":14,"k":9,"j":53,"i":14,"h":12,"g":24,"f":19,"e":23,"d":27,"c":22,"b":10,"a":29,"]":18,"\\":13,"Z":15,"Y":21,"X":22,"W":15,"V":16,"U":14,"T":17,"S":17,"R":11,"Q":18,"P":9,"O":20,"N":14,"M":14,"L":9,"K":8,"J":35,"I":14,"H":14,"G":22,"F":10,"E":11,"D":12,"C":19,"B":13,"A":33,"@":22,"?":14,";":35,":":37,"\/":32,".":34,",":34,")":33,"(":26,"'":16,"#":29,"\"":13,"!":18}},"5":{"d":"173,-254r-17,16r-87,0r-29,-32r119,0xm66,-235r-7,81r-17,15r-15,-15r10,-113xm163,-135r-17,15r-87,0r-15,-15r18,-16r87,0xm180,-117r-7,82r-17,15r-15,-15r8,-82r17,-15xm153,-17r-18,16r-86,0r-15,-16r17,-15r87,0","k":{"z":31,"y":53,"x":50,"w":51,"v":53,"u":27,"t":57,"s":34,"r":23,"q":26,"p":23,"o":26,"n":27,"m":27,"l":27,"k":21,"j":71,"i":32,"h":24,"g":28,"f":49,"e":26,"d":29,"c":25,"b":22,"a":33,"]":36,"\\":31,"Z":30,"Y":39,"X":40,"W":33,"V":34,"U":26,"T":35,"S":32,"R":23,"Q":24,"P":21,"O":26,"N":27,"M":27,"L":21,"K":21,"J":38,"I":27,"H":27,"G":27,"F":23,"E":24,"D":24,"C":24,"B":25,"A":40,"@":24,"?":37,";":30,":":33,"\/":38,".":32,",":32,")":47,"(":29,"'":44,"#":32,"\"":42,"!":34}},"6":{"d":"179,-254r-18,16r-87,0r-15,-16r18,-16r87,0xm71,-235r-7,81r-17,16r-15,-16r8,-81r17,-16xm168,-135r-16,16r-89,0r-14,-16r17,-16r88,0xm186,-116r-7,81r-18,17r-14,-17r7,-81r17,-16xm61,-117r-7,82r-18,16r-15,-16r8,-82r17,-15xm158,-16r-17,16r-87,0r-15,-16r18,-16r87,0","k":{"z":25,"y":48,"x":44,"w":46,"v":48,"u":22,"t":51,"s":30,"r":18,"q":21,"p":18,"o":21,"n":22,"m":22,"l":22,"k":15,"j":66,"i":27,"h":18,"g":23,"f":44,"e":21,"d":24,"c":20,"b":17,"a":27,"]":30,"\\":25,"Z":24,"Y":33,"X":34,"W":28,"V":28,"U":21,"T":30,"S":27,"R":18,"Q":19,"P":16,"O":21,"N":22,"M":22,"L":16,"K":15,"J":32,"I":22,"H":22,"G":22,"F":18,"E":18,"D":19,"C":19,"B":20,"A":34,"@":19,"?":32,";":24,":":27,"\/":32,".":26,",":25,")":40,"(":23,"'":39,"#":27,"\"":37,"!":29}},"7":{"d":"170,-270r-35,32r-87,0r-14,-17r17,-15r119,0xm174,-266r-11,116r-17,15r-15,-16r7,-84xm161,-120r-9,105r-18,15r-14,-16r9,-104r17,-15","k":{"z":30,"y":27,"x":33,"w":30,"v":29,"u":31,"t":32,"s":36,"r":27,"q":37,"p":27,"o":37,"n":31,"m":31,"l":28,"k":22,"j":67,"i":27,"h":24,"g":38,"f":33,"e":37,"d":40,"c":36,"b":23,"a":43,"]":31,"\\":22,"Z":28,"Y":30,"X":29,"W":26,"V":26,"U":27,"T":30,"S":31,"R":24,"Q":32,"P":22,"O":34,"N":28,"M":28,"L":22,"K":21,"J":49,"I":28,"H":28,"G":36,"F":24,"E":24,"D":25,"C":33,"B":26,"A":47,"@":35,"?":28,";":49,":":51,"\/":46,".":48,",":48,")":47,"(":40,"'":30,"#":43,"\"":27,"!":32}},"8":{"d":"174,-254r-17,16r-88,0r-15,-16r18,-16r87,0xm191,-235r-7,82r-18,15r-14,-15r7,-82r18,-16xm67,-235r-8,81r-17,16r-15,-16r8,-81r17,-16xm163,-135r-16,16r-88,0r-14,-16r17,-16r87,0xm181,-116r-7,81r-17,17r-15,-17r7,-81r17,-16xm56,-117r-7,82r-18,16r-14,-16r7,-82r17,-15xm154,-16r-18,16r-87,0r-15,-16r18,-16r87,0","k":{"z":10,"x":13,"w":9,"v":9,"u":11,"t":13,"s":15,"q":17,"o":17,"n":10,"m":10,"l":10,"j":55,"i":16,"g":18,"f":13,"e":17,"d":21,"c":16,"a":23,"]":14,"\\":16,"Z":11,"Y":24,"X":26,"W":15,"V":17,"U":10,"T":13,"S":12,"Q":12,"O":14,"N":10,"M":10,"J":29,"I":10,"H":10,"G":16,"D":8,"C":13,"B":9,"A":31,"@":15,"?":9,";":29,":":32,"\/":29,".":31,",":30,")":37,"(":20,"'":11,"#":23,"\"":9,"!":14}},"9":{"d":"168,-254r-17,16r-88,0r-14,-16r17,-16r88,0xm186,-235r-8,82r-17,15r-15,-15r7,-82r18,-16xm60,-235r-6,81r-18,16r-14,-15r7,-82r17,-16xm158,-135r-17,16r-87,0r-15,-16r17,-15r88,0xm175,-116r-7,81r-18,17r-14,-17r8,-81r17,-16xm148,-16r-18,16r-87,0r-15,-16r18,-16r87,0","k":{"z":15,"y":13,"x":18,"w":15,"v":15,"u":16,"t":18,"s":22,"r":12,"q":22,"p":12,"o":22,"n":16,"m":16,"l":16,"k":10,"j":60,"i":21,"h":13,"g":24,"f":18,"e":22,"d":26,"c":22,"b":11,"a":29,"]":19,"\\":22,"Z":16,"Y":30,"X":32,"W":21,"V":22,"U":15,"T":18,"S":17,"R":12,"Q":18,"P":10,"O":20,"N":16,"M":16,"L":10,"K":9,"J":35,"I":16,"H":16,"G":22,"F":12,"E":13,"D":13,"C":19,"B":14,"A":37,"@":21,"?":15,";":35,":":38,"\/":35,".":37,",":36,")":43,"(":26,"'":16,"#":29,"\"":14,"!":19}},":":{"d":"71,-150r-3,30r-31,0r2,-30r32,0xm61,-31r-3,31r-32,0r2,-31r33,0","w":81,"k":{"z":15,"y":27,"x":20,"w":26,"v":27,"u":8,"t":38,"s":9,"l":8,"j":85,"i":13,"g":8,"f":8,"a":18,"]":19,"\\":81,"Z":12,"Y":85,"X":19,"W":31,"V":40,"U":8,"T":85,"S":15,"N":8,"M":8,"J":19,"I":8,"H":8,"A":13,"?":42,";":19,":":22,"9":18,"8":8,"7":105,"6":12,"5":24,"4":22,"3":28,"1":76,"\/":13,".":14,",":14,")":18,"(":11,"'":75,"#":24,"!":14}},";":{"d":"68,-149r-3,30r-30,0r2,-30r31,0xm59,-46r-3,31r-17,15r-14,-15r3,-31r31,0","w":79,"k":{"z":13,"y":26,"x":24,"w":25,"v":26,"t":37,"s":8,"j":82,"i":12,"g":7,"a":14,"]":18,"\\":78,"Z":10,"Y":82,"X":23,"W":30,"V":39,"T":82,"S":13,"J":18,"A":14,"?":41,";":18,":":21,"9":17,"7":103,"6":10,"5":23,"4":21,"3":27,"1":75,"\/":13,".":15,",":14,")":17,"(":9,"'":75,"#":23,"!":13}},"<":{"d":"229,0r-218,-90r0,-35r218,-90r0,44r-156,64r156,63r0,44","w":250},"=":{"d":"248,-123r-221,0r0,-41r221,0r0,41xm248,-51r-221,0r0,-40r221,0r0,40","w":261},">":{"d":"229,-90r-218,90r0,-44r155,-63r-155,-64r0,-44r218,90r0,35","w":213},"?":{"d":"19,-239v31,-61,153,-48,153,37v0,53,-45,70,-68,98v-4,9,-3,30,-3,44r-44,1v0,-36,-4,-69,21,-84v19,-11,52,-40,48,-55v-12,-56,-87,-24,-97,14r-10,-2r0,-53xm80,-44v20,0,30,10,30,27v0,18,-10,27,-30,27v-20,0,-31,-7,-31,-27v0,-18,11,-27,31,-27","w":176,"k":{"s":8,"q":14,"o":13,"j":48,"i":9,"g":14,"e":14,"d":18,"c":13,"a":15,"]":9,"\\":14,"Y":22,"X":23,"W":12,"V":14,"J":60,"G":9,"A":48,"@":17,";":33,":":35,"9":10,"8":7,"7":39,"6":12,"5":14,"4":11,"3":45,"2":47,"1":61,"\/":41,".":58,",":58,")":33,"(":11,"#":34,"!":8}},"@":{"d":"203,-264v85,0,152,52,152,130v0,62,-39,120,-106,120v-25,0,-42,-11,-42,-35r0,17v-39,34,-115,16,-108,-47v-8,-70,79,-139,131,-84r7,-13r38,0r-29,117v0,6,3,8,11,9v35,-6,57,-41,58,-84v0,-59,-50,-96,-113,-95v-85,0,-144,62,-144,138v0,120,163,144,239,79r18,26v-33,25,-72,43,-126,44v-98,2,-171,-62,-171,-150v0,-102,85,-172,185,-172xm191,-150v-29,-1,-49,39,-49,72v0,34,34,37,52,18v15,-16,16,-42,23,-65v-2,-17,-10,-25,-26,-25","w":353,"k":{"y":10,"x":18,"w":8,"v":8,"r":-11,"p":-9,"k":-12,"j":35,"h":-9,"c":-8,"b":-9,"]":18,"\\":32,"Z":16,"Y":37,"X":30,"W":15,"V":21,"T":21,"R":-9,"P":-11,"L":-11,"K":-12,"J":16,"F":-9,"E":-9,"D":-8,"C":-8,"A":21,"7":70,"3":17,"1":62,"0":-8,"\/":16,".":40,",":36,")":37,"'":8}},"A":{"d":"260,5r-56,0r-22,-71r-91,0r-21,71r-54,0r87,-278r70,0xm168,-116r-31,-109r-32,109r63,0","w":262,"k":{"y":52,"w":54,"v":54,"u":14,"t":41,"s":11,"q":16,"o":19,"j":45,"g":16,"f":27,"e":18,"d":21,"c":17,"a":12,"\\":64,"Y":71,"W":51,"V":68,"U":19,"T":59,"S":11,"Q":23,"O":25,"J":11,"G":26,"C":23,"@":15,"?":28,"9":15,"7":90,"6":8,"5":20,"4":46,"3":20,"1":66,")":8,"(":7,"'":57,"#":21,"\"":44}},"B":{"d":"160,-190v0,-37,-44,-29,-82,-30r0,61v37,1,82,3,82,-31xm78,-44v40,-1,85,8,85,-35v0,-40,-44,-33,-85,-33r0,68xm26,-273v85,1,188,-17,188,70v0,34,-14,55,-43,64v29,10,45,32,45,70v3,86,-103,75,-190,74r0,-278","w":226,"k":{"x":8,"t":7,"s":10,"j":49,"i":10,"d":8,"]":11,"\\":17,"Y":24,"X":24,"W":14,"V":17,"T":9,"J":12,"G":8,"A":16,";":11,":":17,"9":13,"7":41,"5":17,"4":14,"3":31,"2":7,"1":63,"\/":14,".":14,",":15,")":19,"!":10}},"C":{"d":"136,-43v41,-1,60,-31,80,-65r0,80v-22,26,-50,38,-84,38v-77,1,-111,-62,-111,-144v0,-82,35,-144,111,-144v36,0,64,12,84,36r0,58r-10,3v-36,-66,-134,-52,-134,51v0,47,20,88,64,87","w":223,"k":{"x":9,"u":8,"t":8,"s":10,"j":47,"i":8,"g":8,"d":9,"a":8,"]":9,"\\":9,"Y":17,"X":18,"W":9,"V":11,"T":9,"J":13,"A":11,";":10,":":12,"9":12,"7":35,"5":17,"4":13,"3":25,"1":57,"\/":10,")":13,"#":8}},"D":{"d":"110,-273v91,-3,126,40,127,126v1,85,-41,152,-123,152r-90,0r0,-278r86,0xm185,-142v2,-70,-39,-82,-108,-78r0,175v74,6,106,-16,108,-97","w":247,"k":{"y":12,"x":17,"w":13,"v":13,"t":8,"j":50,"i":11,"d":9,"a":15,"]":23,"\\":30,"Z":15,"Y":37,"X":40,"W":22,"V":26,"T":18,"J":24,"A":31,"?":8,";":17,":":19,"9":10,"7":58,"6":10,"5":14,"4":11,"3":27,"2":14,"1":74,"\/":27,".":41,",":42,")":44,"(":9,"'":9,"#":16,"!":11}},"E":{"d":"192,5r-168,0r0,-278r168,0r0,55r-116,0r0,60r116,0r0,51r-116,0r0,61r116,0r0,51","w":202,"k":{"z":11,"y":9,"x":11,"w":11,"v":11,"u":12,"t":21,"s":13,"r":8,"q":10,"p":8,"o":11,"n":12,"m":12,"l":10,"j":49,"i":10,"h":7,"g":12,"f":10,"e":10,"d":13,"c":10,"a":13,"]":14,"Z":9,"Y":11,"X":9,"W":9,"V":8,"U":10,"T":13,"S":11,"Q":7,"O":9,"N":10,"M":10,"J":18,"I":10,"H":10,"G":10,"D":8,"C":8,"B":9,"A":8,"@":8,"?":9,";":13,":":14,"9":14,"7":34,"6":8,"5":19,"4":16,"3":24,"2":10,"1":57,"\/":9,")":13,"'":10,"#":23,"\"":12,"!":10}},"F":{"d":"197,-105r-121,0r0,110r-53,0r0,-278r174,0r0,55r-121,0r0,60r121,0r0,53","w":205,"k":{"z":15,"y":13,"x":18,"w":15,"v":14,"u":16,"t":23,"s":16,"r":11,"q":14,"p":12,"o":14,"n":15,"m":15,"l":13,"j":52,"i":13,"h":10,"g":16,"f":13,"e":14,"d":15,"c":14,"b":9,"a":26,"]":16,"\\":8,"Z":13,"Y":14,"X":14,"W":12,"V":11,"U":13,"T":16,"S":14,"R":9,"Q":10,"P":8,"O":12,"N":13,"M":13,"L":8,"J":86,"I":13,"H":13,"G":13,"F":9,"E":10,"D":11,"C":11,"B":12,"A":38,"@":11,"?":12,";":26,":":29,"9":17,"8":10,"7":37,"6":15,"5":22,"4":18,"3":35,"2":19,"1":59,"0":10,"\/":33,".":121,",":121,")":32,"(":14,"'":9,"#":24,"\"":10,"!":17}},"G":{"d":"75,-132v0,65,47,118,102,81r0,-69r52,0r0,83v-22,31,-53,47,-92,47v-73,1,-114,-62,-114,-140v0,-85,38,-148,119,-148v33,0,60,12,81,36r0,80v-23,-36,-37,-57,-80,-59v-47,-2,-68,37,-68,89","w":237,"k":{"x":12,"w":9,"v":9,"t":12,"s":11,"j":49,"i":10,"f":10,"d":8,"]":8,"\\":13,"Y":21,"X":21,"W":13,"V":14,"T":12,"S":9,"J":12,"A":13,"?":9,";":10,":":14,"9":14,"7":38,"5":18,"4":15,"3":29,"1":60,"\/":10,",":8,")":17,"\"":9,"!":8}},"H":{"d":"224,5r-53,0r0,-118r-91,0r0,118r-53,0r0,-278r53,0r0,108r91,0r0,-108r53,0r0,278","w":225,"k":{"z":-9,"y":-11,"x":-9,"w":-9,"v":-9,"u":-8,"r":-12,"q":-9,"p":-12,"o":-9,"n":-8,"m":-8,"l":-8,"k":-14,"j":31,"i":-8,"h":-11,"g":-7,"f":-8,"e":-9,"c":-10,"b":-12,"\\":-13,"Z":-9,"X":-9,"W":-9,"V":-10,"U":-8,"S":-9,"R":-12,"Q":-11,"P":-13,"O":-9,"N":-8,"M":-8,"L":-13,"K":-14,"I":-8,"H":-8,"G":-8,"F":-12,"E":-11,"D":-10,"C":-10,"B":-9,"A":-10,"@":-11,"?":-8,"8":-15,"7":16,"6":-10,"2":-8,"1":38,"0":-15,"\/":-9,".":-8,",":-8,"(":-11,"'":-8,"\"":-8,"!":-8}},"I":{"d":"80,5r-53,0r0,-278r53,0r0,278","w":81,"k":{"z":-9,"y":-11,"x":-9,"w":-9,"v":-9,"u":-8,"r":-12,"q":-9,"p":-12,"o":-9,"n":-8,"m":-8,"l":-8,"k":-14,"j":31,"i":-8,"h":-11,"g":-7,"f":-8,"e":-9,"c":-10,"b":-12,"\\":-13,"Z":-9,"X":-9,"W":-9,"V":-10,"U":-8,"S":-9,"R":-12,"Q":-11,"P":-13,"O":-9,"N":-8,"M":-8,"L":-13,"K":-14,"I":-8,"H":-8,"G":-8,"F":-12,"E":-11,"D":-10,"C":-10,"B":-9,"A":-10,"@":-11,"?":-8,"8":-15,"7":16,"6":-10,"2":-8,"1":38,"0":-15,"\/":-9,".":-8,",":-8,"(":-11,"'":-8,"\"":-8,"!":-8}},"J":{"d":"70,-36v29,0,35,-20,34,-57r0,-180r53,0r0,199v10,81,-81,103,-135,68r0,-57v15,17,23,27,48,27","w":186,"k":{"z":19,"y":17,"x":22,"w":19,"v":19,"u":21,"t":22,"s":22,"r":16,"q":19,"p":17,"o":20,"n":20,"m":21,"l":21,"k":14,"j":60,"i":21,"h":17,"g":21,"f":21,"e":19,"d":23,"c":19,"b":17,"a":23,"]":24,"\\":16,"Z":21,"Y":22,"X":21,"W":19,"V":18,"U":21,"T":23,"S":20,"R":17,"Q":18,"P":15,"O":20,"N":21,"M":21,"L":15,"K":14,"J":28,"I":21,"H":21,"G":21,"F":17,"E":17,"D":18,"C":18,"B":19,"A":32,"@":18,"?":20,";":27,":":32,"9":24,"8":15,"7":44,"6":20,"5":29,"4":26,"3":42,"2":24,"1":66,"0":15,"\/":30,".":30,",":31,")":33,"(":19,"'":20,"#":22,"\"":20,"!":24}},"K":{"d":"224,5r-67,0r-84,-114r0,114r-52,0r0,-278r52,0r0,116r86,-116r65,0r-108,139","w":213,"k":{"z":-10,"y":18,"x":-10,"w":21,"v":20,"u":13,"t":28,"r":-13,"q":18,"p":-12,"o":24,"n":-9,"m":-9,"l":-10,"k":-16,"j":31,"i":-8,"h":-13,"g":8,"f":16,"e":22,"d":20,"c":21,"b":-14,"a":10,"\\":-13,"Z":-11,"Y":-9,"X":-12,"W":-11,"V":-12,"U":-10,"S":8,"R":-14,"Q":24,"P":-15,"O":26,"N":-10,"M":-10,"L":-15,"K":-16,"I":-10,"H":-10,"G":32,"F":-14,"E":-13,"D":-12,"C":28,"B":-11,"A":-12,"@":12,"9":9,"7":23,"6":9,"5":9,"4":12,"3":15,"1":45,"\/":-8,".":-14,",":-18,"(":8,"#":13}},"L":{"d":"171,5r-150,0r0,-278r53,0r0,227r97,0r0,51","w":177,"k":{"z":11,"y":59,"x":11,"w":54,"v":56,"u":14,"t":43,"s":20,"r":8,"q":16,"p":9,"o":19,"n":12,"m":12,"l":13,"j":56,"i":18,"h":10,"g":27,"f":39,"e":18,"d":21,"c":17,"b":9,"a":14,"]":16,"\\":85,"Z":12,"Y":84,"X":12,"W":53,"V":67,"U":18,"T":71,"S":16,"R":9,"Q":23,"P":8,"O":24,"N":13,"M":13,"L":8,"J":21,"I":13,"H":13,"G":26,"F":9,"E":10,"D":11,"C":23,"B":12,"A":11,"@":14,"?":37,";":13,":":15,"9":22,"7":106,"6":11,"5":28,"4":96,"3":27,"2":13,"1":73,"\/":12,")":16,"(":10,"'":94,"#":35,"\"":95,"!":13}},"M":{"d":"240,-196r-60,201r-46,0r-57,-205r0,205r-50,0r0,-278r78,0r53,194r56,-194r76,0r0,278r-50,0r0,-201","w":291,"k":{"z":-9,"y":-11,"x":-9,"w":-9,"v":-9,"u":-8,"r":-12,"q":-9,"p":-12,"o":-9,"n":-8,"m":-8,"l":-8,"k":-14,"j":31,"i":-8,"h":-11,"g":-7,"f":-8,"e":-9,"c":-10,"b":-12,"\\":-13,"Z":-9,"X":-9,"W":-9,"V":-10,"U":-8,"S":-9,"R":-12,"Q":-11,"P":-13,"O":-9,"N":-8,"M":-8,"L":-13,"K":-14,"I":-8,"H":-8,"G":-8,"F":-12,"E":-11,"D":-10,"C":-10,"B":-9,"A":-10,"@":-11,"?":-8,"8":-15,"7":16,"6":-10,"2":-8,"1":38,"0":-15,"\/":-9,".":-8,",":-8,"(":-11,"'":-8,"\"":-8,"!":-8}},"N":{"d":"77,-208r0,213r-50,0r0,-278r72,0r89,196r-1,-196r51,0r0,278r-65,0","w":239,"k":{"z":-9,"y":-11,"x":-9,"w":-9,"v":-9,"u":-8,"r":-12,"q":-9,"p":-12,"o":-9,"n":-8,"m":-8,"l":-8,"k":-14,"j":31,"i":-8,"h":-11,"g":-7,"f":-8,"e":-9,"c":-10,"b":-12,"\\":-13,"Z":-9,"X":-9,"W":-9,"V":-10,"U":-8,"S":-9,"R":-12,"Q":-11,"P":-13,"O":-9,"N":-8,"M":-8,"L":-13,"K":-14,"I":-8,"H":-8,"G":-8,"F":-12,"E":-11,"D":-10,"C":-10,"B":-9,"A":-10,"@":-11,"?":-8,"8":-15,"7":16,"6":-10,"2":-8,"1":38,"0":-15,"\/":-9,".":-8,",":-8,"(":-11,"'":-8,"\"":-8,"!":-8}},"O":{"d":"133,10v-79,1,-112,-65,-111,-150v0,-92,37,-138,110,-138v74,0,111,46,111,138v0,85,-32,149,-110,150xm133,-42v43,0,60,-45,59,-94v0,-57,-20,-85,-60,-85v-39,0,-59,29,-59,89v0,48,17,90,60,90","w":241,"k":{"z":-9,"u":-8,"s":-7,"r":-13,"q":-9,"p":-12,"o":-9,"n":-9,"m":-9,"l":-8,"k":-13,"j":37,"h":-10,"g":-8,"f":-7,"e":-9,"c":-10,"b":-12,"]":8,"\\":16,"Y":23,"X":25,"W":9,"V":13,"U":-8,"R":-12,"Q":-10,"P":-13,"O":-8,"N":-8,"M":-8,"L":-13,"K":-14,"J":7,"I":-8,"H":-8,"F":-12,"E":-11,"D":-10,"C":-9,"B":-9,"A":15,"@":-9,"8":-9,"7":42,"3":14,"1":59,"0":-10,"\/":12,".":19,",":20,")":22,"\"":-9}},"P":{"d":"114,-273v71,-1,101,26,103,89v2,79,-57,107,-143,99r0,90r-53,0r0,-278r93,0xm74,-136v46,1,90,4,90,-43v0,-45,-46,-39,-90,-39r0,82","w":223,"k":{"z":9,"y":10,"x":16,"w":13,"v":12,"u":10,"t":10,"s":12,"q":15,"o":14,"n":10,"m":10,"l":9,"j":53,"i":14,"g":15,"f":9,"e":14,"d":18,"c":13,"a":20,"]":18,"\\":24,"Z":12,"Y":32,"X":33,"W":20,"V":23,"U":9,"T":14,"S":8,"Q":7,"O":9,"N":9,"M":9,"J":82,"I":9,"H":9,"G":11,"C":9,"B":8,"A":48,"@":15,"?":8,";":31,":":33,"9":14,"8":11,"7":50,"6":16,"5":18,"4":15,"3":36,"2":30,"1":72,"0":11,"\/":41,".":141,",":140,")":45,"(":15,"#":33,"!":13}},"Q":{"d":"241,-141v0,75,-22,126,-75,146r17,35r-44,0r-15,-30v-71,-4,-103,-67,-103,-150v0,-92,37,-138,110,-138v74,0,110,46,110,137xm129,-40v55,2,61,-48,61,-98v0,-56,-20,-83,-60,-83v-39,0,-59,28,-59,85v0,51,17,94,58,96","w":239,"k":{"z":-9,"u":-9,"s":-8,"r":-13,"p":-12,"o":-9,"n":-9,"m":-9,"l":-8,"k":-14,"j":37,"h":-11,"f":-8,"e":-9,"c":-10,"b":-12,"]":8,"\\":18,"Y":23,"X":25,"W":8,"V":12,"U":-8,"R":-12,"Q":-8,"P":-14,"O":-9,"N":-8,"M":-8,"L":-14,"K":-14,"I":-8,"H":-8,"F":-12,"E":-12,"D":-11,"C":-10,"B":-10,"A":14,"@":-8,"8":-9,"7":42,"3":13,"1":59,"0":-10,"\/":11,".":19,",":21,")":21,"\"":-9}},"R":{"d":"220,-195v0,51,-29,82,-80,83r89,117r-66,0r-87,-118r0,118r-53,0r0,-278v91,0,197,-14,197,78xm167,-185v0,-42,-51,-30,-91,-32r0,64v39,-1,91,8,91,-32","w":237,"k":{"y":12,"w":14,"v":13,"u":13,"t":14,"s":16,"q":21,"o":19,"j":49,"i":11,"g":20,"f":13,"e":20,"d":24,"c":19,"a":23,"]":9,"\\":26,"Y":34,"W":23,"V":26,"U":13,"T":17,"S":12,"Q":13,"O":14,"J":17,"G":17,"C":14,"@":23,"?":12,";":20,":":15,"9":19,"8":17,"7":52,"6":22,"5":24,"4":21,"3":30,"2":8,"1":75,"0":16,"\/":8,")":18,"(":20,"'":10,"#":28,"\"":10,"!":9}},"S":{"d":"111,-224v-34,-4,-53,39,-25,52v47,21,106,29,106,95v0,87,-114,115,-164,54r0,-67v21,25,37,47,74,50v37,3,49,-31,33,-55v-38,-25,-113,-25,-113,-95v0,-86,104,-115,162,-59r-1,74v-22,-30,-34,-45,-72,-49","w":200,"k":{"x":10,"w":8,"v":8,"t":11,"s":10,"j":47,"i":8,"f":10,"]":12,"\\":10,"Y":18,"X":18,"W":11,"V":12,"T":12,"J":10,"A":16,"?":9,";":9,":":15,"9":15,"7":33,"5":19,"4":16,"3":31,"1":56,"\/":13,".":14,",":15,")":19,"'":8,"\"":10,"!":12}},"T":{"d":"210,-218r-70,0r0,223r-52,0r0,-223r-69,0r0,-55r191,0r0,55","w":188,"k":{"z":-18,"y":-21,"x":-15,"w":-18,"v":-18,"u":-17,"t":-9,"r":-22,"q":15,"p":-21,"o":15,"n":-18,"m":-18,"l":-19,"k":-25,"j":20,"i":-19,"h":-22,"g":14,"e":17,"d":17,"c":13,"b":-24,"a":13,"]":-16,"\\":-24,"Z":-19,"Y":-18,"X":-19,"W":-21,"V":-21,"U":-20,"T":-17,"S":-18,"R":-23,"Q":-13,"P":-25,"O":-12,"N":-19,"M":-19,"L":-25,"K":-26,"J":43,"I":-19,"H":-19,"F":-23,"E":-22,"D":-22,"C":-10,"B":-21,"A":33,"@":19,"?":-20,";":42,":":43,"9":-12,"8":-14,"6":-9,"4":-10,"3":11,"2":13,"1":27,"0":-14,"\/":24,".":39,",":39,"(":-10,"'":-24,"#":38,"\"":-22,"!":-16}},"U":{"d":"126,10v-67,0,-101,-37,-100,-106r0,-177r51,0r0,177v0,37,16,56,49,56v32,0,49,-19,49,-56r0,-177r51,0r0,177v0,71,-33,106,-100,106","w":235,"k":{"j":40,"J":10,"A":17,";":12,":":15,"7":25,"5":10,"3":23,"1":47,"\/":14,".":18,",":19,")":20}},"V":{"d":"134,-57r65,-216r54,0r-88,278r-61,0r-88,-278r55,0","w":246,"k":{"x":8,"t":9,"s":19,"q":26,"o":24,"l":-8,"k":-14,"j":32,"h":-11,"g":25,"f":12,"e":25,"d":28,"c":24,"b":-12,"a":23,"\\":-12,"Z":-7,"X":-7,"W":-9,"V":-10,"U":-8,"R":-12,"Q":12,"P":-13,"O":14,"N":-8,"M":-8,"L":-13,"K":-14,"J":51,"I":-8,"H":-8,"G":18,"F":-12,"E":-11,"D":-10,"C":14,"B":-9,"A":59,"@":27,";":39,":":41,"9":10,"8":8,"7":19,"6":13,"5":9,"4":8,"3":26,"2":28,"1":42,"0":7,"\/":48,".":62,",":62,")":15,"(":11,"#":44,"\"":-8}},"W":{"d":"308,-273r53,0r-68,278r-59,0r-41,-160v-2,-8,-3,-18,-5,-29r-45,189r-59,0r-65,-278r54,0r42,195r48,-195r53,0r48,188","w":360,"k":{"x":8,"t":9,"s":18,"q":23,"o":22,"k":-10,"j":36,"g":22,"f":11,"e":22,"d":26,"c":21,"b":-8,"a":22,"\\":-9,"S":8,"R":-8,"Q":12,"P":-10,"O":14,"L":-10,"K":-10,"J":44,"G":17,"F":-8,"C":14,"A":48,"@":23,";":35,":":37,"9":12,"8":10,"7":23,"6":15,"5":13,"4":11,"3":29,"2":31,"1":45,"0":9,"\/":47,".":51,",":51,")":18,"(":13,"#":37}},"X":{"d":"245,5r-62,0r-53,-96r-53,96r-60,0r82,-141r-79,-137r61,0r51,93r52,-93r60,0r-81,137","w":240,"k":{"y":15,"w":18,"v":18,"u":15,"t":24,"s":9,"r":-9,"q":19,"p":-8,"o":24,"k":-11,"j":36,"h":-8,"g":12,"f":21,"e":23,"d":22,"c":21,"b":-10,"a":12,"\\":-9,"S":9,"R":-9,"Q":25,"P":-11,"O":27,"L":-11,"K":-12,"G":31,"F":-9,"E":-8,"D":-8,"C":27,"A":-7,"@":15,"?":8,"9":11,"7":26,"6":8,"5":13,"4":14,"3":17,"1":48,".":-8,",":-12,"(":8,"#":17}},"Y":{"d":"244,-273r-88,173r0,105r-52,0r0,-104r-88,-174r60,0r54,116r55,-116r59,0","w":234,"k":{"z":14,"y":12,"x":17,"w":14,"v":14,"u":15,"t":19,"s":33,"r":11,"q":42,"p":11,"o":40,"n":15,"m":15,"k":-12,"j":34,"h":-9,"g":41,"f":24,"e":42,"d":44,"c":40,"b":-11,"a":37,"\\":-10,"W":-8,"V":-8,"S":14,"R":-10,"Q":21,"P":-12,"O":23,"L":-12,"K":-13,"J":67,"G":28,"F":-10,"E":-9,"D":-9,"C":24,"B":-8,"A":60,"@":45,";":60,":":62,"9":16,"8":14,"7":23,"6":19,"5":11,"4":12,"3":30,"2":31,"1":45,"0":13,"\/":49,".":69,",":69,")":18,"(":18,"#":60}},"Z":{"d":"195,-216r-114,169r112,0r0,52r-174,0r0,-51r115,-170r-113,0r0,-57r174,0r0,57","w":200,"k":{"s":14,"q":9,"o":13,"j":42,"g":21,"f":13,"e":12,"d":12,"c":10,"a":8,"Q":9,"O":10,"J":12,"G":15,"C":11,";":12,":":13,"9":11,"7":27,"5":16,"4":13,"3":19,"1":49,"#":27}},"[":{"d":"100,5r-73,0r0,-278r73,0r0,45r-25,0r0,189r25,0r0,44","w":113},"\\":{"d":"199,23r-31,19r-160,-309r32,-18","w":179,"k":{"z":-10,"y":36,"x":-10,"w":46,"v":49,"u":10,"t":37,"r":-13,"q":15,"p":-21,"o":18,"n":-8,"m":-8,"k":-12,"j":-10,"h":-9,"f":21,"e":17,"d":20,"c":15,"b":-10,"\\":100,"Y":65,"X":-7,"W":44,"V":61,"U":18,"T":52,"S":8,"R":-9,"Q":26,"P":-12,"O":27,"L":-12,"K":-12,"G":29,"F":-10,"E":-9,"D":-8,"C":25,"A":-8,"@":12,"?":22,"9":10,"7":94,"5":16,"4":63,"3":15,"1":62,".":-15,",":-19,"'":85,"#":13,"\"":64}},"]":{"d":"100,5r-73,0r0,-44r25,0r0,-189r-25,0r0,-45r73,0r0,278","w":101,"k":{"z":-9,"y":-11,"x":-9,"w":-9,"v":-9,"u":-8,"r":-12,"q":-9,"p":-12,"o":-9,"n":-8,"m":-8,"l":-8,"k":-14,"j":31,"i":-8,"h":-11,"g":-7,"f":-8,"e":-9,"c":-10,"b":-12,"\\":-13,"Z":-9,"X":-9,"W":-9,"V":-10,"U":-8,"S":-9,"R":-12,"Q":-11,"P":-13,"O":-9,"N":-8,"M":-8,"L":-13,"K":-14,"I":-8,"H":-8,"G":-8,"F":-12,"E":-11,"D":-10,"C":-10,"B":-9,"A":-10,"@":-11,"?":-8,"8":-15,"7":16,"6":-10,"2":-8,"1":38,"0":-15,"\/":-9,".":-8,",":-8,"(":-11,"'":-8,"\"":-8,"!":-8}},"^":{"d":"252,-153r-51,0r-67,-67r-68,67r-51,0r97,-109r44,0","w":253},"_":{"d":"218,90r-191,0r0,-41r191,0r0,41","w":196},"`":{"d":"117,-232r-35,0r-61,-71r54,0","w":105},"a":{"d":"36,-194v43,-53,158,-51,157,32r0,167r-48,0r0,-21v-32,51,-123,30,-120,-36v2,-50,36,-64,82,-77v26,-7,38,-17,38,-29v0,-15,-11,-23,-33,-23v-31,0,-57,23,-76,44r0,-57xm76,-54v0,14,9,21,24,21v31,1,45,-25,44,-69v-31,11,-73,34,-68,48","w":187,"k":{"z":-15,"x":-15,"u":-13,"t":-12,"s":-12,"r":-18,"q":-14,"p":-17,"o":-14,"n":-14,"m":-14,"l":-13,"k":-19,"j":30,"i":-8,"h":-17,"g":-12,"f":-14,"e":-14,"d":-14,"c":-14,"b":-17,"a":-11,"]":-10,"\\":18,"@":-18,"?":-10,";":-11,":":-10,"9":-9,"8":-22,"7":81,"6":-17,"2":-14,"1":47,"0":-22,"\/":-16,".":-14,",":-11,")":-11,"(":-18,"#":-13,"\"":-12,"!":-13}},"b":{"d":"135,-230v58,0,81,51,81,115v0,70,-29,128,-92,128v-25,0,-42,-9,-55,-26r0,18r-47,0r0,-282r52,0r0,82v15,-23,35,-35,61,-35xm71,-104v0,39,13,71,48,71v33,0,50,-27,50,-81v0,-36,-14,-65,-47,-65v-36,0,-51,34,-51,75","w":225,"k":{"y":18,"x":28,"w":18,"v":18,"t":14,"j":51,"i":12,"f":8,"d":10,"a":8,"]":21,"\\":44,"?":16,";":12,":":14,"9":12,"7":104,"6":8,"5":17,"4":14,"3":28,"2":12,"1":72,"\/":21,".":20,",":22,")":28,"'":27,"#":10,"\"":11,"!":13}},"c":{"d":"69,-112v0,42,16,78,53,78v26,0,45,-15,58,-44r10,2r0,51v-16,25,-41,38,-75,38v-65,0,-93,-52,-93,-122v-1,-73,29,-121,97,-121v30,0,53,11,71,31r0,70v-20,-33,-29,-51,-68,-51v-35,0,-53,23,-53,68","w":198,"k":{"x":15,"w":8,"v":8,"j":49,"i":10,"]":8,"\\":29,";":10,":":12,"9":9,"7":100,"5":14,"4":12,"3":22,"1":66,")":9}},"d":{"d":"22,-102v-1,-68,29,-128,92,-127v22,0,39,8,51,24r0,-72r52,0r0,282r-52,0r0,-23v-15,21,-36,31,-62,31v-57,1,-81,-53,-81,-115xm69,-104v0,38,14,71,49,71v33,0,50,-27,50,-81v0,-35,-14,-65,-47,-65v-37,0,-52,34,-52,75","w":246,"k":{"z":19,"y":18,"x":19,"w":19,"v":19,"u":21,"t":23,"s":22,"r":16,"q":20,"p":17,"o":21,"n":20,"m":20,"l":21,"k":14,"j":60,"i":21,"h":17,"g":22,"f":21,"e":20,"d":24,"c":20,"b":17,"a":23,"]":24,"\\":16,"@":18,"?":20,";":23,":":24,"9":24,"8":13,"7":44,"6":18,"5":29,"4":26,"3":35,"2":20,"1":66,"0":13,"\/":19,".":21,",":24,")":23,"(":17,"'":21,"#":22,"\"":21,"!":21}},"e":{"d":"122,-230v75,0,103,61,89,137r-139,0v0,37,20,61,56,61v28,0,49,-15,64,-46r10,2r0,48v-13,26,-43,41,-81,41v-67,0,-99,-50,-99,-120v-1,-70,33,-123,100,-123xm174,-138v-2,-27,-23,-44,-51,-44v-30,0,-46,15,-50,44r101,0","w":222,"k":{"y":17,"x":25,"w":17,"v":18,"t":8,"j":48,"i":8,"a":14,"]":16,"\\":41,"?":12,";":13,":":16,"9":9,"7":103,"5":14,"4":11,"3":26,"2":9,"1":69,"\/":14,".":14,",":17,")":18,"'":16,"#":10,"!":9}},"f":{"d":"53,-193v-14,-84,61,-109,117,-77r0,51v-20,-30,-80,-29,-69,26r67,0r0,46r-63,0r0,152r-51,0r0,-152r-33,0r0,-46r32,0","w":175,"k":{"x":8,"s":8,"q":9,"o":8,"j":44,"g":9,"e":9,"d":12,"c":8,"a":17,"]":8,"@":10,";":23,":":25,"9":9,"7":28,"6":12,"5":14,"4":11,"3":35,"2":36,"1":51,"\/":35,".":62,",":61,")":24,"(":10,"#":27,"!":8}},"g":{"d":"73,-119v0,34,16,61,48,61v34,0,51,-22,51,-65v0,-33,-17,-58,-49,-58v-34,0,-50,26,-50,62xm44,-13v35,41,137,54,129,-29v-14,20,-35,29,-62,29v-55,0,-87,-47,-87,-106v0,-62,31,-112,90,-111v26,0,46,8,59,23r0,-15r48,0r0,192v0,62,-31,94,-95,94v-31,0,-60,-10,-82,-22r0,-55","w":217,"k":{"z":-15,"y":-15,"x":-12,"w":-14,"v":-15,"u":-13,"t":-12,"s":-12,"r":-17,"q":-9,"p":-16,"o":-14,"n":-13,"m":-13,"l":-13,"k":-19,"i":-8,"h":-16,"g":-11,"f":-13,"e":-14,"d":-14,"c":-14,"b":-17,"a":-11,"]":-9,"@":-15,"?":-13,";":-10,":":-8,"9":-8,"8":-21,"7":82,"6":-16,"2":-13,"1":48,"0":-21,"\/":-14,".":-12,",":-12,")":-10,"(":-17,"'":-11,"#":-13,"\"":-12,"!":-12}},"h":{"d":"75,-194v38,-57,133,-37,133,54r0,145r-51,0r0,-123v1,-38,-4,-59,-33,-59v-71,0,-44,112,-49,182r-51,0r0,-282r51,0r0,83","w":218,"k":{"y":11,"w":12,"v":12,"t":8,"j":49,"i":11,"d":9,"]":9,"\\":36,"?":10,"9":10,"7":98,"5":14,"4":11,"3":19,"1":66,")":8,"'":21,"\"":9}},"i":{"d":"90,-259v0,16,-11,25,-32,25v-21,0,-32,-9,-32,-25v0,-16,10,-24,31,-24v22,0,33,8,33,24xm32,-225v15,9,37,10,52,0r0,230r-52,0r0,-230","w":101,"k":{"w":7,"u":9,"t":10,"s":9,"o":8,"n":8,"m":8,"j":43,"g":9,"f":9,"d":11,"a":10,";":12,":":13,"9":13,"7":28,"5":17,"4":14,"3":23,"2":8,"1":50,".":9,",":8,")":11,"'":8,"#":10,"!":8}},"j":{"d":"129,-259v0,16,-12,25,-33,25v-21,0,-32,-9,-32,-25v0,-16,11,-24,32,-24v22,0,33,8,33,24xm22,18v26,11,49,7,49,-35r0,-208v15,9,37,10,52,0r0,211v8,66,-43,93,-101,71r0,-39","w":138,"k":{"t":9,"s":8,"q":10,"j":12,"g":9,"f":7,"d":10,"a":9,";":10,":":11,"9":11,"7":26,"5":15,"4":12,"3":21,"1":48,".":7,")":9,"#":9}},"k":{"d":"207,5r-64,0r-71,-92r0,92r-51,0r0,-282r51,0r0,149r70,-94r64,0r-89,113","w":211,"k":{"t":15,"s":18,"q":30,"o":35,"l":8,"j":50,"i":13,"g":21,"f":24,"e":35,"d":38,"c":33,"a":23,"]":10,"\\":20,"@":28,"?":8,";":18,":":13,"9":16,"8":14,"7":110,"6":19,"5":21,"4":18,"3":32,"2":10,"1":78,"0":14,"\/":9,")":20,"(":18,"'":12,"#":28,"\"":8,"!":11}},"l":{"d":"78,5r-51,0r0,-282r51,0r0,282","w":94,"k":{"t":8,"s":8,"j":46,"g":7,"d":10,"a":8,"]":10,";":10,":":11,"9":11,"7":31,"5":15,"4":12,"3":21,"1":53,")":9,"#":9}},"m":{"d":"121,-177v-67,0,-36,114,-43,182r-52,0r0,-227r50,0r0,28v26,-44,103,-44,120,8v14,-27,35,-40,63,-40v97,0,65,140,70,231r-52,0r0,-123v1,-36,-3,-59,-30,-59v-66,0,-38,114,-44,182r-51,0r0,-123v-1,-36,-3,-59,-31,-59","w":343,"k":{"y":17,"w":18,"v":18,"t":9,"j":49,"i":12,"a":8,"]":10,"\\":40,"?":12,";":8,":":9,"9":11,"7":101,"5":17,"4":14,"3":22,"1":67,")":9,"'":17,"\"":8}},"n":{"d":"76,-194v41,-58,135,-36,135,54r0,145r-52,0r0,-123v2,-39,-4,-59,-33,-59v-71,0,-43,112,-48,182r-52,0r0,-227r50,0r0,28","w":226,"k":{"y":17,"w":18,"v":18,"t":9,"s":8,"j":50,"i":13,"g":8,"a":8,"]":11,"\\":40,"?":12,";":9,":":10,"9":12,"7":102,"5":17,"4":14,"3":22,"1":68,")":10,"'":18,"\"":9,"!":7}},"o":{"d":"125,-230v67,-1,102,48,102,121v0,72,-35,121,-102,122v-70,0,-102,-52,-102,-127v0,-71,33,-115,102,-116xm125,-180v-40,1,-55,24,-55,68v0,52,19,78,55,78v36,0,55,-26,55,-77v0,-46,-19,-69,-55,-69","w":232,"k":{"y":17,"x":28,"w":17,"v":17,"t":8,"j":44,"]":14,"\\":42,"?":12,";":8,":":11,"7":99,"5":12,"4":9,"3":23,"1":65,"\/":13,".":17,",":19,")":22,"'":20}},"p":{"d":"135,-230v57,2,82,51,82,115v1,69,-29,128,-92,128v-21,0,-41,-9,-51,-22r0,73r-51,0r0,-286r49,0r0,25v14,-22,36,-33,63,-33xm71,-104v0,38,14,71,49,71v33,0,49,-27,49,-81v-1,-36,-13,-65,-46,-65v-37,0,-53,33,-52,75","w":225,"k":{"y":23,"x":29,"w":18,"v":18,"t":9,"q":10,"j":49,"i":7,"g":8,"a":8,"]":17,"\\":46,"?":13,";":12,":":14,"9":9,"7":102,"5":14,"4":11,"3":25,"2":7,"1":68,"\/":16,".":20,",":22,")":24,"'":18,"!":9}},"q":{"d":"23,-102v0,-69,29,-128,92,-127v23,0,41,8,53,24r0,-17r49,0r0,286r-51,0r0,-82v-16,21,-36,31,-62,31v-57,1,-81,-52,-81,-115xm70,-104v1,38,13,71,48,71v33,0,50,-27,50,-81v0,-36,-13,-65,-46,-65v-37,0,-53,33,-52,75","w":246,"k":{"z":19,"y":18,"x":19,"w":19,"v":19,"u":21,"t":22,"s":22,"r":17,"q":24,"p":17,"o":20,"n":21,"m":21,"l":21,"k":15,"j":25,"i":27,"h":18,"g":22,"f":21,"e":20,"d":19,"c":19,"b":17,"a":23,"]":25,"\\":37,"@":18,"?":21,";":23,":":25,"9":26,"8":13,"7":116,"6":18,"5":31,"4":28,"3":36,"2":20,"1":82,"0":13,"\/":18,".":21,",":21,")":24,"(":17,"'":23,"#":21,"\"":22,"!":21}},"r":{"d":"71,-202v13,-33,61,-35,87,-13r0,62v-33,-42,-85,-27,-85,49r0,109r-51,0r0,-227r49,0r0,20","w":165,"k":{"z":9,"x":13,"w":9,"v":9,"u":10,"t":10,"s":10,"q":13,"o":12,"n":9,"m":10,"l":10,"j":54,"i":15,"g":13,"f":9,"e":12,"d":12,"c":11,"a":20,"]":28,"\\":27,"@":13,"?":10,";":86,":":87,"9":14,"8":10,"7":114,"6":15,"5":19,"4":17,"3":93,"2":76,"1":80,"0":9,"\/":39,".":83,",":82,")":54,"(":14,"#":31,"!":14}},"s":{"d":"163,-149v-21,-22,-27,-28,-59,-31v-40,-3,-42,43,-6,47v44,5,72,27,75,74v5,70,-93,93,-139,51r-1,-63v18,22,26,37,59,40v32,3,51,-33,25,-46v-41,-20,-93,-21,-93,-79v0,-71,91,-96,138,-53","w":183,"k":{"y":12,"x":18,"w":14,"v":14,"t":14,"s":13,"j":49,"i":10,"g":10,"f":12,"]":10,"\\":33,"?":13,";":10,":":14,"9":17,"7":102,"5":22,"4":19,"3":28,"1":67,"\/":11,".":9,",":11,")":15,"'":13,"\"":12,"!":9}},"t":{"d":"133,-32v23,0,29,-13,43,-32r0,56v-13,14,-32,21,-56,21v-86,0,-59,-107,-63,-185r-35,0r0,-39v39,-9,52,-26,64,-66r23,0r0,55r65,0r0,50r-65,0r0,103v0,25,2,37,24,37","w":182,"k":{"x":8,"t":9,"s":8,"o":7,"j":49,"i":11,"g":12,"f":8,"d":10,"]":9,"\\":20,";":8,":":10,"9":12,"7":83,"5":17,"4":14,"3":19,"1":66,")":8,"#":30}},"u":{"d":"111,-39v71,0,42,-113,48,-183r52,0r0,227r-50,0r0,-27v-12,18,-35,32,-62,32v-103,0,-67,-137,-73,-232r52,0r0,136v1,30,6,47,33,47","w":209,"k":{"z":-12,"y":-13,"x":-12,"w":-12,"v":-12,"u":-10,"t":-9,"s":-9,"r":-15,"q":-12,"p":-14,"o":-11,"n":-11,"m":-11,"l":-10,"k":-16,"j":33,"h":-13,"g":-10,"f":-11,"e":-12,"d":-12,"c":-12,"b":-14,"a":-9,"@":-15,"?":-10,";":-8,"8":-18,"7":85,"6":-14,"2":-12,"1":50,"0":-19,"\/":-13,".":-10,",":-9,")":-8,"(":-15,"'":-10,"#":-10,"\"":-10,"!":-9}},"v":{"d":"125,-53r50,-169r53,0r-74,227r-61,0r-75,-227r55,0","w":228,"k":{"s":11,"q":18,"o":16,"k":-7,"j":43,"g":17,"e":17,"d":17,"c":16,"a":15,"]":23,"\\":13,"@":18,";":31,":":33,"9":8,"7":107,"6":8,"5":13,"4":10,"3":42,"2":31,"1":73,"\/":42,".":55,",":55,")":48,"#":36}},"w":{"d":"179,-152v-7,51,-21,107,-31,157r-58,0r-71,-227r53,0r46,160r32,-160r59,0r33,157r43,-157r52,0r-67,227r-59,0","w":339,"k":{"s":11,"q":17,"o":15,"j":44,"g":17,"e":17,"d":17,"c":15,"a":15,"]":23,"\\":14,"@":17,";":30,":":32,"9":8,"7":108,"6":9,"5":14,"4":11,"3":41,"2":30,"1":74,"\/":42,".":51,",":51,")":48,"(":8,"#":34}},"x":{"d":"131,-59v-1,-1,-8,-26,-11,-9r-42,73r-60,0r74,-115r-70,-112r59,0r44,78r45,-78r59,0r-72,112r72,115r-60,0","w":228,"k":{"s":11,"r":-7,"q":21,"o":25,"k":-9,"j":41,"g":14,"f":10,"e":25,"d":21,"c":24,"a":14,"\\":12,"@":16,";":10,"7":101,"6":8,"5":12,"4":9,"3":22,"1":67,",":-8,")":9,"#":18}},"y":{"d":"108,-113v4,5,11,53,15,40r48,-149r53,0r-98,286r-54,0r23,-67r-80,-219r53,0","w":221,"k":{"s":9,"r":-10,"q":22,"o":14,"k":-11,"j":40,"h":-8,"g":17,"e":16,"d":15,"c":14,"b":-8,"a":13,"]":19,"\\":13,"@":20,";":29,":":31,"7":103,"5":10,"3":40,"2":30,"1":69,"\/":38,".":56,",":56,")":44,"'":-10,"#":34,"\"":-10}},"z":{"d":"177,5r-156,0r0,-49r97,-128r-97,0r0,-50r154,0r0,50r-100,131r102,0r0,46","w":171,"k":{"z":-11,"y":-10,"x":-11,"w":-8,"v":-9,"r":-14,"p":-14,"n":-10,"m":-10,"l":-9,"k":-15,"j":34,"h":-12,"f":-8,"b":-14,"a":-8,"\\":8,"@":-9,"8":-17,"7":86,"6":-13,"2":-10,"1":51,"0":-18,"\/":-12,".":-15,",":-15,"(":-13,"'":-12,"#":11,"\"":-11,"!":-9}},"{":{"d":"89,-93v59,20,-19,146,66,130r0,41v-57,1,-88,-4,-88,-66v0,-44,10,-95,-48,-84r0,-42v53,9,51,-36,48,-84v-4,-61,29,-69,88,-67r0,42v-29,-1,-41,-1,-41,32v0,42,4,87,-25,98","w":142},"|":{"d":"69,90r-42,0r0,-370r42,0r0,370","w":85},"}":{"d":"106,-198v0,45,-9,93,48,84r0,42v-52,-12,-51,35,-48,84v4,61,-26,67,-87,66r0,-42v26,2,42,0,40,-32v-2,-41,-4,-89,26,-97v-30,-9,-27,-56,-26,-98v1,-34,-11,-31,-40,-32r0,-42v57,-1,87,5,87,67","w":138},"~":{"d":"144,-129v47,22,89,9,122,-20r0,46v-43,30,-75,36,-121,17v-57,-24,-87,-10,-127,20r0,-46v34,-26,79,-39,126,-17","w":291},"-":{"d":"119,-86r-92,0r0,-49r92,0r0,49","w":123},"\u00a0":{"w":113}}});
