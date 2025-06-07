export class Collectible{
    constructor(k, x, y){
        this.k = k;
        this.originalX = x;
        this.originalY = y;
        this.destroyed = false;
        this.variationMovement = Math.random() * Math.PI * 2; // Random between 0 and 2PI

        this.gameObject = k.add([
            k.rect(100, 100),
            k.area(),
            k.anchor("center"),
            k.scale(0.6),
            k.pos(x, y),
            color(245, 66, 242),
            "collectible"
        ]);

        this.setupBehavior();

    }

    updateScale(mapScale, mapOffsetY){
        if(!this.destroyed){
            const scaledX = this.originalX * mapScale;
            const scaledY = mapOffsetY + (this.originalY * mapScale);

            this.gameObject.pos.x = scaledX;
            this.gameObject.posY = scaledY;
            this.gameObject.scale = this.k.vec2(0.6 * mapScale); // ICI CHANGER EN FONCTION DU SCALE DANS ADD DANS LE CONSTRUCTEUR!!!
        }
    }

    setupBehavior(){
        this.gameObject.onUpdate(() => {
            const time = this.k.time();
            const amount = Math.sin(time * 3 + this.variationMovement) * 10;
            this.gameObject.pos.y = this.originalY + amount;
        });
    }

    collect(){
        if(!this.destroyed){
            this.destroyed = true;

            this.k.tween(
                this.gameObject.scale,
                this.k.vec2(0),
                0.2,
                (val) => {this.gameObject.scale = val},
                this.k.easings.easeOutBack
            ).then(() => {
                this.gameObject.destroy();
            });
        }
    }
}