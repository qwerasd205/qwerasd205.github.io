//META{"name":"WordNotifications"}*//

class WordNotifications {
    getName() {
        return "Word Notifications";
    }
    getDescription() {
        return "Get notifications when certain words are said.";
    }
    getVersion() {
        return "0.0.10";
    }
    getAuthor() {
        return "Qwerasd";
    }
    load() {
        this.getChannelById = BdApi.findModuleByProps('getChannel').getChannel;
        this.getServerById = BdApi.findModuleByProps('getGuild').getGuild;
        this.transitionTo = BdApi.findModuleByProps('transitionTo').transitionTo;
        this.isMuted = BdApi.findModuleByProps('isGuildOrCategoryOrChannelMuted').isGuildOrCategoryOrChannelMuted.bind(BdApi.findModuleByProps('isGuildOrCategoryOrChannelMuted'));
        this.isBlocked = BdApi.findModuleByProps('isBlocked').isBlocked;
        this.getUnreadCount = BdApi.findModuleByProps('getUnreadCount').getUnreadCount;
        this.currentChannel = BdApi.findModuleByProps("getChannelId").getChannelId;
        this.userId = BdApi.findModuleByProps('getId').getId();
    }
    start() {
        this.cancelPatch = BdApi.monkeyPatch(BdApi.findModuleByProps("dispatch"), 'dispatch', { after: this.dispatch.bind(this) });
        this.words = BdApi.loadData('WordNotifications', 'words') || [];
        this.user_blacklist = BdApi.loadData('WordNotifications', 'user_blacklist') || [];
        this.guild_blacklist = BdApi.loadData('WordNotifications', 'guild_blacklist') || [];
    }
    stop() {
        this.cancelPatch();
    }
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    dispatch(data) {
        if (!this.words.length)
            return;
        if (data.methodArguments[0].type !== 'MESSAGE_CREATE')
            return;
        const message = data.methodArguments[0].message;
        if (this.user_blacklist.includes(message.author.id))
            return;
        if (this.guild_blacklist.includes(message.guild_id))
            return;
        if (this.currentChannel() === message.channel_id && require('electron').remote.getCurrentWindow().isFocused())
            return;
        if (this.isMuted(message.guild_id, message.channel_id))
            return;
        const author = message.author;
        if (message.author.id === this.userId)
            return;
        if (this.isBlocked(author.id))
            return;
        let content = message.content;
        let proceed = false;
        this.words.forEach(word => {
            const regex = new RegExp(`(^|\\W)(${this.escapeRegex(word)})($|\\W)`, 'gi');
            const replaced = content.replace(regex, '$1→$2←$3');
            if (replaced !== content) {
                proceed = true;
                content = replaced;
            }
        });
        if (!proceed)
            return;
        const channel = this.getChannelById(message.channel_id);
        const server = this.getServerById(message.guild_id);
        const notification = new Notification(`${server.name ? `${server.name} #` : ''}${channel.name} (${this.getUnreadCount(channel.id)} unread)`, { body: `${author.username}: ${content}` });
        notification.addEventListener('click', _ => {
            this.goToMessage(server.id, channel.id, message.id);
        });
    }
    goToMessage(server, channel, message) {
        require('electron').remote.getCurrentWindow().focus();
        this.transitionTo(`/channels/${server ? server : '@me'}/${channel}/${message}`);
        requestAnimationFrame(() => this.transitionTo(`/channels/${server ? server : '@me'}/${channel}/${message}`));
    }
    getSettingsPanel() {
        const div = document.createElement('div');
        const wordsT = document.createElement('h6');
        const words = document.createElement('textarea');
        const guild_ignoreT = document.createElement('h6');
        const guild_ignore = document.createElement('textarea');
        const user_ignoreT = document.createElement('h6');
        const user_ignore = document.createElement('textarea');
        const br = document.createElement('br');
        const button = document.createElement('button');
        button.innerText = 'Apply';
        button.style.cssFloat = 'right';
        button.style.backgroundColor = '#3E82E5';
        button.style.color = 'white';
        button.style.fontSize = '100%';
        wordsT.innerText = 'Words';
        words.placeholder = 'Insert list of words to be notified about (Comma separated, e.g. "Bill, Billy, Bob"). Match is case insensitive.';
        words.value = this.words.join(', ');
        words.style.width = '100%';
        words.style.minHeight = '6ch';
        words.style.color = 'black';
        words.style.backgroundColor = 'white';
        guild_ignoreT.innerText = 'Ignored Servers';
        guild_ignoreT.style.marginTop = '0.5ch';
        guild_ignoreT.style.marginBottom = '0.25ch';
        guild_ignore.placeholder = '(Optional) List of server IDs to ignore (e.g. "86004744966914048, 280806472928198656")';
        guild_ignore.value = this.guild_blacklist.join(', ');
        guild_ignore.style.width = '100%';
        guild_ignore.style.minHeight = '6ch';
        guild_ignore.style.color = 'black';
        guild_ignore.style.backgroundColor = 'white';
        user_ignoreT.innerText = 'Ignored Servers';
        user_ignoreT.style.marginTop = '0.5ch';
        user_ignoreT.style.marginBottom = '0.25ch';
        user_ignore.placeholder = '(Optional) List of user IDs to ignore (e.g. "86004744966914048, 280806472928198656")';
        user_ignore.value = this.user_blacklist.join(', ');
        user_ignore.style.width = '100%';
        user_ignore.style.minHeight = '6ch';
        user_ignore.style.color = 'black';
        user_ignore.style.backgroundColor = 'white';
        button.addEventListener('click', _ => {
            this.words = words.value.split(',').map(e => e.trim());
            BdApi.saveData('WordNotifications', 'words', this.words);
            this.guild_blacklist = guild_ignore.value.split(',').map(e => e.trim());
            BdApi.saveData('WordNotifications', 'guild_blacklist', this.guild_blacklist);
            this.user_blacklist = user_ignore.value.split(',').map(e => e.trim());
            BdApi.saveData('WordNotifications', 'user_blacklist', this.user_blacklist);
            document.getElementById('plugin-settings-Word Notifications').previousSibling.click();
        });
        div.appendChild(wordsT);
        div.appendChild(words);
        div.appendChild(guild_ignoreT);
        div.appendChild(guild_ignore);
        div.appendChild(user_ignoreT);
        div.appendChild(user_ignore);
        div.appendChild(br);
        div.appendChild(button);
        return div;
    }
}
