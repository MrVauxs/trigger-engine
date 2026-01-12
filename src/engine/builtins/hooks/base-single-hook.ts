import { TriggerHook } from "engine";

abstract class BaseSingleHook<TArgs extends Record<string, any>> extends TriggerHook<TArgs> {
    #hook = this.#onEvent.bind(this);

    abstract get eventName(): string;
    abstract _onEvent(...args: any[]): void;

    _enable(): void {
        if (game.user.isGM) {
            Hooks.on(this.eventName, this.#hook);
        }
    }

    _disable(): void {
        Hooks.off(this.eventName, this.#hook);
    }

    #onEvent(...args: any[]): void {
        if (game.user.isActiveGM) {
            this._onEvent(...args);
        }
    }
}

export { BaseSingleHook };
