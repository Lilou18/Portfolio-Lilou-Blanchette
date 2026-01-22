class DebugOverlay {
    constructor() {
        this.stats = {
            fps: 0,
            memory: 0,
            gcCount: 0,
            objects: 0,
            lastMemory: 0
        };

        this.frameCount = 0;
        this.lastTime = Date.now();
        this.enabled = true;
    }

    update() {
        if (!this.enabled) return;

        this.frameCount++;
        const now = Date.now();

        // FPS
        if (now - this.lastTime > 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Mémoire et GC
        if (performance.memory) {
            const current = performance.memory.usedJSHeapSize;
            if (current < this.stats.lastMemory - 2000000) {
                this.stats.gcCount++;
                console.log(`🗑️ GC Event #${this.stats.gcCount}`);
            }
            this.stats.memory = (current / 1024 / 1024).toFixed(1);
            this.stats.lastMemory = current;
        }

        // Comptez les objets
        this.stats.objects = get("*").length;
    }

    draw() {
        if (!this.enabled) return;

        const text = `
FPS: ${this.stats.fps}
Memory: ${this.stats.memory}MB
GC Events: ${this.stats.gcCount}
Objects: ${this.stats.objects}
(Tap to toggle)`.trim();

        drawText({
            text: text,
            pos: vec2(10, 10),
            size: 12,
            color: rgb(255, 255, 0),
            anchor: "topleft"
        });
    }
}

const debugOverlay = new DebugOverlay();

onUpdate(() => {
    debugOverlay.update();
});

onDraw(() => {
    debugOverlay.draw();
});

// Toggle avec un tap
onMousePress(() => {
    debugOverlay.enabled = !debugOverlay.enabled;
});