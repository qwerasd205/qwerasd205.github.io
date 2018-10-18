//META{"name":"RepoUtils"}*//

// !!! Hey there! If you didn't come here from the BetterDiscord Discord server ( https://discord.gg/2HScm8j )  !!! //
// !!! then please do not use whatever you were using that led you here, getting plugins from places other than !!! //
// !!! the #plugin repo channel in the BD server can be dangerous, as they can be malicious and do bad things.  !!! //

class RepoUtils {
    getName() {
        return "Repo Utils";
    }
    getDescription() {
        return "Adds options to download/install/preview next to betterdiscord.net ghdl links.";
    }
    getVersion() {
        return "0.0.2";
    }
    getAuthor() {
        return "Qwerasd";
    }

    load() {
        this.info      = {};
        const path     = require('path');
        const process  = require('process');
        const platform = process.platform;
        this.dataPath  = (platform === "win32" ? process.env.APPDATA : platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
        this.themeLoc  = path.join(this.dataPath, 'themes');
        this.pluginLoc = path.join(this.dataPath, 'plugins');
    }

    start() {
        BdApi.injectCSS('repoUtils', 
            `
                .repoUtilsButtonGroup {
                    display: inline-block;
                    background-color: rgba(0,0,0,0.5);
                    color: white;
                    max-height: 2ex;
                    max-width: 2ex;
                    min-height: 2ex;
                    min-width: 2ex;
                    border-radius: 1.5ex;
                    line-height: calc(1ex - 2px);
                    text-align: center;
                    vertical-align: middle;
                    position: relative;
                    top: -0.1ch;
                    margin-left: 0.5ex;
                    cursor: pointer;
                    user-select: none;
                    transition: max-width 0.5s ease-in-out, max-height 0.2s linear, top 0.2s linear;
                    overflow: hidden;
                    white-space: nowrap;
                    text-indent: 0;
                }

                .repoUtilsButtonGroup.open {
                    max-width: 500px; max-height: 500px;
                    top: -0.2ch;
                    padding: 2px;
                }

                .repoUtilsButton {
                    display: inline-block;
                    font-size: 80%;
                    color: white;
                    background-color: rgba(0,0,0,0.5);
                    padding: 0.2ch 1ex;
                    border-radius: 2em;
                    margin: 0 0.25ex;
                }

                .repoUtilsButton:first-child {
                    margin-left: 0;
                }

                .repoUtilsButton:last-child {
                    margin-right: 0;
                }

                .repoUtilsButton.install {
                    background-color: rgba(20,200,20,0.5)
                }

                .repoUtilsButton.preview {
                    background-color: rgba(10,50,200,0.5)
                }

                .repoUtilsButton.close {
                    font-weight: bold;
                }

                .repoUtilsHeader {
                    line-height: 2.25ch;
                }
            `
        );
        this.processLinks();
        $(document.body).on('click.repoUtils', _ => {this.collapseAllButtons(this.collapseButtons)});
        this.rnm = BdApi.getPlugin('Restart No More') ? true : false;
    }

    stop() {
        BdApi.clearCSS('repoUtils');
        Array.from(document.getElementsByClassName('repoUtilsButtonGroup')).forEach(
            b => {
                b.parentElement.removeChild(b);
            }
        );
        Array.from(document.getElementsByClassName('repoUtils')).forEach(
            e => {
                e.classList.remove('repoUtils');
            }
        );
        $(document.body).off('click.repoUtils');
    }

    button(text, handler, extraClass) {
        let button = document.createElement('button');
        button.classList.add('repoUtilsButton');
        button.innerText = text;
        button.classList.add(extraClass);
        if (handler) button.addEventListener('click', e => {
            handler(e);
            e.stopPropagation();
        });
        return button;
    }

    getFileInfo(url) {
        return new Promise((resolve, reject) => {
            if (this.info[url]) return resolve(this.info[url]);
            const req = require('request');

            req.head(url, (err, response, body) => {
                if (err) return reject(err);
                try {
                    const result = {
                        name: response.headers['content-disposition'].split('filename=')[1].split(';')[0],
                        type: response.headers['content-type'].split(';')[0]
                    };
                    this.info[url] = result;
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    downloadFile(url, destination) {
        return new Promise((resolve, reject) => {
            const req = require('request');
            const fs   = require('fs');

            let file = fs.createWriteStream(destination);

            req.get(url)
            .on('response', function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    resolve();
                });
            }).on('error', function(err) {
                fs.unlink(destination, _=>{});
                reject(err);
            });
        });
    }

    async install(url) {
        const path = require('path');
        let info   = {};
        try {
            info = await this.getFileInfo(url);
        } catch (e) {
            BdApi.showToast(`Error getting info for install!`, {type: 'error'});
            throw err;
        }
        const isTheme = info.type === 'text/css';
        const name    = info.name;

        const installPath = path.join(isTheme ? this.themeLoc : this.pluginLoc, name);

        this.downloadFile(url, installPath)
        .then(_ => {
            this.collapseAllButtons(this.collapseButtons);
            BdApi.showToast('Installed Successfully!', {type: 'success'});
            if (this.rnm) {
                BdApi.showToast(`Your ${isTheme ? 'theme' : 'plugin'} is now available in settings.`, {type: 'info'});
            } else {
                BdApi.showToast(`Reload your Discord to see your ${isTheme ? 'theme' : 'plugin'} in settings.`, {type: 'info'});
            }
        })
        .catch(err => {
            BdApi.showToast(`There was an error installing the ${isTheme ? 'theme' : 'plugin'}!`, {type: 'error'});
            throw err;
        });
    }

    openPreview(url) {
        let a    = document.createElement('a');
        a.target = '_blank';
        a.href   = `https://0x71.cc/bd/theme/preview?file=${url}`;
        a.click();
    }

    collapseAllButtons(collapseFunction) {
        Array.from(document.querySelectorAll('.repoUtilsButtonGroup.open')).forEach(collapseFunction);
    }

    collapseButtons(group) {
        group.classList.remove('open');
        while (group.firstChild) {
            group.removeChild(group.lastChild);
        }
        group.innerText = '...';
    }

    async expandButtons(group, a) {

        const open = document.querySelector('.repoUtilsButtonGroup.open');
        if (open) this.collapseButtons(open);

        const download = this.button(
            'Download',
            (function() {
                this.a.click();
            }).bind({a: a}),
            'download'
        );

        const install = this.button(
            'Install',
            (function() {
                this.install(a.href);
            }).bind(Object.assign(this, {a: a})),
            'install'
        );

        const preview = this.button(
            'Preview',
            (function() {
                this.openPreview(a.href);
            }).bind({openPreview: this.openPreview, a: a}),
            'preview'
        );

        const close = this.button(
            'X  ',
            _ => {
                this.collapseButtons(group);
            },
            'close'
        );

        let header = document.createElement('div');
        header.classList.add('repoUtilsHeader');
        header.style.display  = 'none';

        preview.style.display = 'none';

        this.getFileInfo(a.href)
        .then(info => {
            const isTheme = info.type === 'text/css';
            const name    = info.name;

            header.innerText = name;
            header.style.display = '';

            if (isTheme) preview.style.display = '';
        })
        .catch(e => {
            this.collapseButtons(group);
            BdApi.showToast(`There was an error getting info!`, {type: 'error'});
            throw e;
        });
        
        group.classList.add('open');
        group.innerText = '';
        group.appendChild(header);
        group.appendChild(close);
        group.appendChild(install);
        group.appendChild(preview);
        group.appendChild(download);
    }

    addButtons(a) {
        a.classList.add('repoUtils');
        let buttonGroup = document.createElement('span');
        buttonGroup.classList.add('repoUtilsButtonGroup');
        buttonGroup.innerText = '...';

        buttonGroup.addEventListener('click', 
            (function(e) {
                this.expandButtons(buttonGroup, a);
                e.stopPropagation();
            }).bind(this)
        );

        a.insertAdjacentElement('afterend', buttonGroup);
    }

    processLinks() {
        Array.from(document.getElementsByTagName('a'))
            .filter(a => {
                if (a.classList.contains('repoUtils')) return false;
                if (a.hostname === 'betterdiscord.net' && a.pathname === '/ghdl') {
                    return true;
                } else {
                    a.classList.add('repoUtils');
                }
            })
            .forEach((function(a) {
                this.addButtons(a);
            }).bind(this));
    }

    observer() {
        this.processLinks();
    }
}
