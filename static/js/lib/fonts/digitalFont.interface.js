define(function(require, exports, module) {
	require('./digitalFont');
	var font = {};
	
	font.digitalFont = function(_box,config){
		var $p = $(_box || document);
		Cufon.replace($p,config);
	};
	
	module.exports = font;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(font);
	}
});