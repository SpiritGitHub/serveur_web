const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Utiliser pour garder une trace des utilisateurs connectés
let users = {};

app.use(express.static(path.join(__dirname + "/public")));

io.on("connection", function(socket){

    socket.on("newuser", function(username){
        // Ajouter l'utilisateur à l'objet 'users'
        users[socket.id] = username;
        // Informer le nouvel utilisateur de tous les autres utilisateurs connectés
        socket.emit("updateUsersList", Object.values(users));
        // Informer tous les utilisateurs de la connexion d'un nouvel utilisateur
        socket.broadcast.emit("update", username + " a rejoint la conversation");
        // Mettre à jour la liste des utilisateurs pour tout le monde
        io.emit("updateUsersList", Object.values(users));
    });

    socket.on("exituser", function(username){
        // Supprimer l'utilisateur de l'objet 'users'
        delete users[socket.id];
        // Informer tous les utilisateurs de la déconnexion de l'utilisateur
        socket.broadcast.emit("update", username + " a quitté la conversation");
        // Mettre à jour la liste des utilisateurs pour tout le monde
        io.emit("updateUsersList", Object.values(users));
    });

    socket.on("chat", function(message){
        // Diffuser le message à tous les autres utilisateurs
        socket.broadcast.emit("chat", message);
    });

    // Gérer les messages privés
    socket.on("private_chat", function(data){
        // Envoi d'un message privé à un utilisateur spécifique
        socket.to(data.to).emit("private_chat", {
            from: socket.id,
            message: data.message
        });
    });

    // Gérer la déconnexion de l'utilisateur
    socket.on("disconnect", function(){
        if(users[socket.id]){
            // Informer tous les utilisateurs de la déconnexion
            socket.broadcast.emit("update", users[socket.id] + " a quitté la conversation");
            // Supprimer l'utilisateur de l'objet 'users'
            delete users[socket.id];
            // Mettre à jour la liste des utilisateurs pour tout le monde
            io.emit("updateUsersList", Object.values(users));
        }
    });
});

server.listen(5000, () => {
    console.log('Serveur démarré sur le port 5000');
});
