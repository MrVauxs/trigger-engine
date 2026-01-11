import { BaseBuiltinsHook } from "engine";

abstract class BaseSingleHook<TArgs extends Record<string, any>> extends BaseBuiltinsHook<TArgs> {
    #eventHook: (...args: any[]) => void = this.onEvent.bind(this);

    abstract get eventType(): string;
    abstract get eventName(): string;
    abstract get gmOnly(): boolean;

    abstract onEvent(...args: any[]): void;

    get events(): [string] {
        return [this.eventType];
    }

    _enable(): void {
        if (!this.gmOnly || game.user.isActiveGM) {
            Hooks.on(this.eventName, this.#eventHook);
        }
    }

    _disable(): void {
        Hooks.off(this.eventName, this.#eventHook);
    }
}

export { BaseSingleHook };
