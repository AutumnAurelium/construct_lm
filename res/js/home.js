let lockInput = false;
let shiftHeld = false;
let lockSystem = false;
let messages = [

]

let { ipcRenderer } = require("electron");

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br />");
}

function addMessage(msg) {
    let role = msg.role;
    let text = msg["content"];
    let icon = "";
    if(role === "user") {
        icon = "fa-user";
    } else if(role === "assistant") {
        icon = "fa-robot";
    } else if(role === "tool") {
        icon = "fa-computer";
    }

    let color = "light";
    if (role === "user") {
        color = "bg";
    }

    console.log(text);

    if(typeof text === "string") {
        $("#messages").append("<div class=\"row bg-" + color + "\">\n" +
            "            <div class=\"text-center col-xs\"><span class=\"fa-solid " + icon + " fa-fw\"></span></div>\n" +
            "            <div class=\"col-xl\">" + escapeHtml(text) + "</div>\n" +
            "        </div>");
    }
}

async function getCompletion(messages) {
    ipcRenderer.send("getCompletion", messages);
}

ipcRenderer.on("getCompletion", (event, message) => {
    messages.push(message);
    addMessage(message);

    lockInput = false;
    let textarea = $("#messageInput");
    textarea.prop("disabled", false);
    textarea.focus();
    textarea.prop("placeholder", "");
});

$(document).ready(() => {
    $("#systemInput").val(localStorage.getItem("system"));

    $("#messageInput").on("keydown", event => {
        if (event.which === 16) {
            shiftHeld = true;
        }

        textarea = $("#messageInput");

        if (event.which === 13) {
            if (!shiftHeld) {
                if(messages.length === 0) {
                    sysInput = $("#systemInput");
                    messages.push(
                        {"role": "system", "content": sysInput.val()}
                    );
                    lockSystem = true;
                    sysInput.prop("disabled", true);
                }

                if(textarea.val() !== "") {
                    msg = {"role": "user", "content": textarea.val()};
                    messages.push(msg)
                    addMessage(msg);
                }
                textarea.val("");
                event.preventDefault();

                lockInput = true;
                textarea.prop("disabled", true);
                textarea.prop("placeholder", "Awaiting response...");

                // fetch from local API
                getCompletion(messages).then(response => {

                }).catch(error => {
                    textarea.prop("placeholder", "API error. Please retry. (" + error + ")");
                    throw error;
                });
            }
        }
    }).on("keyup", event => {
        if (event.which === 16) {
            shiftHeld = false;
        }
    });

    $("#reset").on("click", event => {
        messages = [];
        lockSystem = false;
        $("#systemInput").prop("disabled", false);
        $("#messages").empty();
    });

    $("#systemInput").on("keyup", event => {
        localStorage.setItem("system", $("#systemInput").val());
    });

    $("textarea").autosize();
});