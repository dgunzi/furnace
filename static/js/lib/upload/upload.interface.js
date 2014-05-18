define(function(require, exports, module) {

	require('./jquery.uploadify-3.1.min.js');
	
	var upload = {};
	upload.upload = function(_box,config){
		var $p = $(_box);
		return $p.uploadify(config);
	};
	
	module.exports = upload;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(upload);
	}
});