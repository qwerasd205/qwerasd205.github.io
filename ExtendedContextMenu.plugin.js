//META{"name":"ExtendedContextMenu"}*//

// !!! Hey there! If you didn't come here from the BetterDiscord Discord server ( https://discord.gg/2HScm8j )  !!! //
// !!! then please do not use whatever you were using that led you here, getting plugins from places other than !!! //
// !!! the #plugin repo channel in the BD server can be dangerous, as they can be malicious and do bad things.  !!! //

class ExtendedContextMenu {
    constructor() {
        // vv Stole this function from Zere's Plugin Library vv //
        this.getReactInstance = function (node) {
            if (!(node instanceof jQuery) && !(node instanceof Element))
                return undefined;
            var domNode = node instanceof jQuery ? node[0] : node;
            return domNode[Object.keys(domNode).find((key) => key.startsWith("__reactInternalInstance"))];
        };
        // ^^ Stole this function from Zere's Plugin Library ^^ //
    }
    getName() {
        return "Extended Context Menu";
    }
    getDescription() {
        return "Add useful stuff to the context menu.";
    }
    getVersion() {
        return "0.0.1";
    }
    getAuthor() {
        return "Qwerasd";
    }
    load() {
        this.getChannel = BdApi.findModuleByProps('getChannelId').getChannelId;
        this.getServer = BdApi.findModuleByProps('getGuildId').getGuildId;
        this.listener = this.oncontextmenu.bind(this);
        this.copyText = require('electron').clipboard.writeText;
    }
    start() {
        document.addEventListener('contextmenu', this.listener);
    }
    stop() {
        document.removeEventListener('contextmenu', this.listener);
    }
    oncontextmenu() {
        const menu = document.getElementsByClassName('da-contextMenu')[0];
        const reactInstance = this.getReactInstance(menu);
        const message = reactInstance.return.memoizedProps.message;
        if (message) {
            const finalGroup = menu.lastChild;
            finalGroup.appendChild(this.createButton('Copy Link', (function () {
                this.copyText(this.getMessageURL(this.getServer(), this.getChannel(), message.id));
                return true;
            }).bind(this)));
        }
    }
    createButton(text, func) {
        const button = document.createElement('div');
        button.tabIndex = 0;
        button.setAttribute('role', 'button');
        button.className = 'item-1Yvehc da-item extendedContextMenu';
        button.addEventListener('click', e => {
            const close = func(e);
            if (close)
                document.body.click();
        });
        const span = document.createElement('span');
        span.innerText = text;
        const hint = document.createElement('div');
        hint.className = 'hint-22uc-R da-hint';
        button.appendChild(span);
        button.appendChild(hint);
        return button;
    }
    getMessageURL(server, channel, message) {
        return `${document.location.origin}/channels/${server}/${channel}/${message}`;
    }
}