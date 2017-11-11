const SerialConnection = require("./serial");

const con = new SerialConnection();

con.on("message", function (m) {
    console.log("received event:", m);
});

setTimeout(function () {
    console.log("closing...");
    con.close();
}, 10000);

console.log("turning power on");
con.send("Main.Power=On"); 

setTimeout(function () {
    console.log("incrementing volume");
    con.send("Main.Volume+");
}, 1000);
