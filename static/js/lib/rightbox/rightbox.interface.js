define(function(require, exports, module) {

	require('./rightbox');
	
	var box = {};
	
	box.warningBox = function(data){
		if(!furnace.notice){
			furnace.notice = rightbox;
			furnace.notice.init();
			furnace.notice.content(data);
			furnace.notice._waring_blink();
		}else{
			if(furnace.notice.getStatus() == 0){
				furnace.notice.content(data);
				furnace.notice._waring_blink();
			}else if(furnace.notice.getStatus() == 1){
				furnace.notice.content(data);
				furnace.notice._waring_blink();
			}else{
				furnace.notice.content(data);
			}
		}
	};
	
	module.exports = box;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(box); 
	}
	
});