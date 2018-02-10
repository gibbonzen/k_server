var streamStatus = false

$(function($){

	onClickStream()
	toggleStreamClass()

	/////

	function onClickStream() {
		$('.stream').on('click', function() {
			initDisplayStream()
		})
	}

	function initDisplayStream() {
		let data = { 'action': streamStatus ? 'stop' : 'start'}
		$.ajax({
			type: 'POST',
			url: './stream',
			data: data,
			dataType: 'json',
			success: function(data) {
				startStreaming()
			}
		})

	}

	function toggleStreamClass() {
		let streamButton = $('.stream');
		streamButton.on('click', function() {
			let actionClass = $('.action')
			let stopClass = $('.action.OnStop')
			let startClass = $('.action.OnStart')
			
			if(stopClass.length > 0) {
				actionClass.removeClass('OnStop')
				actionClass.addClass('OnStart')
				streamStatus = true
			}
			else {
				actionClass.addClass('OnStop')
				actionClass.removeClass('OnStart')
				streamStatus = false
			}
		})
	}

	function startStreaming() {
		console.log('start streaming')
	}
})