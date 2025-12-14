import { gameState } from "../gameState.js";
import { handlePauseAnimation } from "../animationManager.js";

export class GroundEnemy {
    constructor(k, x, y) {
        this.k = k;
        this.originalX = x;
        this.originalY = y;
        this.currentOffset = 0;
        this.destroyed = false;

        const enemyTypes = [
            { speed: 220, color: [255, 255, 0], name: "normal" }, // Normal - Jaune 250
            { speed: 290, color: [255, 165, 0], name: "fast" },   // Rapide - Orange 350
            { speed: 560, color: [255, 0, 0], name: "veryFast" } // Très rapide - Rouge 500
        ];

        const enemySprites = {
            normal: "enemyNormal",
            fast: "enemyFast",
            veryFast: "enemyVeryFast",
        };

        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.speed = this.enemyType.speed;

        this.gameObject = k.add([
            k.sprite(enemySprites[this.enemyType.name], { anim: "walk" }),
            area({
                // shape: new Rect(vec2(0, 0), 90, 100),
                // shape: new k.Polygon([k.vec2(-45, 0), k.vec2(-45, -100), k.vec2(45, -100), k.vec2(45, 0)]),
                shape: new k.Polygon([k.vec2(-45, 0), k.vec2(-45, -100), k.vec2(0, -100), k.vec2(45, -30), k.vec2(45, 0)]),
            }),
            k.anchor("bot"),
            k.scale(1),
            k.pos(x, y),
            "enemy"
        ]);

        this.originalAnimationSpeed = this.gameObject.animSpeed;

        // if (this.enemyType.name === "veryFast") {
        //     this.gameObject = k.add([
        //         //k.rect(100, 100),
        //         k.sprite("enemyVeryFast", { anim: "walk" }),
        //         area({
        //             shape: new Rect(vec2(0, 0), 90, 100),
        //         }),
        //         k.anchor("bot"),
        //         k.scale(1),
        //         k.pos(x, y),
        //         //k.body({isStatic: false}),
        //         //k.color(this.enemyType.color),
        //         "enemy"
        //     ]);

        // }
        // else if (this.enemyType.name === "fast") {
        //     this.gameObject = k.add([
        //         //k.rect(100, 100),
        //         k.sprite("enemyFast", { anim: "walk" }),
        //         area({
        //             shape: new Rect(vec2(0, 0), 90, 100),
        //         }),
        //         k.anchor("bot"),
        //         k.scale(1),
        //         k.pos(x, y),
        //         //k.body({isStatic: false}),
        //         //k.color(this.enemyType.color),
        //         "enemy"
        //     ]);
        // }
        // else {
        //     this.gameObject = k.add([
        //         //k.rect(100, 100),
        //         k.sprite("enemyNormal", { anim: "walk" }),
        //         area({
        //             shape: new Rect(vec2(0, 0), 90, 100),
        //         }),
        //         k.anchor("bot"),
        //         k.scale(1),
        //         k.pos(x, y),
        //         //k.body({isStatic: false}),
        //         //k.color(this.enemyType.color),
        //         "enemy"
        //     ]);
        // }



        this.update();
    }

    // Manage walking animation and collision with the left border
    update() {
        this.gameObject.onUpdate(() => {
            if (this.destroyed) return;

            if (handlePauseAnimation(this.gameObject, this.originalAnimationSpeed)) {
                return; // The game is paused
            }


            const movement = this.speed * this.k.dt();
            this.currentOffset += movement;
            this.gameObject.move(- this.speed, 0)

        });

        this.gameObject.onCollide("borderLeft", () => {
            this.destroy();
        });
    }

    // Update the scale of the enemy if screen changed
    updateScale(mapScale, mapOffsetY) {
        if (!this.destroyed) {
            const currentX = this.originalX - this.currentOffset;
            const scaledX = currentX * mapScale;
            const scaledY = mapOffsetY + (this.originalY * mapScale);

            this.gameObject.pos.x = scaledX;
            this.gameObject.pos.y = scaledY;
            this.gameObject.scale = this.k.vec2(1 * mapScale); // ICI CHANGER EN FONCTION DU SCALE DANS ADD DANS LE CONSTRUCTEUR!!!

            //this.speed = this.enemyType.speed * mapScale;
            //this.speed = (50 + Math.random() * 100) * mapScale;
        }
    }

    // Destroy the enemy
    destroy() {
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