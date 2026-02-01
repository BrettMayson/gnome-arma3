import Meta from 'gi://Meta';
import Gio from 'gi://Gio';

export default class Arma3WindowExtension {
    _windowFocusChangeId: number | null = null;
    _isFullscreenFocused: boolean = false;
    _usingSuper = false;
    _settings: Gio.Settings;

    constructor() {
        this._settings = new Gio.Settings({ schema_id: 'org.gnome.mutter' });
    }

    enable() {
        this._windowFocusChangeId = null;
        this._isFullscreenFocused = false;

        let currentOverlayKey = this._settings.get_string('overlay-key');
        if (currentOverlayKey === '') {
            // It's possible the computer powered off while Arma 3 was focused
            currentOverlayKey = 'Super';
            this._settings.set_string('overlay-key', 'Super');
        }

        this._usingSuper = currentOverlayKey === 'Super';

        this._windowFocusChangeId = global.display.connect(
            'notify::focus-window',
            () => this._onFocusChanged()
        );

        this._onFocusChanged();
    }

    disable() {
        if (this._windowFocusChangeId) {
            global.display.disconnect(this._windowFocusChangeId);
            this._windowFocusChangeId = null;
        }

        if (this._isFullscreenFocused) {
            this.onExitFullscreen();
        }
    }

    _onFocusChanged() {
        const focusedWindow = global.display.get_focus_window();
        const wasFullscreen = this._isFullscreenFocused;

        this._isFullscreenFocused = this._isFullscreenWindow(focusedWindow);

        if (this._isFullscreenFocused && !wasFullscreen) {
            this.onEnterFullscreen();
        } else if (!this._isFullscreenFocused && wasFullscreen) {
            this.onExitFullscreen();
        }
    }

    _isFullscreenWindow(window: Meta.Window | null): boolean {
        if (!window) return false;

        if (!window.is_fullscreen()) return false;

        const title = window.get_title().toLowerCase();
        const gamePatterns = ['arma 3', 'a3'];
        return gamePatterns.some(pattern =>
            title?.includes(pattern)
        );
    }

    onEnterFullscreen() {
        // Set the overlay-key to an empty string to disable it
        if (this._usingSuper)
            this._settings.set_string('overlay-key', '');
    }

    onExitFullscreen() {
        // Restore the overlay-key to 'Super'
        if (this._usingSuper)
            this._settings.set_string('overlay-key', 'Super');
    }
}
