$(function($){
	var streamStatus = false
	var streamClient = false

	// Add mouse listener on stream thumb
	onClickStream()

	//////////////
	//  SOCKET  //
	//////////////
	const socket = io.connect()
	socket.on('message', msg => {
		console.log(msg)
	})

	socket.on('camera', (data) => {
		let camera = JSON.parse(data)
		streamStatus = camera.status === 1 ? true : false
	})

	//////////////
	// FUNCTION //
	//////////////
	const consumeDataStream = function(data) {
		console.log("call")
		if(data.image) {
			let img = new Image()
			img.src = `data:image/jpeg;base64,${data.buffer}`
			$('.stream > img').attr('src', img.src)
		}
	}

	function onClickStream() {
		let streamImg = $('.stream')
		streamImg.on('click', function() {
			toggleStream()
		})

	}

	function toggleStream() {
		let action;
		if(streamClient) {
			socket.removeListener('image', consumeDataStream)
			streamClient = false
			action = 'stop'
		}
		else {
			socket.on('image', consumeDataStream)
			streamClient = true
			action = 'start'
		}

		socket.emit('stream_command', action)
		toggleStreamClass()
	}

	function toggleStreamClass() {
		let actionClass = $('.action')
		let stopClass = $('.action.OnStop')
		let startClass = $('.action.OnStart')

		if(streamClient) {
			actionClass.removeClass('OnStop')
			actionClass.addClass('OnStart')
		}
		else {
			actionClass.removeClass('OnStart')
			actionClass.addClass('OnStop')
			$('.stream img').attr('src', '/stream')
		}
	}

})