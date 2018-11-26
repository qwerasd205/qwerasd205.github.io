//META{"name":"WordNotifications"}*//

// !!! Hey there! If you didn't come here from the BetterDiscord Discord server ( https://discord.gg/2HScm8j )  !!! //
// !!! then please do not use whatever you were using that led you here, getting plugins from places other than !!! //
// !!! the #plugin repo channel in the BD server can be dangerous, as they can be malicious and do bad things.  !!! //

class WordNotifications {
    getName() {
        return "Word Notifications";
    }
    getDescription() {
        return "Get notifications when certain words are said.";
    }
    getVersion() {
        return "0.0.1";
    }
    getAuthor() {
        return "Qwerasd";
    }
    load() {
        this.getChannelById = BdApi.findModuleByProps('getChannel').getChannel;
        this.getServerById = BdApi.findModuleByProps('getGuild').getGuild;
        this.transitionTo = BdApi.findModuleByProps('transitionTo').transitionTo;
    }
    start() {
        this.cancelPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("dispatch"), 'dispatch', { after: this.dispatch.bind(this) });
        this.words = BdApi.loadData('WordNotifications', 'words') || [];
    }
    stop() {
        this.cancelPatch();
        BdApi.saveData('WordNotifications', 'words', this.words);
    }
    dispatch(data) {
        if (!(data.methodArguments[0].type === 'MESSAGE_CREATE'))
            return;
        const message = data.methodArguments[0].message;
        let content = message.content;
        let proceed = false;
        this.words.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            const replaced = content.replace(regex, match => `[${match}]`);
            if (replaced !== content) {
                proceed = true;
                content = replaced;
            }
        });
        if (!proceed)
            return;
        const channel = this.getChannelById(message.channel_id);
        const server = this.getServerById(message.guild_id);
        const author = message.author;
        const notification = new Notification(`${server.name} #${channel.name} | Word Notifications`, { body: `${author.username}: ${content}` });
        notification.addEventListener('click', _ => {
            this.goToMessage(server.id, channel.id, message.id);
        });
    }
    goToMessage(server, channel, message) {
        require('electron').remote.getCurrentWindow().focus();
        this.transitionTo(`/channels/${server}/${channel}/${message}`);
    }
    getSettingsPanel() {
        const div = document.createElement('div');
        const textarea = document.createElement('textarea');
        const br = document.createElement('br');
        const button = document.createElement('button');
        button.innerText = 'Apply';
        button.style.cssFloat = 'right';
        textarea.placeholder = 'Insert list of words to be notified about (Comma separated)';
        textarea.value = this.words.join(', ');
        textarea.style.width = '100%';
        textarea.style.minHeight = '6ch';
        button.addEventListener('click', _ => {
            this.words = textarea.value.split(',').map(e => e.trim());
            document.getElementById('plugin-settings-Word Notifications').previousSibling.click();
        });
        div.appendChild(textarea);
        div.appendChild(br);
        div.appendChild(button);
        return div;
    }
}