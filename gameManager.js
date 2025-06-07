import { Collectible } from "./entities/collectible.js";
import { GroundEnemy } from "./entities/groundEnemy.js";

export class GameManager {
    constructor(k, mapWidth, mapHeight, tileWidth, tileHeight) {
        this.k = k;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.score = 0;
        this.enemies = [];
        this.collectibles = [];



        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = Math.random() * 3;
        this.collectibleSpawnTimer = 0;
        this.collectibleSpawnInterval = 2;
        this.maxEnemies = 5;
        this.maxCollectibles = 8;

        this.setupUI();
        this.setupCollisions();
        this.setupSpawning();

        const test = new Collectible(k, 1000, 600);
        this.collectibles.push(test);
        const enemy = new GroundEnemy(k, 800, 600);
        this.enemies.push(enemy);
    }

    setupUI() {
        // Display score
        this.scoreText = this.k.add([
            this.k.text(`Score: ${this.score}`), {
                size: 32,
                font: "orbitron"
            },
            this.k.pos(20, 20),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            "scoreUI"
        ]);
    }

    changeScore(amountScore) {
        this.score += amountScore;
        if (this.score < 0) {
            this.score = 0;
        }
        if (this.score > 999) {
            this.score = 999;
        }
        this.scoreText.text = `Score: ${this.score}`;
    }

    updateScale(mapScale, mapOffsetY) {
        this.enemies.forEach(enemy => {

        });

        this.collectibles.forEach(collectible => {
            collectible.updateScale(mapScale, mapOffsetY);
        });
    }

    setupCollisions() {

        // Collision betwenn a player and a collectible
        this.k.onCollide("player", "collectible", (player, collectible) => {
            const indexCollectible = this.collectibles.findIndex(element => element.gameObject === collectible);
            if (indexCollectible != -1) {
                this.collectibles[indexCollectible].collect();
                this.changeScore(5);
                this.collectibles.splice(indexCollectible, 1);
            }
        });

        // Collision betwenn a player and an enemy
        this.k.onCollide("player", "enemy", (player, enemy) => {

            const indexCollectible = this.enemies.findIndex(element => element.gameObject === enemy);
            if (indexCollectible != -1) {
                this.enemies[indexCollectible].destroy();
                this.changeScore(-10);
                this.enemies.splice(indexCollectible, 1);
            }
        });
        
    }

    setupSpawning(){
        this.k.onUpdate(() => {
            const dt = this.k.dt();
            
            this.enemySpawnTimer += dt;
            if(this.enemySpawnTimer >= this.enemySpawnInterval){
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }
        });
    }

    spawnEnemy(){
        const originalX = this.mapWidth - (this.tileWidth / 2);
        const originalY = this.mapHeight - (this.tileHeight * 2);

        let spawnX = originalX;
        let spawnY = originalY;

        if(this.k.mapScale && this.k.mapOffsetY !== undefined){
            spawnX = originalX * this.k.mapScale;
            spawnY = this.k.mapOffsetY + (originalY * this.k.mapScale);
        }

        const enemy = new GroundEnemy(this.k, spawnX, spawnY);
        this.enemies.push(enemy);
    }

}