const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuration de Socket.io avec CORS autorisé pour RPG Maker
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Le serveur de tchat RPG Maker est en ligne !");
});

io.on("connection", (socket) => {
  console.log("Un joueur s'est connecté");

  // Quand un joueur envoie un message
  socket.on("sendMessage", (data) => {
    // Rediffuse le message à TOUS les joueurs connectés
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Un joueur s'est déconnecté");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});