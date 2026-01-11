import { BaseBuiltinsHook } from "engine";

abstract class BaseSingleHook<TArgs extends Record<string, any>> extends BaseBuiltinsHook<TArgs> {
    #hook = this.#onEvent.bind(this);

    abstract get eventName(): string;
    abstract _onEvent(...args: any[]): void;

    get gmOnly(): boolean {
        return true;
    }

    _enable(): void {
        if (!this.gmOnly || game.user.isGM) {
            Hooks.on(this.eventName, this.#hook);
        }
    }

    _disable(): void {
        Hooks.off(this.eventName, this.#hook);
    }

    #onEvent(...args: any[]): void {
        if (!this.gmOnly || game.user.isActiveGM) {
            this._onEvent(...args);
        }
    }
}

export { BaseSingleHook };
