var path = require("path");
var http = require("http");
var express = require("express");
var socketio = require("socket.io");
var Filter = require("bad-words");
var { generateMessage, generateLocationMessage } = require("./utils/messages");

var { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

var app = express();
var server = http.createServer(app);
var io = socketio(server); // now server act as web socket

var port = process.env.PORT || 3000;
var publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", function(socket) {
    console.log("New webSocket  Connection");

    socket.on("join", function(options, callback) {
        var { error, user } = addUser({
            id: socket.id,
            ...options
        });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessage("Admin", " welcome !"));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin " + user.username + " has joined !"));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on("sendMessage", function(message, callback) {
        var user = getUser(socket.id);
        var filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed");
        }
        io.to(user.room).emit("message", generateMessage(user.username, message));
        callback();
    });

    socket.on("sendLocation", function(coords, callback) {
        var user = getUser(socket.id);
        io.to(user.room).emit("sendLocationMessage", generateLocationMessage(user.username, "http://google.com/maps?q=" + coords.latitude + "," + coords.longitude));
        callback();
    });

    socket.on("disconnect", function() {
        var user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin " + user.username + " has left"));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});




server.listen(port, function() {
    console.log("Server  is listening at the port number 3000");
});