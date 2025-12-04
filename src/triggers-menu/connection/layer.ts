class BlueprintConnectionsLayer extends PIXI.Container {
    clear() {
        this.removeAllListeners();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }
}

export { BlueprintConnectionsLayer };
