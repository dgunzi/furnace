;(function($){
	$.extend({
		"getOSAndBrowser":function()
		{		
			var os = navigator.platform;		
			var userAgent = navigator.userAgent;		
			var info  = "";		
			var tempArray  = "";		
			if(os.indexOf("Win") > -1)
			{			
				if(userAgent.indexOf("Windows NT 5.0") > -1)
				{				
					info += "Win2000";			
				}
				else if(userAgent.indexOf("Windows NT 5.1") > -1)
				{				
					info += "WinXP";			
				}
				else if(userAgent.indexOf("Windows NT 5.2") > -1)
				{				
					info += "Win2003";			
				}
				else if(userAgent.indexOf("Windows NT 6.0") > -1)
				{				
					info += "WindowsVista";			
				}
				else if(userAgent.indexOf("Windows NT 6.1") > -1 || userAgent.indexOf("Windows 7") > -1)
				{				
					info += "Win7";			
				}
				else if(userAgent.indexOf("Windows 8") > -1)
				{				
					info += "Win8";			
				}
				else
				{				
					info += "Other";			
				}		
			}
			else if(os.indexOf("Mac") > -1)
			{			
				info += "Mac";		
			}
			else if(os.indexOf("X11") > -1)
			{			
				info += "Unix";		
			}
			else if(os.indexOf("Linux") > -1)
			{			
				info += "Linux";		
			}
			else
			{			
				info += "Other";		
			}		
			info += "/";		
			if(/[Ff]irefox(\/\d+\.\d+)/.test(userAgent))
			{			
				tempArray = /([Ff]irefox)\/(\d+\.\d+)/.exec(userAgent);			
				info += tempArray[1] + tempArray[2];		
			}
			else if(/MSIE \d+\.\d+/.test(userAgent))
			{			
				tempArray = /MS(IE) (\d+\.\d+)/.exec(userAgent);			
				info += tempArray[1] + tempArray[2];		
			}
			else if(/[Cc]hrome\/\d+/.test(userAgent))
			{			
				tempArray = /([Cc]hrome)\/(\d+)/.exec(userAgent);			
				info += tempArray[1] + tempArray[2];		
			}
			else if(/[Vv]ersion\/\d+\.\d+\.\d+(\.\d)* *[Ss]afari/.test(userAgent))
			{			
				tempArray = /[Vv]ersion\/(\d+\.\d+\.\d+)(\.\d)* *([Ss]afari)/.exec(userAgent);			
				info +=  tempArray[3] + tempArray[1];		
			}
			else if(/[Oo]pera.+[Vv]ersion\/\d+\.\d+/.test(userAgent))
			{			
				tempArray = /([Oo]pera).+[Vv]ersion\/(\d+)\.\d+/.exec(userAgent);			
				info +=  tempArray[1] + tempArray[2];		
			}
			else
			{			
				info += "unknown";		
			}		
			return info;	
		}
	});
})(jQuery);
