//META{"name":"BDBGone"}*//

class BDBGone {
    getName() {
        return "BD-B-Gone";
    }
    getDescription() {
        return "Completely (or partially) remove BD from your system.";
    }
    getVersion() {
        return "0.0.2";
    }
    getAuthor() {
        return "Qwerasd";
    }

    load() {
        let fs = window.require("fs");
        let process = window.require("process");
        let path = window.require('path');
        let platform = process.platform;
        let dataPath = (platform === "win32" ? process.env.APPDATA : platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
        window.BDBGone_BDPath = dataPath;
        let electron = window.require('electron');
        let userData = electron.remote.app.getPath('userData');
        let version = fs.readdirSync(userData).filter(e => parseInt(e) + 1)[0];
        window.BDBGone_DCPath = path.join(userData, version, '/discord_desktop_core/');

        window.BDBGone_rimraf = function (dir_path) {
            if (dir_path.length < 10) return; // Just in case something goes wrong as it's trying to delete / or something stupid like that.
            let fs = window.require('fs');
            let path = window.require('path');
            if (fs.existsSync(dir_path)) {
                fs.readdirSync(dir_path).forEach(function (entry) {
                    var entry_path = path.join(dir_path, entry);
                    if (fs.lstatSync(entry_path).isDirectory() && path.extname(entry_path) !== '.asar') {
                        BDBGone_rimraf(entry_path);
                    } else {
                        fs.unlinkSync(entry_path);
                    }
                });
                fs.rmdirSync(dir_path);
            }
        };

        window.removeBD = function () {
            if (confirm('Are you absolutely sure?')) {
                let electron = window.require('electron');


                if (!document.getElementById('BDBGone_keepData').checked) {
                    BdApi.showToast('Deleting BetterDiscord files...', {
                        type: 'danger'
                    });
                    BDBGone_rimraf(BDBGone_BDPath);
                }


                BdApi.showToast('Removing link from Discord...', {
                    type: 'danger'
                });
                BDBGone_rimraf(BDBGone_DCPath);


                BdApi.showToast('Restarting...', {
                    type: 'warn'
                });
                electron.remote.app.relaunch();
                electron.remote.app.exit(0);
            }
        };
    }

    start() {
        requestAnimationFrame(
            _ => {
                document.querySelector('[data-name="BD-B-Gone"]').querySelector('.bda-settings-button').click();
            }
        );
    }

    stop() {}

    getSettingsPanel() {
        return `
        <div id="settings_BDBGone">
            <h3>Removing BetterDiscord</h3>
            <ul>
            <li>
                <label>
                    <input id="BDBGone_keepData" type="checkbox"}/>
                    Keep BD Data
                </label><br>
                <span style="font-size: 60%; opacity: 0.7">(If checked plugins and themes will be kept if you reinstall)</span>
            </li>
            <li>
                <button onClick="window.removeBD()">Remove</button>
            </li>
            </ul>
            <h3>The following files will be deleted:</h3>
            <ul>
            <li>
                ${BDBGone_BDPath}<br>
                <span style="font-size: 60%; opacity: 0.7">(Unless Keep BD Data is checked)</span>
            </li>
            <li>
                ${BDBGone_DCPath}
            </li>
            </ul>
        </div>`;
    }
}