// Assurez-vous que Socket.IO est correctement inclus dans votre HTML avant ce script
let socket = io();
let currentUser;

// Page de connexion
document.getElementById('login-button').addEventListener('click', function() {
    currentUser = document.getElementById('username').value.trim();
    if (currentUser) {
        socket.emit('login', currentUser);
        toggleDisplay('login-page', false);
        toggleDisplay('user-selection-page', true);
    }
});

// Page de sélection de l'utilisateur
document.getElementById('continue-button').addEventListener('click', function() {
    toggleDisplay('user-selection-page', false);
    toggleDisplay('chat-page', true);
});

document.getElementById('send-button').addEventListener('click', function() {
    let messageInput = document.getElementById('message-input');
    let message = messageInput.value.trim();
    let recipient = document.getElementById('user-list').value;
    if (message) {
        socket.emit('sendMessage', {
            sender: currentUser,
            message: message,
            recipient: recipient
        });

        addMessage(currentUser, message, true); // The 'true' flag indicates this is the sender
        messageInput.value = '';
    }
});

socket.on('updateUserList', function(users) {
    let userList = document.getElementById('user-list');
    userList.innerHTML = '<option value="all">Everyone</option>';
    users.forEach(function(user) {
        if (user !== currentUser) {
            let option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userList.appendChild(option);
        }
    });
});

// Réception des messages
socket.on('message', function(data) {
    if (!data.fromSelf) {
        addMessage(data.sender, data.message, false);
    }
});

// Fonctions d'assistance
function toggleDisplay(elementId, show) {
    document.getElementById(elementId).style.display = show ? 'block' : 'none';
}

function addMessage(sender, text, isSent) {
    let chatBox = document.getElementById('chat-box');
    let newMessage = document.createElement('div');
    newMessage.classList.add('message', 'clearfix', 'noselect');
    newMessage.classList.add(isSent ? 'sent' : 'received');

    // Si le message est reçu, ajoutez le nom de l'expéditeur
    if (!isSent) {
        let senderSpan = document.createElement('div');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = sender; // Afficher le nom de l'expéditeur
        newMessage.appendChild(senderSpan);
    }

    let messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text; // Le texte du message
    newMessage.appendChild(messageText);

    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight; // Faites défiler vers le bas pour le nouveau message
}
document.getElementById('back-button').addEventListener('click', function() {
    toggleDisplay('chat-page', false);
    toggleDisplay('user-selection-page', true);
});

// Quitter la conversation
document.getElementById('quit-button').addEventListener('click', function() {
    socket.emit('logout', currentUser);
    currentUser = null;
    toggleDisplay('chat-page', false);
    toggleDisplay('login-page', true);
});

// Lors de la déconnexion d'un utilisateur
socket.on('userDisconnected', function(username) {
    displayInfoMessage(`${username} has left the chat.`);
});

socket.on('userConnected', function(username) {
    displayInfoMessage(`${username} has joined the chat.`);
})

function displayInfoMessage(message) {
    let chatBox = document.getElementById('chat-box');
    let infoMessage = document.createElement('div');
    infoMessage.classList.add('info-message');
    infoMessage.textContent = message;
    chatBox.appendChild(infoMessage);
}
