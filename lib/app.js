var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io',{ rememberTransport: false, transports: ['WebSocket'] })(server);

server.listen(4040);

app.use(express.static('app'))

app.get('/', function (req, res) {
    res.sendfile('app/index.html')
})


require("babel/register")
var Timeline = require('./timeline')
// var timeline = new Timeline()


io.on('connection', function (socket) {

    var timeline = null

    socket.on('run', function(options) {

        if (timeline){
            timeline.stop()
        }
        
        timeline = new Timeline(options)
        timeline.onData(function(data){
            socket.emit('news', data)
        })
        timeline.start()
    })
})

//
// io.on('connection', function (socket) {
//
//
//     socket.emit('news', { hello: 'world' });
//     socket.on('my other event', function (data) {
//         console.log(data);
//     })
// })
