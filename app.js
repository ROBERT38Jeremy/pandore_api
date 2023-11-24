const express = require('express')
const WebSocket = require('ws');
const http = require('http');
const cors = require("cors");
const { expressMiddlewareRoutes } = require("./routes/app.routes");
const { pandoreWebsocket } = require("./websocket/app.websocket");

const app = express()
const port = {
    api: 3001,
    websocket: 3002
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

expressMiddlewareRoutes(app);

app.listen(port.api, () => {
    console.log(`Pandore API listening on port ${port.api}`)
})

// websocket pour la process list
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

pandoreWebsocket(wss);

server.listen(port.websocket, () => {
    console.log(`Pandore Websocket listening on port ${port.websocket}`);
    console.log(`-----------------------------------------------------`);
});
