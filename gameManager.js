import { Collectible } from "./entities/collectible.js";
import { GroundEnemy } from "./entities/groundEnemy.js";
import { gameState } from "./gameState.js";

export class GameManager {
    constructor(k, mapWidth, mapHeight, tileWidth, tileHeight) {
        this.k = k;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.score = 0;
        this.bestScore = 0;
        this.enemies = [];
        this.collectibles = [];



        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = Math.random() * (3 - 2) + 2;
        //this.enemySpawnInterval = (Math.random() * 3) + 1;

        this.playerJumpHeight = 200;
        this.groundLevel = this.mapHeight - (this.tileHeight * 2);

        this.collectibleSpawnTimer = 0;
        this.collectibleSpawnInterval = 3;
        this.maxCollectibles = 8;
        this.initialCollectibles = 8;
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
            this.k.text(`Énergie: ${this.score}`), {
                size: 32,
                font: "orbitron"
            },
            this.k.pos(20, 20),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            "scoreUI"
        ]);

        this.bestScoreText = this.k.add([
            this.k.text(`Meilleure Énergie: ${this.bestScore}`), {
                size: 32,
                font: "orbitron"
            },
            this.k.pos(20, 70),
            this.k.color(255, 255, 255),
            this.k.fixed(),
            "bestScoreUI"
        ]);
    }

    // Change player score when he collects a collectible
    changeScore(amountScore) {
        this.score += amountScore;
        if (this.score < 0) {
            this.score = 0;
        }
        if (this.score > 999) {
            this.score = 999;
        }
        if(this.score > this.bestScore){
            this.bestScore = this.score
            this.bestScoreText.text = `Meilleure Énergie: ${this.bestScore}`;
        }
        this.scoreText.text = `Énergie: ${this.score}`;
    }

    // If the screen change size we must update the size of the enemies and the collectibles
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

        // Collision between a player and an enemy
        this.k.onCollide("player", "enemy", (player, enemy) => {

            const indexCollectible = this.enemies.findIndex(element => element.gameObject === enemy);
            if (indexCollectible != -1) {
                this.enemies[indexCollectible].destroy();
                this.changeScore(-10);
                this.enemies.splice(indexCollectible, 1);
                this.k.tween(this.k.RED, this.k.WHITE, 0.15, (p) => player.color = p);
            }
        });

        // No collision between enemies
        this.k.onCollide("enemy", "enemy", () => {

        });

        // No collision between collectibles
        this.k.onCollide("collectible", "enemy", () => {

        });

    }

    // Spawn an enemy after the delay
    setupSpawning() {
        this.k.onUpdate(() => {

            // Stop the timers is the game is paused
            if(gameState.isGamePaused) return;

            const dt = this.k.dt();

            this.enemySpawnTimer += dt;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }


            this.updateCollectibleSpawnTimers(dt);
        });

        // this.collectibleSpawnTimer += dt;
        // if (this.collectibleSpawnTimer >= this.collectibleSpawnTimer) {
        //     if (this.collectibles.length < this.maxCollectibles) {
        //         this.spawnCollectible();
        //     }
        // }
    }

    // Spawn an enemy at the edge of the level
    spawnEnemy() {
        const originalX = this.mapWidth - (this.tileWidth / 2) + 128;
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // let spawnX = originalX;
        // let spawnY = originalY;

        // if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
        //     spawnX = originalX * this.k.mapScale;
        //     spawnY = this.k.mapOffsetY + (originalY * this.k.mapScale);
        // }

        const enemy = new GroundEnemy(this.k, originalX, originalY + 40);
        this.enemies.push(enemy);

        if (this.k.mapScale && this.k.mapOffsetY !== undefined) {
            enemy.updateScale(this.k.mapScale, this.k.mapOffsetY);
        }
    }

    // Initiale enemy spawn at the start of the level
    initiateSpawn() {
        this.k.wait(2, () => {
            this.initialEnemySpawn(2000);
            this.initialEnemySpawn(3000);
            this.initialEnemySpawn(4500);
        });
    }

    // Generate enemy at the start of the level at a specefic position
    initialEnemySpawn(x) {
        const originalX = x;
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // Always create with original coordinates
        const enemy = new GroundEnemy(this.k, originalX, originalY + 40);
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

    // Spawn collectibles at the start of the level
    spawnInitialCollectibles() {
        for (let i = 0; i < this.initialCollectibles; i++) {
            this.spawnCollectible();
        }
    }

    // Spawn a collectible at a random position in the level
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

    // Generate random collectible position in the level
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
        // Add new timer to the list
        this.pendingCollectibleSpawns.push(this.collectibleSpawnInterval);
    }

    // Each collectibles respawn after 3 sec after they are collected
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