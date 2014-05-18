define(function(require, exports, module) {

  	require('./blocksit.min');
 	require('./style.css');
 	
 	var blocks = {};
  	blocks.blocksIt = function(_box,config){
		var $p = $(_box || document);
		$p.BlocksIt(config);
	};
 
 	module.exports = blocks;
 	
 	if(furnace){
 		furnace.clone(blocks);
 	}
 	
 }); 
  