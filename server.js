const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurer les accès CORS et le parsing JSON
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- CONFIGURATION DISCORD ---
// Tu peux remplacer directement ici ou utiliser des variables d'environnement
const BOT_TOKEN = process.env.BOT_TOKEN || "MTUzNjEzNDEwNDU1NzU1MTYxNg.G8eznT.7GpYjAcFTSlhraS3Yapa0eb1EPk-YxDIJHVttM";
const CHANNEL_ID = process.env.CHANNEL_ID || "1537805849274093659";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://discord.com/api/webhooks/1537816426839150602/gAJA0NaDuzqs7zly5pqKV-PDitjKazoF54AIfWH193zTmRY54bboQXs0NTmVwiH4Eagd";

// Route 1 : Tester si le serveur tourne
app.get('/', (req, res) => {
    res.send('Serveur Relais RPG Maker <-> Discord opérationnel !');
});

// Route 2 : Récupérer les messages du salon Discord (GET)
app.get('/api/messages', (req, res) => {
    if (!BOT_TOKEN || BOT_TOKEN.includes("TON_TOKEN")) {
        return res.status(400).json({ error: "BOT_TOKEN non configuré sur le serveur." });
    }

    const options = {
        hostname: 'discord.com',
        path: `/api/v10/channels/${CHANNEL_ID}/messages?limit=20`,
        method: 'GET',
        headers: {
            'Authorization': `Bot ${BOT_TOKEN.replace(/^Bot\s+/i, '')}`,
            'User-Agent': 'RPGMakerMV-RelayServer/1.0'
        }
    };

    const discordReq = https.request(options, (discordRes) => {
        let body = '';
        discordRes.on('data', (chunk) => body += chunk);
        discordRes.on('end', () => {
            if (discordRes.statusCode === 200) {
                try {
                    const data = JSON.parse(body).reverse();
                    const formatted = data.map(m => ({
                        author: m.author.username,
                        content: m.content
                    }));
                    res.json(formatted);
                } catch (e) {
                    res.status(500).json({ error: "Erreur lors de la lecture des données Discord" });
                }
            } else {
                res.status(discordRes.statusCode).send(body);
            }
        });
    });

    discordReq.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

    discordReq.end();
});

// Route 3 : Envoyer un message via Webhook (POST)
app.post('/api/send', (req, res) => {
    const { username, content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Le contenu du message est vide." });
    }

    if (!WEBHOOK_URL || WEBHOOK_URL.includes("TON_URL")) {
        return res.status(400).json({ error: "WEBHOOK_URL non configuré sur le serveur." });
    }

    try {
        const urlObj = new URL(WEBHOOK_URL);
        const postData = JSON.stringify({ username: username || 'Joueur', content: content });

        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'RPGMakerMV-RelayServer/1.0'
            }
        };

        const webhookReq = https.request(options, (webhookRes) => {
            if (webhookRes.statusCode >= 200 && webhookRes.statusCode < 300) {
                res.json({ success: true });
            } else {
                res.status(webhookRes.statusCode).json({ error: "Erreur envoi Webhook" });
            }
        });

        webhookReq.on('error', (err) => {
            res.status(500).json({ error: err.message });
        });

        webhookReq.write(postData);
        webhookReq.end();
    } catch (e) {
        res.status(400).json({ error: "URL de Webhook invalide." });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`[SERVEUR] Serveur démarré sur le port ${PORT}`);
});