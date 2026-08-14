const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(cors());
app.use(express.json());

// Historique des messages stockés temporairement en mémoire (50 derniers)
let chatHistory = [
    {
        id: 1,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        username: "Serveur Relay",
        message: "Initialisation du Chat Live !"
    }
];

// Route pour RÉCUPÉRER tous les messages du chat en direct
app.get('/api/chat', (req, res) => {
    res.status(200).json(chatHistory);
});

// Route pour ENVOYER un nouveau message (du Jeu vers Render + Discord)
app.post('/api/chat', async (req, res) => {
    const { username, message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message vide." });
    }

    const newMessage = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        username: username || "Héros Anonyme",
        message: message.trim()
    };

    // Ajout à l'historique en mémoire (limite de 50)
    chatHistory.push(newMessage);
    if (chatHistory.length > 50) chatHistory.shift();

    // Envoi au salon Discord via Webhook si configuré
    if (DISCORD_WEBHOOK_URL) {
        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newMessage.username,
                    content: newMessage.message
                })
            });
        } catch (err) {
            console.error("Erreur Webhook Discord :", err);
        }
    }

    res.status(200).json({ success: true, item: newMessage });
});

app.listen(PORT, () => {
    console.log(`Relay Serveur Chat Live en ligne sur le port ${PORT}`);
});