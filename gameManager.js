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
        this.enemySpawnInterval = Math.random() * (3 - 0.5) + 0.5;
        //this.enemySpawnInterval = (Math.random() * 3) + 1;

        this.playerJumpHeight = 200;
        this.groundLevel = this.mapHeight - (this.tileHeight * 2);

        this.collectibleSpawnTimer = 0;
        this.collectibleSpawnInterval = 3;
        this.maxCollectibles = 8;
        this.initialCollectibles = 4;
        this.pendingCollectibleSpawns = [];

        this.setupUI();
        this.setupCollisions();
        this.setupSpawning();
        this.initiateSpawn();
        this.spawnInitialCollectibles();

        const test = new Collectible(k, 1000, 600);
        this.collectibles.push(test);
        //const enemy = new GroundEnemy(k, 800, 600);
        //this.enemies.push(enemy);
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
            enemy.updateScale(mapScale, mapOffsetY);

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

                this.startCollectibleSpawnTimer();
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

        this.k.onCollide("enemy", "enemy", () => {

        });

        this.k.onCollide("collectible", "enemy", () => {

        });

    }

    setupSpawning() {
        this.k.onUpdate(() => {
            const dt = this.k.dt();

            this.enemySpawnTimer += dt;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }


            this.updateCollectibleSpawnTimers(dt);
        });

        this.collectibleSpawnTimer += dt;
        if (this.collectibleSpawnTimer >= this.collectibleSpawnTimer) {
            if (this.collectibles.length < this.maxCollectibles) {
                this.spawnCollectible();
            }
        }
    }

    spawnEnemy() {
        const originalX = this.mapWidth - (this.tileWidth / 2);
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // let spawnX = originalX;
        // let spawnY = originalY;

        // if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
        //     spawnX = originalX * this.k.mapScale;
        //     spawnY = this.k.mapOffsetY + (originalY * this.k.mapScale);
        // }

        const enemy = new GroundEnemy(this.k, originalX, originalY);
        this.enemies.push(enemy);

        if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
            enemy.updateScale(this.k.mapScale, this.k.mapOffsetY);
        }
    }

    initiateSpawn() {
        this.k.wait(2, () => {
            this.initialEnemySpawn(2000);
            this.initialEnemySpawn(3000);
            this.initialEnemySpawn(4500);
        });
    }

    initialEnemySpawn(x) {
        const originalX = x;
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // Always create with original coordinates
        const enemy = new GroundEnemy(this.k, originalX, originalY);
        this.enemies.push(enemy);

        // Let updateScale handle the scaling if needed
        if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
            enemy.updateScale(this.k.mapScale, this.k.mapOffsetY);
        }
    }
    // initialEnemySpawn(x) {
    //     const originalX = x;
    //     const originalY = this.mapHeight - (this.tileHeight * 2);

    //     let spawnX = originalX;
    //     let spawnY = originalY;

    //     if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
    //         spawnX = originalX * this.k.mapScale;
    //         spawnY = this.k.mapOffsetY + (originalY * this.k.mapScale);
    //     }

    //     const enemy = new GroundEnemy(this.k, spawnX, spawnY);
    //     this.enemies.push(enemy);
    // }

    // Collectibles
    spawnInitialCollectibles() {
        for (let i = 0; i < this.initialCollectibles; i++) {
            this.spawnCollectible();
        }
    }

    spawnCollectible() {
        if (this.collectibles.length >= this.maxCollectibles) {
            return;
        }

        const { x, y } = this.generateRandomCollectiblePosition();

        const collectible = new Collectible(this.k, x, y);
        this.collectibles.push(collectible);

        if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
            collectible.updateScale(this.k.mapScale, this.k.mapOffsetY);
        }
    }

    generateRandomCollectiblePosition() {
        const minX = this.tileWidth * 2; // Not spawn on the border
        const maxX = this.mapWidth - (this.tileWidth * 2);

        const groundY = this.groundLevel;
        const maxY = this.groundLevel - this.playerJumpHeight;

        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - groundY) + groundY - 50;

        return { x, y };
    }

    startCollectibleSpawnTimer() {
        // Ajouter un nouveau timer à la liste
        this.pendingCollectibleSpawns.push(this.collectibleSpawnInterval);
    }

    updateCollectibleSpawnTimers(dt) {
        for (let i = this.pendingCollectibleSpawns.length - 1; i >= 0; i--) {
            this.pendingCollectibleSpawns[i] -= dt;

            if (this.pendingCollectibleSpawns[i] <= 0) {
                this.spawnCollectible();
                this.pendingCollectibleSpawns.splice(i, 1);
            }
        }
    }

}