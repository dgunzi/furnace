define(function(require, exports, module) {
//	require('../getOSBro/getOSAndBrowse');
	require('./jquery.nicescroll');
	var nicescroll = {};
	
	nicescroll.scroll = function(_box,config){
		var $p = $(_box || 'body');
		$p.niceScroll(config);
//		var osAndBrowse =  $.getOSAndBrowser().split('/');
	//	alert(osAndBrowse)
	//	if(osAndBrowse[1]=='IE8.0'||osAndBrowse[1].indexOf('Chrome')!= -1)
	//	{	
			$('body').on('mouseover.refreshScroll',function(){
	    		$p.getNiceScroll().resize();
	      	});
	//	}
	};
	//谷歌浏览器的兼容，避免用window.onload可能产生的多次调用
	$(function(){
		if(window.navigator.userAgent.indexOf("Chrome") >= 0)
		{
			window.addEventListener('load',dialogScroll,false);
		}
		else
		{
			dialogScroll();
		}
	});
		
	function dialogScroll()
	{
		if($('.listScroll').length>0)
		{
			nicescroll.scroll('.listScroll',{touchbehavior:false,cursorcolor:"#000",cursoropacitymax:0.7,cursorwidth:9,cursorborder:"1px solid #FFAF60",cursorborderradius:"3px",autohidemode:false});
		}
		if($('.columns').length>0)
		{
			nicescroll.scroll('.columns',{touchbehavior:false,cursorcolor:"#000",cursoropacitymax:0.7,cursorwidth:9,cursorborder:"1px solid #FFAF60",cursorborderradius:"3px",autohidemode:false});
		}
	}
	
	nicescroll.scrollperResize = function(_box){
		var $p = $(_box || 'body');
		$p.getNiceScroll().resize();
	};
	module.exports = nicescroll;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(nicescroll);
	}
});