import { gameState } from "../gameState.js";
import { pauseAnimation } from "../animationManager.js";
export class Collectible {
    constructor(k, x, y) {
        this.k = k;
        this.originalX = x;
        this.originalY = y;
        this.scaledY = y;
        this.destroyed = false;
        this.animationTime = 0;
        this.variationMovement = Math.random() * Math.PI * 2; // Random between 0 and 2PI

        this.gameObject = k.add([
            k.sprite("collectible", { anim: "mug" }),
            //k.rect(100, 100),
            k.area(),
            k.anchor("center"),
            k.scale(0.6),
            k.pos(x, y),
            k.z(1),
            //k.color(245, 66, 242),
            "collectible"
        ]);

        this.update();

    }

    updateScale(mapScale, mapOffsetY) {
        if (!this.destroyed) {
            const scaledX = this.originalX * mapScale;
            this.scaledY = mapOffsetY + (this.originalY * mapScale);

            this.gameObject.pos.x = scaledX;
            //this.gameObject.pos.y = this.scaledY;
            this.gameObject.scale = this.k.vec2(0.6 * mapScale); // ICI CHANGER EN FONCTION DU SCALE DANS ADD DANS LE CONSTRUCTEUR!!!
        }
    }

    // Floating animation for the mug
    update() {
        this.gameObject.play("mug");
        pauseAnimation(this.gameObject);

        this.gameObject.onUpdate(() => {
            if (!this.destroyed && !gameState.isGamePaused) {
                this.animationTime += this.k.dt();
                const amount = Math.sin(this.animationTime * 3 + this.variationMovement) * 10;
                this.gameObject.pos.y = this.scaledY + amount;
            }
        });
    }

    collect() {
        if (!this.destroyed) {
            this.destroyed = true;

            this.k.tween(
                this.gameObject.scale,
                this.k.vec2(0),
                0.2,
                (val) => { this.gameObject.scale = val },
                this.k.easings.easeOutBack
            ).then(() => {
                this.gameObject.destroy();
            });
        }
    }
}