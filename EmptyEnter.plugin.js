//META{"name":"EmptyEnter"}*//

// !!! Hey there! If you didn't come here from the BetterDiscord Discord server ( https://discord.gg/2HScm8j )  !!! //
// !!! then please do not use whatever you were using that led you here, getting plugins from places other than !!! //
// !!! the #plugin repo channel in the BD server can be dangerous, as they can be malicious and do bad things.  !!! //

class EmptyEnter {
    getName() {
        return "Empty Enter";
    }
    getDescription() {
        return "Fixes enter on empty messages.";
    }
    getVersion() {
        return "0.3";
    }
    getAuthor() {
        return "Qwerasd";
    }

    load() {}

    start() {
        if(this.setup()) {
            return true;
        }
        return false;
    }

    stop() {
        delete window.emptyEnterFunc;
        this.cleanup();
    }

    handleEnter(textarea) {
        const identity = textarea.parentNode.parentNode.parentNode.parentNode.parentNode;
        if (identity.classList.contains('da-message') || identity.classList.contains('container-1YxwTf')) {
            // Editing a message //
            identity.getElementsByClassName('da-anchor')[1].click();
        } else if (identity.classList.contains('da-uploadModal')) {
            // Upload modal //
            identity.getElementsByClassName('button-primary')[0].click();
        } else {
            // Standard textarea //
        }
    }

    observer(changes) {
        document.querySelectorAll(':not(form)>div>div>div>textarea:not(.empty-enter)').forEach(
            textarea => {
                textarea.classList.add('empty-enter');
                $(textarea).on('keydown.emptyEnter',
                    event => {
                        if (event.which === 13 && !event.shiftKey) {
                            window.emptyEnterFunc(event.target);
                        }
                    }
                );
            }
        );
    }

    cleanup() {
        document.querySelectorAll(':not(form)>div>div>div>textarea.empty-enter').forEach(
            textarea => {
                textarea.classList.remove('empty-enter');
                $(textarea).off('keydown.emptyEnter');
            }
        );
    }

    setup() {
        window.emptyEnterFunc = this.handleEnter;
        return true;
    }
}