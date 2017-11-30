/* global gradients:false */

const log = (function () {
    const log = document.getElementById("log");
    let lastEl = null;

    return function (m) {
        let el = document.createElement("li");
        el.append(m);
        log.insertBefore(el, lastEl);
        lastEl = el;
    }
})();


function createWS () {
    return new Promise((resolve, reject) => {
        try {
            let ws = null;
            let wsUrl = "";

            if (window.location.protocol.startsWith("https")) {
                wsUrl = "wss://" + window.location.host;
            } else {
                wsUrl = "ws://" + window.location.host;
            }

            ws = new WebSocket(wsUrl);

            ws.onopen = function () {
                resolve(ws);
            }
        } catch (e) {
            reject(e);
        }

    });
}

function bindButton(name, f) {
    const btns = document.getElementsByName(name);
    btns.forEach((b) => { b.onclick = f });
}

function setGradient(n) {
    if (n === undefined) {
        n = Math.floor(Math.random() * gradients.length);
    }
    const g = gradients[n];
    const step = 100.0/(g.colors.length-1);
    var s = "linear-gradient(170deg";
    g.colors.forEach((c, n) => {
        s = s + ", " + c + " " + step*n + "%"
    });
    s = s + ")";

    const e = document.getElementsByClassName("content")[0];
    e.style.backgroundImage = s;
    log("switched gradient: " + g.name + " - " + s);
}

async function setup () {
    setGradient(283); // Wedding Day Blues

    let ws = await createWS();
    console.log(ws);

    ws.onmessage = function (m) {
        console.log("got message:", m);
        log("got message: " + m.data);
    }

    bindButton("btnPowerOn", () => { ws.send("Main.Power=On") });
    bindButton("btnPowerOff", () => { ws.send("Main.Power=Off") });

    bindButton("btnPowerQuery", () => { ws.send("Main.Power?") });

    bindButton("btnVolumeMinusSmall", () => { ws.send("Main.Volume-") });
    bindButton("btnVolumePlusSmall", () => { ws.send("Main.Volume+") });

    bindButton("btnRandomGradient", () => { setGradient() });
}

setup();

