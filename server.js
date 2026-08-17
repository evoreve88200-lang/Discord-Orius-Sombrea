const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Stockage temporaire des 50 derniers messages
let chatHistory = [];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// À la réception d'un message sur Discord
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore les bots pour éviter les boucles

    const timeStr = new Date(message.createdTimestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    chatHistory.push({
        username: message.author.username,
        message: message.content,
        time: timeStr
    });

    if (chatHistory.length > 50) chatHistory.shift();
});

// API pour récupérer les messages depuis le jeu
app.get('/api/messages', (req, res) => {
    res.json(chatHistory);
});

// API pour envoyer un message depuis le jeu vers Discord
app.post('/api/messages', async (req, res) => {
    const { username, message } = req.body;
    const channel = client.channels.cache.get('TON_ID_DE_SALON_DISCORD');
    
    if (channel) {
        await channel.send(`**${username}** : ${message}`);
        
        const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        chatHistory.push({ username, message, time: timeStr });
        if (chatHistory.length > 50) chatHistory.shift();
        
        res.json({ success: true });
    } else {
        res.status(500).json({ error: "Salon introuvable" });
    }
});

client.login('TON_BOT_TOKEN_DISCORD');
app.listen(3000, () => console.log('Serveur Relais Discord prêt sur le port 3000 !'));