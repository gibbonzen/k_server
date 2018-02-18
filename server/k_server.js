const express = require('express')
const app = express()
const server = require('http').Server(app) 
const io = require('socket.io')(server)

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')({ 
	secret: 'secret', 
	resave: true,
	saveUninitialized: true
})
const socketSession = require('express-socket.io-session')

const path = require('path')
const fs = require('fs')
const Tools = require('./lib/Tools')
const LOG = require('./lib/LOG')
const request = require('request')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cookieParser());
app.use(session)

let config = Tools.loadJsonFile('config.json')
server.listen(config.port, config.host, () => 
	console.log(`K_Server started on ${config.port}`))

let viewDirectory = path.resolve(path.join(__dirname, '../view'))
app.use('/lib', express.static(path.join(viewDirectory, 'lib')))
app.use('/css', express.static(path.join(viewDirectory, 'css')))
app.use('/js', express.static(path.join(viewDirectory, 'js')))
app.use('/img', express.static(path.join(viewDirectory, 'img')))


// SERVER
app.get('/', (req, res) => {
	res.sendFile(path.resolve(path.join(viewDirectory, 'base.htm')))
})
.get('/stream', (req, res) => {
	let thumb = path.join(viewDirectory, 'img/thumb.jpg')
	let reader = fs.createReadStream(thumb)
	reader.pipe(res)
})

// ASK SHADOW 
function getCamera(socket) {
	let opts = {
		url: `http://${config.k_shadow.host}:${config.k_shadow.port}/camera`,
		method: 'GET', 
		headers : {
			'Accept': 'application/json',
        	'Accept-Charset': 'utf-8'}
	} 
	request(opts, (err, res, body) => {
		if(err) return
		socket.emit('camera', body)
	})
}

// STREAM
const EventEmitter = require("events")
const streamListener = new EventEmitter()

// SOCKET 
io.use(socketSession(session))

let clients = {}
let k_shadow_socket = null

io.on('connection', (socket) => {
	console.log('New connection')

	socket.on('connection_client', data => {
		console.log(data)
		clients[data.type] = {
			name: data.name,
			socketID: socket.id
		}
		if(data.name === "k_shadow") {
			k_shadow_socket = socket
			LOG.server("K_Shadow socket identified")
		}
	})

	socket.on('message', msg => {
		console.log(msg)
	})

	socket.on('stream_command', cmd => {
		k_shadow_socket.emit('stream_command', cmd)
		if(cmd === 'stop') {
			closeStream()
		}
		else {
			initStream()
		}
	})

	// Camera start
	socket.on('start', () => {
		LOG.server('Camera is launching.')
	})

	// Camera send image
	socket.on('image', (image) => {
		streamListener.emit('image', image)
	})

	// Camera stop
	socket.on('close', () => {
		LOG.server('Camera is stopping.')
	})
})


const consumeDataStream = (data) => {
	io.emit('image', { image: true, buffer: data.toString('base64') })
}

function initStream() {
	streamListener.on('image', consumeDataStream)
	streamListener.emit('message', "Stream starting")
}

function closeStream() {
	streamListener.removeListener('image', consumeDataStream)
	streamListener.emit('message', "Stream stopping")
}

function retrieveDevice() {

}