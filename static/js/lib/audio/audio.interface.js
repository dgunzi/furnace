define(function(require, exports, module) {

	var blocksit = require('./audio.min');
	
	var alarmAudio = null;
	var audio = {};
	
	audio.playWarning = function(level,flag){
		
		var files = ['error','alarm'];
		var srcStr = furnace.getRootPath()+'/js/lib/audio/'+files[level-1]+'.mp3';
		var a = true;
		if(flag) a = false;
		if($('div.audiojs').length === 0){
			$("body").append('<audio src="'+srcStr+'" preload="auto" autoplay="true"></audio>');
			audiojs.events.ready(function() { 
				alarmAudio = audiojs.createAll();
				if(a){
					$('div.audiojs').hide();
				}else{
					$('div.audiojs').show();
				}
		    });
		}else{
			var audio = alarmAudio[0]; 
			audio.load(srcStr);
          	audio.play();
		}
		
	};
	
	module.exports = audio;
 	
 	if(typeof(furnace) !== 'undefined'){
 		furnace.clone(audio);
 	}
 	
});