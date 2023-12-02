const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let users = {};

app.use(express.static(path.join(__dirname + "/public")));

io.on("connection", function(socket){

    socket.on("newuser", function(username){
        users[socket.id] = username;
        socket.emit("updateUsersList", Object.values(users));
        socket.broadcast.emit("update", username + " a rejoint la conversation");
        io.emit("updateUsersList", Object.values(users));
    });

    socket.on("exituser", function(username){
        delete users[socket.id];
        socket.broadcast.emit("update", username + " a quitté la conversation");
        io.emit("updateUsersList", Object.values(users));
    });

    socket.on("chat", function(message){
        socket.broadcast.emit("chat", message);
    });

    socket.on("private_chat", function(data){
       
        socket.to(data.to).emit("private_chat", {
            from: socket.id,
            message: data.message
        });
    });

    socket.on("disconnect", function(){
        if(users[socket.id]){
            socket.broadcast.emit("update", users[socket.id] + " a quitté la conversation");
            delete users[socket.id];
            io.emit("updateUsersList", Object.values(users));
        }
    });
});

server.listen(5000, () => {
    console.log('Serveur démarré sur le port 5000');
});
