;(function($){
	var onDragStatus = false;
 	var currTh = null;
 	function resizeTd(event,minWidth){
 		 if (onDragStatus) 
		 {
            onDragStatus = false;
            $(window).unbind('resize.table');
            var everyThWidthArr = resizeTdWidth(event,minWidth);
			$(window).bind('resize.table',function(){
				var curTb = $(currTh).parents('table');
			//	var tBWidth = curTb.width();
				var tBWidth = eval(everyThWidthArr.join('+'));
				var curTbid = curTb.attr('id');
				if(curTbid.split('_')[1]=='corresponding')
				{
					var flag = true;
				}
			//	console.log(everyThWidthArr+'----------'+tBWidth);
			//	console.log(everyThWidthArr)
				$(currTh).parents('tr').find('th').each(function(index){
					var perWidth = (everyThWidthArr[index]/tBWidth*100).toFixed(10)-0+'%';
					$(this).attr('width','').width(perWidth);
					if(flag)
					{
				//		alert(1)
						var corTb = $('#'+curTbid.split('_')[0]);
						$('thead tr th',corTb).eq(index).attr('width','').width(perWidth);
					}
				});
			});
         }
 	}
 	function showColResize(event,minWidth)
 	{
 		if (onDragStatus) 
 		{
 			resizeTdWidth(event,minWidth);
 		}
 	}
	function resizeTdWidth(event,minWidth)
	{
		var pos = currTh.offset();
		var thisThWidth = currTh.width();
		var currThWidth = parseInt( event.clientX - pos.left );
		
		var thisIndex = currTh.index();
		var nextTh = currTh.next();
		while(nextTh.is(':hidden'))
		{
		//	alert(1)
			nextTh = nextTh.next();
		}
		var nextThWidth = nextTh.width();
		var nextIndex = nextTh.index();
	//	alert(currTh.html())
	//	console.log(nextIndex)
		var twoTdWidth = thisThWidth + nextThWidth;
		
		var everyThWidthArr = $(currTh).parents('tr').children().map(function(){return $(this).width()}).get();
		var curNextWidth;
		
		if(currThWidth>thisThWidth)
		{
			curNextWidth = twoTdWidth-currThWidth;
			if(curNextWidth<minWidth)
			{
				curNextWidth = minWidth;
			}
			currThWidth = twoTdWidth - curNextWidth;
		}
		else
		{
			if(currThWidth < minWidth)
			{
				currThWidth = minWidth;
			}
			curNextWidth = twoTdWidth - currThWidth;
		}
		everyThWidthArr[thisIndex] = currThWidth;
		everyThWidthArr[nextIndex] = curNextWidth;
	//	console.log(everyThWidthArr)
	//	$(this).parents('tr').children().each(function(index){
	//		if(index!=thisIndex&&index!=thisIndex+1)
	//		{
	//			$(this).width(everyThWidthArr[index]);
	//		}
	//	});
		
		currTh.width(currThWidth);
		nextTh.width(curNextWidth);
		var curTbid = $(currTh).parents('table').attr('id');
		if(curTbid.split('_')[1]=='corresponding')
		{
			var corTb = $('#'+curTbid.split('_')[0]);
			$('thead tr th',corTb).eq(thisIndex).width(currThWidth) ;
			$('thead tr th',corTb).eq(nextIndex).width(curNextWidth) ;
		}
		return everyThWidthArr;
	}
	var _globalOptions = {
		minWidth:10,
		showDrag:true,
		noDrag:false
	};
	$.fn.extend({
		'dragTd':function(value)
		{
			if($('thead',this).length<1)
			{
				return false;
			}
			var thisOrHidden = $(this).is(":hidden");
			var $this = $(this);
			var $that =  $this;
			while($this.is(':hidden'))
			{
				$that = $this;
				$this = $this.parent();
			}
			if(thisOrHidden)
			{
				$that.show();
			}
			
			$(this).css('table-layout','auto');
			var everyWidth = $('tr:nth-child(1) th',this).map(function(){
				if($(this).is(':visible'))
				{
					if($(this).width()<60)
					{
						return 60;
					}
					else if($(this).width()>400)
					{
						return 400;
					}
					else
					{
						return $(this).width();
					}
				}
				else
				{
					return 0;
				}
			}).get();
		//	console.log(everyWidth);
			var thisTbWidth = eval(everyWidth.join('+'));
	//		console.log(thisTbWidth);
			
	//		console.log(everyWidth);
			
			$('tr:nth-child(1) th',this).each(function(index){
				var perWid = (everyWidth[index]/thisTbWidth*100).toFixed(10)-0+'%';
				$(this).width(perWid);
			});
			
		
			if(thisOrHidden)
			{
				$that.hide();
			}
			$(this).css('table-layout','fixed');
			$('th,td',this).css({'overflow':'hidden','text-overflow':'ellipsis','white-space':'nowrap'});
			
			var op = $.extend({},_globalOptions,value);
			
			if(op.noDrag)
			{
				return false;
			}
			
			op.minWidth<10?op.minWidth = 10:op.minWidth = op.minWidth;
			
			var minWidth = op.minWidth;
	//		$(window).bind("selectstart", function() { return !onDragStatus; });
			
			$("tr:nth-child(1) th",this).bind("mousemove", function(event) {
		         var th = $(this);
		         if (th.prevAll(':visible').length <1|| th.nextAll(':visible').length < 1) 
				 {
		      //       return false;
		         }
		         else
		         {
		        	 var left = th.offset().left;
			         if (event.clientX - left < 3 || (th.width() - (event.clientX - left)) < 3) 
					 {
			             th.css({ 'cursor': 'e-resize' });
			         }
			         else {
			             th.css({ 'cursor': 'default' });
			         }
		         }
		    }).bind("mousedown", function(event){
		         var th = $(this);
		         if (th.prevAll(':visible').length < 1|| th.nextAll(':visible').length < 1) 
				 {
		     //        return false;
		         }
		         else
		         {
		        	 var pos = th.offset();
			         if (event.clientX - pos.left < 3 || (th.width() - (event.clientX - pos.left)) < 3) 
					 {
			             onDragStatus = true;
			             if (event.clientX - pos.left < th.width() / 2) 
						 {
			                 currTh = th.prev();
			                 while(currTh.is(':hidden'))
			                 {
			                	 currTh = currTh.prev();
			                 }
			             }
			             else {
			                 currTh = th;
			             }
			         }
		         }
		         
		    }).bind("mousemove",function(event){
		    	if(onDragStatus)
		    	{
		    		$('body').attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);
		    	}
		    		
		    	if(op.showDrag)
		    	{
		    		showColResize(event,minWidth);
		    	}
			}).bind("mouseup", function(event){
				$('body').removeAttr('unselectable').css('user-select','auto').off('selectstart');
		        resizeTd(event,minWidth);
		        
		    });
			$(window).bind("mouseup", function(event) {
				
		      	resizeTd(event,minWidth);
		    });
			$(window).unbind('resize.table');
		 }
	});
})(jQuery);	