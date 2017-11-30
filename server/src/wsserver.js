const WebSocket = require("ws");

class WSServer extends WebSocket.Server {

    constructor(httpServer, serialConnection) {
        super({server: httpServer});

        this.serialConnection = serialConnection;

        this.connections = new Set();

        this.serialConnection.on("message", (m) => {
            console.log("received serial event: %s", m);
            this.handleSCMessage(m);
        });

        this.on("connection", (ws) => {
            console.log("new ws connection");
            this.connections.add(ws);

            ws.on("close", () => {
                this.connections.delete(ws);
                console.log("WS closed");
            });

            ws.on("message", (message) => {
                console.log("received ws message: %s", message);
                this.handleWSMessage(message, ws);
            });

        });

    }

    handleWSMessage(m, ws) {
        if (m.startsWith("ping")) {
            ws.send("pong");
        } else {
            this.serialConnection.send(m);
            ws.send("ack:" + m);
        }
    }

    handleSCMessage(m) {
        this.connections.forEach(c => {
            c.send("event:" + m);
        });
    }

}

module.exports = WSServer;