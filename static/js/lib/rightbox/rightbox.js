define(function(require, exports) {
	var teml = '<div class="div_h2"><span class="ico"><img src="images/skin/bell.png" width="20" height="20" id="waring_bell_ico"/></span><span class="title" style="line-height:25px;">告警消息</span>';
	teml += '<a id="btn_min" href="javascript:void(0);" class="ui_max"><b class="ui_max_b" id="btn_min_b"></b></a>';
    teml += '<a id="btn_close" href="javascript:;" class="close ui_close">×</a></div>';
    teml += '<div id="rightbox_content_wrap" class="content"><div class="wrap_div" id="rightbox_content"></div></div>';
    
    	
	var msecs = 500; //改变时间得到不同的闪烁间隔
	var bflag = false;
	var _bellTime = null;
    
	function _boxAddEvent(oEle, sEventName, fnHandler)
	{
		if(oEle.attachEvent)
		{
			oEle.attachEvent('on'+sEventName, fnHandler);
		}
		else
		{
			oEle.addEventListener(sEventName, fnHandler, false);
		}
	}

	function init()
	{
		var container = document.createElement('div');
		container.id = 'box_float_layer';
		container.className = 'float_layer';
		container.innerHTML = teml;
		document.body.appendChild(container);
		
		var oDiv=document.getElementById('box_float_layer');
		var oBtnMin=document.getElementById('btn_min');
		var oBtnClose=document.getElementById('btn_close');
		var oDivContent=document.getElementById('rightbox_content_wrap');
		var oBtnMin_b = document.getElementById('btn_min_b');
		var iMaxHeight= 150;
		
		var isIE6=window.navigator.userAgent.match(/MSIE 6/ig) && !window.navigator.userAgent.match(/MSIE 7|8/ig);
		oDiv.style.display='block';
		
		if(isIE6)
		{
			oDiv.style.position='absolute';
			_repositionAbsolute();
			_boxAddEvent(window, 'scroll', _repositionAbsolute);
			_boxAddEvent(window, 'resize', _repositionAbsolute);
		}
		else
		{
			oDiv.style.position='fixed';
			_repositionFixed();
			_boxAddEvent(window, 'resize', _repositionFixed);
		}
		
		oBtnMin.timer=null;
		oBtnMin.isMax=false;
		oBtnMin.onclick=function ()
		{
			if(!this.isMax){
				_clear_blink();
			}
			startMove
			(
				oDivContent, (this.isMax=!this.isMax)?iMaxHeight:0,
				function ()
				{
					oBtnMin.className=oBtnMin.className=='ui_max'?'ui_min':'ui_max';
					oBtnMin_b.className=oBtnMin_b.className=='ui_max_b'?'ui_min_b':'ui_max_b';
				}
			);
		};
		
		oBtnClose.onclick=function ()
		{
			startMove
			(
				oDivContent, 0,
				function ()
				{
					oDiv.style.display='none';
					furnace.notice = null;
				}
			);
		};
	};

	function startMove(obj, iTarget, fnCallBackEnd)
	{
		if(obj.timer)
		{
			clearInterval(obj.timer);
		}
		obj.timer=setInterval
		(
			function ()
			{
				doMove(obj, iTarget, fnCallBackEnd);
			},30
		);
	}

	function doMove(obj, iTarget, fnCallBackEnd)
	{
		var iSpeed=(iTarget-obj.offsetHeight)/8;
		
		if(obj.offsetHeight==iTarget)
		{
			clearInterval(obj.timer);
			obj.timer=null;
			if(fnCallBackEnd)
			{
				fnCallBackEnd();
			}
		}
		else
		{
			iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
			obj.style.height=obj.offsetHeight+iSpeed+'px';
			
			((window.navigator.userAgent.match(/MSIE 6/ig) && window.navigator.userAgent.match(/MSIE 6/ig).length==2)?_repositionAbsolute:_repositionFixed)()
		}
	}

	function _repositionAbsolute()
	{
		var oDiv=document.getElementById('box_float_layer');
		var left=document.body.scrollLeft||document.documentElement.scrollLeft;
		var top=document.body.scrollTop||document.documentElement.scrollTop;
		var width=document.documentElement.clientWidth;
		var height=document.documentElement.clientHeight;
		
		oDiv.style.left=left+width-oDiv.offsetWidth+'px';
		oDiv.style.top=top+height-oDiv.offsetHeight+'px';
	}

	function _repositionFixed()
	{
		var oDiv=document.getElementById('box_float_layer');
		var width=document.documentElement.clientWidth;
		var height=document.documentElement.clientHeight;
		
		oDiv.style.left=width-oDiv.offsetWidth+'px';
		oDiv.style.top=height-oDiv.offsetHeight+'px';
	}
	
	function getStatus(){
		var flag = -1;
		var oDiv=document.getElementById('box_float_layer');
		var oDivContent=document.getElementById('rightbox_content_wrap');
		
		if(oDiv.style.display == 'none'){
			flag = 0;
		}else{
			if(oDivContent.offsetHeight == 0){
				flag = 1;
			}else{
				flag = 2;
			}
		}
		
		return flag;
	}


	function content(data){
		var cDiv=document.getElementById('rightbox_content');
		cDiv.innerHTML = data;
	}
	
	function _waring_blink(){
		if(bflag){
			$('#waring_bell_ico').show();
			bflag = false;
		}else{
			$('#waring_bell_ico').hide();
			bflag = true;
		}
		_bellTime = setTimeout("_waring_blink()", msecs); 
	}
	
	function _clear_blink(){
		if(_bellTime){
			clearTimeout(_bellTime);
		}
		bflag = false;
		$('#waring_bell_ico').show();
	}
	
	window._waring_blink = _waring_blink;
	
	function openBox(){
		
		var oDiv=document.getElementById('box_float_layer');
		var oDivContent=document.getElementById('rightbox_content_wrap');
		var oBtnMin=document.getElementById('btn_min');
		var oBtnMin_b = document.getElementById('btn_min_b');
		oDiv.style.display='block';
		var iMaxHeight= 150;
		oBtnMin.isMax=true;
		startMove
		(
			oDivContent, iMaxHeight,
			function ()
			{
				oBtnMin.className=oBtnMin.className=='ui_max'?'ui_min':'ui_max';
				oBtnMin_b.className=oBtnMin_b.className=='ui_max_b'?'ui_min_b':'ui_max_b';
			}
		);
	}
	
	exports.init = init;
	exports.getStatus = getStatus;
	exports.openBox = openBox;
	exports.content = content;
	exports._waring_blink = _waring_blink;
});