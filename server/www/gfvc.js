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

async function setup () {
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
}

setup();

