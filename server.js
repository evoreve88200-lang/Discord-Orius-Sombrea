const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.use(cors());
app.use(express.json());

// Route principale pour vérifier que le serveur tourne en ligne
app.get('/', (req, res) => {
    res.status(200).send("Le serveur Node.js est actif et prêt pour RPG Maker !");
});

// Route qui reçoit les messages du jeu et les envoie sur Discord
app.post('/api/chat', async (req, res) => {
    const { username, message } = req.body;

    if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Le message est vide." });
    }

    if (!DISCORD_WEBHOOK_URL) {
        return res.status(500).json({ error: "Webhook Discord non configurée sur Render." });
    }

    try {
        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username || "Joueur RPG Maker",
                content: message
            })
        });

        if (discordResponse.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: "Erreur lors de l'envoi vers Discord." });
        }
    } catch (err) {
        console.error("Erreur :", err);
        return res.status(500).json({ error: "Erreur serveur interne." });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré et actif sur le port ${PORT}`);
});