const EventEmitter = require("events");
const SerialPort = require("serialport");

class SerialConnection extends EventEmitter {

    constructor() {
        super();

        this.buf = "";

        this.port = new SerialPort("/dev/ttyUSB0", { autoOpen: true, baudRate: 115200 });

        this.port.on("open", () => {
            console.log("serial port opened!");
            this.emit("open");
            this.port.on("data", this.receiveAndParse.bind(this));
        });

        this.port.on("error", (e) => {
            console.error("serial port error:", e);
            this.emit("error", e);
            this.port.close();
        });

        this.port.on("close", () => {
            console.log("serial port closed!");
            this.emit("close");
        });

    }

    receiveAndParse(d) {
        var i;

        this.buf = this.buf.concat(String(d));
        while((i = this.buf.indexOf("\r")) >= 0) {
            if (i > 0) {
                this.emit("message", this.buf.substr(0,i));
            }
            this.buf = this.buf.substr(i+1);
        }
    }

    send(m) {
        this.port.write(m + "\r", (err) => {
            if (err) {
                console.log("error:", err);
                this.emit("error", err);
            }
        });
    }

    close() {
        this.port.close();
    }

}

module.exports = SerialConnection;
