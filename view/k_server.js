const express = require('express')
const app = express()
const server = require('http').Server(app) 
const bodyParser = require('body-parser')

// Utils
const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')
const request = require('request')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

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
app.post('/stream', (req, res) => {
	let options = {
		uri: 'http://localhost:3000/camera/stream',
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		json: true,
		body: req.body
	}
	request(options, (err, res) => {
		if(!err) ok(res)
		else ko()
	})

	function ok(data) {
		res.end()
	}

	function ko() {
		res.end()
	}
})

app.get('/stream', (req, res) => {
	let headersStream = {
		'Cache-Control': 'no-cache', 
		'Cache-Control': 'private', 
		'Pragma': 'no-cache', 
		'Content-Type': `multipart/x-mixed-replace; boundary="${BOUNDARY}"`
	}

	function requeteKShadowCameraStatus(callback) {
		let options = {
			uri: 'http://localhost:3000/camera',
			method: 'GET',
			headers: {'Content-Type': 'application/json'}
		}
		request(options, (err, res) => {
			let body = undefined
			if(!err) body = res.body
			doStream(JSON.parse(body))
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
		let image = fs.readFileSync('thumb.jpg')

		res.writeHead(200, {
			'Content-Type': 'image/jpeg',
			'Content-Length': image.length
		})
		res.write(image)
		res.end()
	}

	function doStream(camera) {
		if(camera !== undefined && camera.status === 1) {
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
	const socket = io('http://localhost:3000/stream')
	socket.on('newImage', (image) => {
		imageListener.emit('newImage', image)
	})

	socket.on('close', () => {
		socket.close()
	})

}
