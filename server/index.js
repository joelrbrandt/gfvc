const connect = require("connect");
const serveStatic = require("serve-static");
const morgan = require("morgan");
const http = require("http");

const SerialConnection = require("./src/serial");
const WSServer = require("./src/wsserver");

const sc = new SerialConnection();

const app = connect();

app.use(morgan("dev"));

app.use(serveStatic("www", {"index": ["index.html"]}));

const httpServer = http.createServer(app).listen(3000);

new WSServer(httpServer, sc);
