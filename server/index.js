const connect = require("connect");
const serveStatic = require("serve-static");
const morgan = require("morgan");
const WebSocket = require("ws");
const http = require("http");

const SerialConnection = require("./src/serial");

const app = connect();

app.use(morgan("dev"));

app.use(serveStatic("www", {"index": ["index.html"]}));

const server = http.createServer(app).listen(3000);

const wss = new WebSocket.Server({server});

const sc = new SerialConnection();

const connections = new Set();

sc.on("message", (m) => {
    console.log("received event:", m);
    connections.forEach(c => {
        c.send("event:" + m);        
    })
});


wss.on("connection", (ws) => {

    connections.add(ws);

    ws.on("close", () => {
        connections.delete(ws);
        console.log("WS closed");
    });

    ws.on("message", (message) => {
        console.log("received: %s", message);
        sc.send(message);
        ws.send("ack:" + message);
    });

});
