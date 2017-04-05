var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//users = [];
users = {};
connections = [];

app.set('port', process.env.PORT || 3000);

console.log('Server is running.....');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    //console.log(socket);
    //New User event
    socket.on('new user', function (data, callback) {
        if (data in users) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            users[socket.username] = socket.id;
            console.log(socket.username + ' has connected with a socket ID: ' + socket.id);
            //users.push(socket.username);
            updateUsernames();
        }
    });
    //console.log(socket.id);
    console.log('Connected: %s user(s) currently connected.', connections.length);

    //Disconnection event
    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        connections.splice(connections.indexOf(socket), 1);
        //users.splice(users.indexOf(socket.username), 1);
        delete users[socket.username];
        console.log(socket.username+ ' (socket ID: ' +socket.id+  ') has disconnected. ' +connections.length+ ' user(s) currently connected.')
        updateUsernames();
    });

    //Send Message event
    socket.on('send message', function (data) {
        console.log(data);
        io.sockets.emit('new message', {msg:data, user:socket.username})
    });

    //Send Private Message event
    //io.to(socket.id).emit("event", data);
    //socket.to(to).emit('private message', {userName: socket.username, message: msg} 
    socket.on('send private message', function (data) {
        console.log('incoming data = ' + data); // [object Object]
        console.log('data.user = ' + data.user); // Brian
        console.log('data.msg = ' + data.msg) // Hi
        //socket.username = data;
        //users[socket.username] = socket;
        console.log(users[data.user]);
        io.to(users[data.user]).emit('new private message', { msg: data.msg, user: socket.username })
        //io.sockets.emit('new private message', { msg: data, user: socket.username })
    });

    
    function updateUsernames() {
        //console.log(users);
        io.sockets.emit('get users', Object.keys(users));
        //io.sockets.emit('get users',{user:socket.username, id:socket.id})
        //console.log(users);
        //Object.keys(io.sockets.sockets).forEach(function (id) {
         //   console.log("ID:", id)  // socketId
        //})
    }

});

server.listen(app.get('port'), function () {
    console.log('Express server listening on port: ' + app.get('port') + '.');
});