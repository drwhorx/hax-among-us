//META{"name":"AmonGUs"}*//

class AmonGUs {
    // Constructor
    constructor() {
        this.initialized = false;
    }

    // Meta
    getName() { return "AmonGUs"; }
    getShortName() { return "AmonGUs"; }
    getDescription() { return "A BetterDiscord plugin that works with the AmonGUs app"; }
    getVersion() { return "0.1.0"; }
    getAuthor() { return "drwhorx"; }

    // Settings  Panel
    getSettingsPanel() {
        return "";
    }

    // Load/Unload
    load() {
        let socket = new WebSocket("ws://localhost:9998", 'echo-protocol');
        socket.onmessage = (evt) => {
            let data = evt.data;
            let mute = $("[aria-label=\"Mute\"]")[0]
            let muted = mute.getAttribute("aria-checked") == "true";
            console.log(mute);
            console.log(data);
            if ((data == "mute" && !muted) || (data == "unmute" && muted)) {
                mute.click();
            }
        }
    }

    unload() {}

    // Events

    onMessage() {
        // Called when a message is received
    };

    onSwitch() {
        // Called when a server or channel is switched
    };

    observer(e) {
        // raw MutationObserver event for each mutation
    };

    // Start/Stop
    start() {}

    stop() {
        PluginUtilities.showToast(this.getName() + " " + this.getVersion() + " has stopped.");
    };

    //  Initialize
    initialize() {
        this.initialized = true;
        PluginUtilities.showToast(this.getName() + " " + this.getVersion() + " has started.");
    }
}