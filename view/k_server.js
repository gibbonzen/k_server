const express = require('express')
const app = express()
const server = require('http').Server(app) 
const bodyParser = require('body-parser')

// Utils
const path = require('path')
const EventEmitter = require('events')
const request = require('request')

app.use(bodyParser.json())

app.use('/lib', express.static('lib'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/base.htm'))
})

app.listen(8888, 'localhost', () => console.log('K_Server started'))

// STEAMING MANAGER
const io = require('socket.io-client')
const imageListener = new EventEmitter()

const BOUNDARY = "BOUNDARY"
app.get('/stream', (req, res) => {

	let headersStream = {
		'Cache-Control': 'no-cache', 
		'Cache-Control': 'private', 
		'Pragma': 'no-cache', 
		'Content-Type': `multipart/x-mixed-replace; boundary="${BOUNDARY}"`
	}

	let headersImage = { 
		'Content-Type': 'image/jpeg'
	}

	function requeteKShadowCameraStatus(callback) {
		let options = {
			uri: 'http://localhost:3000/camera',
			method: 'GET',
			headers: {'Content-Type': 'application/json'}
		}
		request(options, (err, res) => {
			doStream(res.body)
		})
	}

	function startStreaming() {
		res.writeHead(200, headersStream)

		imageListener.on('newImage', (image) => {
			res.write(`--${BOUNDARY}\r\n`)
			res.write("Content-Type: image/jpeg\r\n")
			res.write("Content-Length: " + image.length + "\r\n")
			res.write("\r\n")
			res.write(Buffer(image),'binary')
			res.write("\r\n")
		})
	}

	function stopStreaming() {
		imageListener.removeAllListeners()
		res.writeHead(200, headersImage)
		res.end('image.jpg')
	}

	function doStream(camera) {
		console.log(camera)

		if(camera.status === 1) {
			startStreaming()
		}
		else {
			stopStreaming()
		}
	}

	streamSocketConnection()

	requeteKShadowCameraStatus(doStream)

})

function streamSocketConnection() {
	let socket = io('http://localhost:3000')

	socket.on('newImage', (image) => {
		imageListener.emit('newImage', image)
	})

	socket.on('close', () => {
		socket.close()
	})
}
