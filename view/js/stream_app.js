$(function($){


	(function() {
		toggleStreamClass()
	})();

	/////

	function toggleStreamClass() {
		let streamButton = $('.stream');
		streamButton.on('click', function() {
			let actionClass = $('.action')
			let stopClass = $('.action.OnStop')
			let startClass = $('.action.OnStart')
			
			if(stopClass.length > 0) {
				actionClass.removeClass('OnStop')
				actionClass.addClass('OnStart')
			}
			else {
				actionClass.addClass('OnStop')
				actionClass.removeClass('OnStart')
			}
		})
	}

});