import { Collectible } from "./collectible.js";
import { gameState } from "./gameState.js";
import { GroundEnemy } from "./groundEnemy.js";
import { soundManager } from "./soundManager.js";

export class GameManager {
    /**
    * Manager for these game mechanics:
    * - Manages enemies and collectibles lifecycle (spawn, update, resize, destruction).
    * - React to level resize events and rescale active objects.
    * - Handle collisions between player, enemies and collectibles.
    * 
    */

    /**
    * 
    * @param {*} k             Kaplay game instance
    * @param {*} levelControl  Provides level dimensions, scale values and responsive layout data
    */
    constructor(k, levelControl) {
        this.k = k;
        this.levelControl = levelControl;                       // Data describing the current level and scale state

        // Game objects management
        this.enemies = [];                                      // Active enemies currently in the level
        this.collectibles = [];                                 // Active collectibles currently in the level

        // Enemy spawning properties
        this.enemySpawnTimer = 0;                               // Time elapsed since the last spawn
        this.enemySpawnInterval = Math.random() * (3 - 2) + 2;  // Random interval 2-3 seconds

        // Collectible spawning properties
        this.maxCollectibles = 8;                               // Maximum number of collectibles in the level
        this.collectibleRespawnDelay = 3;                       // Delay before respawning a collected item

        this.playerJumpingHeight = 400;

        // Score Management
        this.score = 0;
        this.bestScore = 0;
        this.isBestScore = false;
        this.scorePanel = document.getElementById("scorePanel");
        this.scoreText = document.getElementById("scoreText");
        this.bestScoreText = document.getElementById("bestScoreText");

        // Initial setup
        this.updateLevelData();
        this.setupCollisions();
        this.initialEnemiesSpawn();
        this.setupSpawning();
        this.spawnInitialCollectibles();
        this.resetScoreUI();
        this.displayScoreUI();
    }

    /**
    * Setup collision detection handlers for the player, the enemies and the collectibles.
    */
    setupCollisions() {

        // Triggered when the player collides with a collectible
        // The collectible is destroyed and scheduled for respawn.
        this.k.onCollide("player", "collectible", (player, collectible) => {
            const indexCollectible = this.collectibles.findIndex(element => element.gameObject === collectible);
            if (indexCollectible != -1) {
                // Destroy the collectible
                this.collectibles[indexCollectible].collect();
                // Award points
                this.changeScore(5);
                // Remove from active collectibles
                this.collectibles.splice(indexCollectible, 1);
                // Schedule respawn after delay
                this.spawnCollectibleAfterDelay(this.collectibleRespawnDelay);
            }
        });

        // Triggered when the player collides with an enemy
        // The enemy is destroyed
        this.k.onCollide("player", "enemy", (player, enemy) => {

            const indexEnemy = this.enemies.findIndex(element => element.gameObject === enemy);
            if (indexEnemy != -1) {
                // Destroy the enemy
                this.enemies[indexEnemy].destroy();
                // Penalty points
                this.changeScore(-10);
                // Remove from active enemies
                this.enemies.splice(indexEnemy, 1);

                // Hurt animation
                this.k.tween(this.k.RED, this.k.WHITE, 0.15, (p) => player.color = p);
                soundManager.playSound("hitSFX");
            }
        });
        // Triggered when an enemy exits the level on the left side
        // The enemy is destroyed
        this.k.onCollide("enemy", "borderLeft", (enemy) => {
            const indexCollectible = this.enemies.findIndex(element => element.gameObject === enemy);
            if (indexCollectible != -1) {
                // Destroy and remove the enemy that left the level
                this.enemies[indexCollectible].destroy();
                this.enemies.splice(indexCollectible, 1);
            }
        });

    }

    // --------- Enemies ---------

    /**
    * Spawns a small group of enemies at fixed ratios
    * shortly after the level starts.
    */
    initialEnemiesSpawn() {
        let initialEnemies = {
            firstEnemy: {
                offsetFromFloor: -10,           // Y offset from the floor
                spawnXRatio: 0.5,               // Relative horizontal position on the level
            },
            secondEnemy: {
                offsetFromFloor: -10,
                spawnXRatio: 0.6,
            },
            thirdEnemy: {
                offsetFromFloor: -10,
                spawnXRatio: 0.7,
            },
            fourthEnemy: {
                offsetFromFloor: -10,
                spawnXRatio: 0.8,
            },
        }
        this.k.wait(2, () => {
            this.spawnEnemyAtRatio(initialEnemies.firstEnemy);
            this.spawnEnemyAtRatio(initialEnemies.secondEnemy);
            this.spawnEnemyAtRatio(initialEnemies.thirdEnemy);
            this.spawnEnemyAtRatio(initialEnemies.fourthEnemy);
        });
    }

    /**
     * Spawn an enemy at a specific ratio on the level width
     * and with a specefic offset from the floor.
     * 
     * @param {object} enemyConfig  // Object that contains the x ratio (relative horizontal position on the level)
     *                              // and y offset from the floor
     */
    spawnEnemyAtRatio(enemyConfig) {
        const enemy = new GroundEnemy(this.k, this.levelData, enemyConfig);
        this.enemies.push(enemy);
    }

    /**
     * Setup the spawning system that runs every frame.
     * Manages enemy spawn timers and collectible respawn timers.
     */
    setupSpawning() {
        this.k.onUpdate(() => {
            // Don't spawn while game is paused
            if (gameState.isGamePaused) return;

            const dt = this.k.dt();

            // Increment enemy spawn timer
            this.enemySpawnTimer += dt;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                // Spawn new enemy and reset timer
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
                this.enemySpawnInterval = Math.random() * (3 - 2) + 2; // Random interval 2-3 seconds
            }
        });
    }

    /**
     * Spawn a new enemy at the right edge of the level.
     */
    spawnEnemy() {
        const enemy = new GroundEnemy(this.k, this.levelData, {
            offsetFromFloor: -10,
            spawnXRatio: 1.1,
        });
        this.enemies.push(enemy);
    }

    // --------- Collectibles ---------

    /**
    * Spawn initial collectibles at the start of the level.
    */
    spawnInitialCollectibles() {
        for (let i = 0; i < this.maxCollectibles; i++) {
            this.spawnCollectible();
        }
    }

    /**
    * Spawns a collectible at a random valid position in the level.
    * 
    * The position is converted into relative ratios (spawnXRatio / spawnYRatio)
    * so collectibles can be correctly repositioned after a resize.
    */
    spawnCollectible() {
        // Don't spawn if at maximum capacity
        if (this.collectibles.length >= this.maxCollectibles) return;

        // Horizontal margins scaled with the level
        // This prevents collectibles from spawning too close to the edges
        const marginX = this.levelData.scaleX * 128;
        const minX = marginX;
        const maxX = this.levelData.width - marginX;

        // Vertical spawn range
        // Keeps the collectible above the floor and prevent
        // spawning higher then the player's jump height
        const minY = this.levelData.floorY - (120 * this.levelData.scaleY);

        // spriteScaleRatio is required here because of the player jump height
        // is defined in "visual space" and must stay consistent across sprite sets.
        const maxY = this.levelData.floorY - (this.playerJumpingHeight * this.levelData.scaleY * this.levelData.spriteScaleRatio);

        // Random absolute spawn position
        const spawnX = this.k.rand(minX, maxX);
        const spawnY = this.k.rand(minY, maxY);

        const spawnRatioX = spawnX / this.levelData.width;
        const spawnRatioY = spawnY / this.levelData.height;

        const collectible = new Collectible(this.k, this.levelData, spawnRatioX, spawnRatioY);

        this.collectibles.push(collectible);
    }

    /**
    * Respawns a collectible after a delay.
    * 
    * If the game is paused when the delay finishes,
    * the respawn is deferred until the game resumes.
    */
    spawnCollectibleAfterDelay(delay) {
        this.k.wait(delay, () => {
            // If the game is paused then we wait 1 second then check again
            // if we can now spawn the collectible.
            if (gameState.isGamePaused) {
                this.spawnCollectibleAfterDelay(1);
            }
            else {
                this.spawnCollectible();
            }
        });
    }

    /**
    * Called when the window is resized.
    * 
    * Enemies preserve their traveled distance using the old level width.
    * Collectibles reposition themselves using their stored spawn ratios.
    */
    onResize() {
        if (!this.levelControl || !this.levelData) return;

        /**
        * We store the old width before recalculating levelData.
        * This allows enemies to convert their absolute position
        * back into a relative ratio.
        */
        const oldLevelWidth = this.levelData.width;

        this.updateLevelData();

        // Update all active enemies with new scaling
        this.enemies.forEach(enemy => {
            if (enemy && enemy.gameObject) {
                enemy.updateScale(oldLevelWidth, this.levelData);
            }
        });

        // Update all active collectibles with new scaling
        this.collectibles.forEach(collectible => {
            if (collectible && collectible.gameObject) {
                collectible.updateScale(this.levelData);
            }
        });
    }

    /**
     * Refresh levelData using the latest level dimensions and scale ratios.
     */
    updateLevelData() {
        const dims = this.levelControl.getLevelDimensions();
        const { scaleX, scaleY } = this.levelControl.getCurrentScale();

        this.levelData = {
            width: dims.width,                                          // Current level width in world units
            height: dims.height,                                        // Current level height in world units
            floorY: dims.floorY,                                        // Y position of the ground
            scaleX: scaleX,                                             // Horizontal scaling factor
            scaleY: scaleY,                                             // Vertical scaling factor
            spriteScaleRatio: this.levelControl.spriteScaleRatio,       // Visual size consistency
            speedMultiplier: this.levelControl.speedMultiplier,         // Gameplay speed consistency
        }
    }

    /**
     * Display the score and best score.
     */
    displayScoreUI() {
        this.scorePanel.style.display = "flex";
    }

    /**
     * Update the score.
     * @param {number} amountScore The amount we must add or substract from the score.
     */
    changeScore(amountScore) {
        const previousScore = this.score;

        // Update score and clamp to valid range
        this.score = Math.max(0, Math.min(999, this.score + amountScore));

        // Update only when the score changed
        if (this.score !== previousScore) {
            this.updateScoreUI();
        }
    }

    /**
     * Reset UI score in case the player left the game and start a new game.
     */
    resetScoreUI() {
        this.score = 0;
        this.bestScore = 0;
        this.isBestScore = false;
        this.scoreText.textContent = "0";
        this.scoreText.style.color = "#00ffff";
        this.bestScoreText.textContent = "Record : 0";
    }

    /**
     * Update the UI for the score.
     */
    updateScoreUI() {

        // Case 1: We have a new best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.isBestScore = true;
            this.scoreText.textContent = this.bestScore;
            this.scoreText.style.color = rgb(255, 215, 0);
            this.bestScoreText.textContent = "NOUVEAU RECORD!"
        }
        // Case 2: Normal display of the score and best score
        // The score is no longer the best score
        else if (this.isBestScore) {
            this.scoreText.textContent = this.score;
            this.scoreText.style.color = "#00ffff";
            this.bestScoreText.textContent = "Record : " + this.bestScore;
        }

    }

}