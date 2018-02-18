const fs = require('fs')
const express = require('express')
const app = express()
const server = require('http').Server(app) 
const bodyParser = require('body-parser')
const io = require('socket.io-client')

///////////////////////////
let socket = io('http://localhost:8080')
socket.on('message', (msg) => {
	console.log(msg)
})
///////////////////////////

const EventEmitter = require('events').EventEmitter;
var imgChange = new EventEmitter()

const path = require('path')
let folder = '/media/gibbon/Data/developpement/nodejs/stream/tmp'
let file = 'image.jpg'
let pathToImg = path.join(folder, file)


const chokidar = require('chokidar')
var watcher = chokidar.watch(folder, {
	persistent: true
})

watcher.on('change', (filePath, stats) => {
	let filename = path.basename(filePath)
	if(file === filename) {
		fs.readFile(filePath, (err, data) => {
			setTimeout(() => {
				socket.emit('image', data)
				console.log('Image send')
			}, 250);
		})
	}
})
