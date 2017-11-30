/* global gradients:false */

let ws = null;

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
            console.log("starting createWS");

            let newWs = null;
            let wsUrl = "";

            if (window.location.protocol.startsWith("https")) {
                wsUrl = "wss://" + window.location.host;
            } else {
                wsUrl = "ws://" + window.location.host;
            }

            newWs = new WebSocket(wsUrl);

            newWs.onerror = function (e) {
                console.error("ws error before open, rejecting promise", e);
                reject(e);
            }

            newWs.onopen = function () {
                newWs.onerror = null;
                console.log("ws opened, resolving promise");
                resolve(newWs);
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

/*
function handleMessage() {

}
*/

function sendCommand(c) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(c);
    } else {
        console.error("ws not open, can't send command");
    }
}

function waitOneSecond() {
    console.log("waiting one second");
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
}

const setupNewWS = (function () {
    let doPingTimer = null;
    let lastPingTimeout = null;

    const clearTimers = function () {
        if (doPingTimer) {
            clearTimeout(doPingTimer);
            doPingTimer = null;            
        }

        if (lastPingTimeout) {
            clearTimeout(lastPingTimeout);
            lastPingTimeout = null;
        }        
    }

    const doPing = function () {
        console.log("ping");
        sendCommand("ping");
        lastPingTimeout = setTimeout(() => {
            console.log("failed ping/pong, do something");
            lastPingTimeout = null;
            setupNewWS();
        }, 1000);
    }

    return async function() {
        console.log("Setting up new ws");

        if (ws && ws.readyState <= WebSocket.OPEN) {
            ws.close();
        }
        ws = null;

        clearTimers();

        while (!ws) {
            try {
                console.log("Trying to create ws");
                ws = await createWS();
                console.log("ws created");
            } catch (e) {
                console.error("Error creating ws, retrying", e);
                ws = null;
                await waitOneSecond();
            }
        }
        
        ws.onmessage = function (m) {
            log("got message: " + m.data);
            if (m.data.startsWith("pong")) {
                clearTimers();
                doPingTimer = setTimeout(doPing, 1000);
            }
        }

        ws.onerror = function (e) {
            console.error("ws error, re-creating", e);
            setupNewWS();
        }

        doPing();
    }
}());

async function setup () {
    setGradient(283); // Wedding Day Blues

    await setupNewWS();

    bindButton("btnPowerOn", () => { sendCommand("Main.Power=On") });
    bindButton("btnPowerOff", () => { sendCommand("Main.Power=Off") });

    bindButton("btnPowerQuery", () => { sendCommand("Main.Power?") });

    bindButton("btnVolumeMinusSmall", () => { sendCommand("Main.Volume-") });
    bindButton("btnVolumePlusSmall", () => { sendCommand("Main.Volume+") });

    bindButton("btnRandomGradient", () => { setGradient() });
}

setup();

