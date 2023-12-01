document.addEventListener('DOMContentLoaded', function () {
    const app = document.querySelector("#app");
    const socket = io(); // Assurez-vous que le serveur Socket.io est correctement configuré et accessible

    let uname; // Variable pour stocker le nom d'utilisateur actuel

    // Gestion de l'événement 'click' pour rejoindre le chat
    // Gestion de l'événement 'click' pour rejoindre le chat
    app.querySelector("#join-user").addEventListener("click", function(){
        let username = app.querySelector("#username").value;
        if (username.length === 0) {
            alert("Veuillez entrer un nom d'utilisateur.");
            return;
        }
        uname = username;
        socket.emit("newuser", username); // Envoyer le nouveau nom d'utilisateur au serveur
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-group").classList.add("active"); // Modifier ici pour cibler .chat-group
        app.querySelector(".connected-users").classList.add("active");
    });


    // Gestion de l'événement 'click' pour envoyer un message
    app.querySelector("#send-message").addEventListener("click", function(){
        let message = app.querySelector("#message-input").value; 
        if (message.length === 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", { // Envoyer le message au serveur pour diffusion
            username: uname,
            text: message
        });
        app.querySelector("#message-input").value = ""; // Vider le champ de saisie
    });

    // Gestion de l'événement 'click' pour quitter le chat
    app.querySelector("#exit-chat").addEventListener("click",function(){
        socket.emit("exituser", uname); // Avertir le serveur que l'utilisateur quitte
        window.location.reload(); // Recharger la page ou rediriger l'utilisateur comme vous préférez
    });

    // Réception des mises à jour du serveur
    socket.on("update", function(update){
        renderMessage("update", update);
    });

    socket.on("chat", function(message){
        renderMessage("other", message);
    });

    // Fonction pour afficher les messages sur l'écran
    function renderMessage(type, message){
        let messageContainer = app.querySelector(".messages");
        let el = document.createElement("div");
        el.classList.add("message", type === "my" ? "my-message" : "other-message");
        el.innerHTML = `
            <div class="username">${type === "my" ? 'You' : message.username}</div>
            <div class="text">${message.text}</div>
        `;
        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Faire défiler vers le nouveau message
    }

    // Fonction pour mettre à jour la liste des utilisateurs connectés
    socket.on("updateUsersList", function(users){
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Vider la liste existante

        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = user;
            listItem.addEventListener('click', () => startPrivateChat(user));
            userList.appendChild(listItem);
        });
    });

    // Fonction pour démarrer un chat privé
    function startPrivateChat(username) {
        console.log('Démarrer une discussion privée avec', username);
        // Ici, vous pourriez changer d'interface pour le chat privé ou gérer autrement
        // Assurez-vous que le serveur sait qu'il s'agit d'un message privé
    }
});
