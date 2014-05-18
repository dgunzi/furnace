;(function()
{
//	var hasProgressBar = [];
	var progressBarNum = {};
	var opt = {
		perNum:0,
		animateTime:100,
		callFun:null
	}
	$.fn.extend({
		'progressBarTo':function(value){
			var cfg = $.extend({},opt,value);
			var perNum = cfg.perNum.toFixed(0);
			perNum = perNum>100?100:perNum;
			var animateTime = cfg.animateTime;
			var callBack = cfg.callFun;
			var thisid = $(this).attr('id');
		//	console.log(callBack)
			var proWrap = '<div class="pg"><div class="pb"><div class="light"></div></div><div class="valueTip"></div></div>';
			var thisId = $(this).attr('id');
			//if($.inArray(thisId,hasProgressBar)==-1)
			if(typeof progressBarNum[thisid] == 'undefined')
			{
				$(this).append(proWrap);
			//	hasProgressBar.push(thisId);
				progressBarNum[thisid] = 0;
			}
			progressBarNum[thisid] = perNum;
			$('.pb',this).stop(false,true).animate({width:perNum+'%'},animateTime,function(){
				if(perNum==100)
				{
					if(callBack!=null)
					{
						callBack();
					}
					$('.light',this).hide();
				}
				else
				{
					$('.light',this).show();
				}
			});
			$('.valueTip',this).stop(false,true).animate({left:perNum+'%'},animateTime,function(){
				$(this).text(perNum+'%');
			});
		},
		'getProgressNum':function(){
			var thisid = $(this).attr('id');
			return progressBarNum[thisid]-0;
		}
	});
})(jQuery);