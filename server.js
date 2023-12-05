const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('login', (username) => {
        users[socket.id] = username;
        updateAllUserLists();
        socket.broadcast.emit('userConnected', username);
    });

    socket.on('sendMessage', (data) => {
        const messageData = { message: data.message, sender: users[socket.id] };
    
        socket.broadcast.emit('message', messageData);
    
        if (data.recipient !== 'all') {
            sendPrivateMessage(socket, data);
        }
    });

    socket.on('logout', () => {
        const disconnectedUsername = users[socket.id];
        delete users[socket.id];
        updateAllUserLists();
        if (disconnectedUsername) {
            socket.broadcast.emit('userDisconnected', disconnectedUsername);
        }
    });

    socket.on('disconnect', () => {
        const disconnectedUsername = users[socket.id];
        delete users[socket.id];
        updateAllUserLists();
        if (disconnectedUsername) {
            socket.broadcast.emit('userDisconnected', disconnectedUsername);
        }
    });
});

function updateAllUserLists() {
    io.emit('updateUserList', Object.values(users));
}

function sendPrivateMessage(socket, data) {
    const recipientSocketId = Object.keys(users).find(key => users[key] === data.recipient);
    if (recipientSocketId) {
        const messageData = { message: data.message, sender: users[socket.id] };
        socket.to(recipientSocketId).emit('message', messageData);
        // Confirmer à l'expéditeur
        socket.emit('message', { ...messageData, fromSelf: true });
    }
}

server.listen(5001, () => {
    console.log('Server running on port 5001');
});
