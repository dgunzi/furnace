define(function(require, exports, module) {

	require('./js/jquery.progressBar');
	
	var pgb = {};
	pgb.progressBar = function(_box,config)
	{
		var $p = $(_box || document);
		$p.progressBarTo(config);
	}
	pgb.getProgressNum = function(_box)
	{
		var $p = $(_box || document);
		return $p.getProgressNum();
	}
	module.exports = pgb;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(pgb);
	}
});