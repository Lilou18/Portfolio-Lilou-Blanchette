import { Collectible } from "./collectible.js";
import { GroundEnemy } from "./groundEnemy.js";
import { gameState } from "./gameState.js";
// import { soundManager } from "./soundManager.js";

export class GameManager {
    /**
     * Manager for these game mechanics:
     * - Enemy spawning and management
     * - Collectible spawning and management
     * - Score tracking and UI updates
     * - Collision detection between player, enemies, and collectibles
     */

    /**
     * 
     * @param {Object} k k - Kaplay game instance
     * @param {number} mapWidth Total width of the map in pixels
     * @param {number} mapHeight Total height of the map in pixels
     * @param {number} tileWidth Width of a single tile
     * @param {number} tileHeight Height of a single tile
     */
    constructor(k, mapWidth, mapHeight, tileWidth, tileHeight) {
        this.k = k;

        // Map dimensions
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        // Score management
        this.score = 0;                                         // Current score of the player
        this.bestScore = 0;                                     // Best score of the player
        this.isBestScore = false;                               // Flag when displaying the best score

        // Game objects management
        this.enemies = [];
        this.collectibles = [];
        this.levelControl = null;                               // Reference to level control for scaling

        // Enemy spawning properties
        this.enemySpawnTimer = 0;                               // Time elapsed since the last spawn
        this.enemySpawnInterval = Math.random() * (3 - 2) + 2;  // Random interval 2-3 seconds

        // Physics constants
        this.playerJumpHeight = 200;                                // Maximum height the player can jump
        this.groundLevel = this.mapHeight - (this.tileHeight * 2);  // Y coordinate of ground

        // Collectible spawning properties
        this.collectibleSpawnInterval = 3;                      // Delay before respawning collected item
        this.maxCollectibles = 8;                               // Maximum collectibles on screen at once
        this.initialCollectibles = 8;                           // Number to spawn at level start
        this.pendingCollectibleSpawns = [];                     // Queue of collectibles waiting to spawn

        // UI positioning constants for the score
        this.UI_PADDING_X = 20;                                 // Left padding for score and best score elements
        this.UI_SCORE_Y = 50;                                   // Y position when only showing best score
        this.UI_SCORE_Y_V2 = 20;                                // Y position of current score
        this.UI_BEST_SCORE_Y = 70;                              // Y position of best score
        this.UI_PANEL_X = 10;                                   // X position of background panel
        this.UI_PANEL_Y = 10;                                   // Y position of background panel

        // Initialize game systems
        this.setupUI();
        this.setupCollisions();
        this.setupSpawning();
        this.initiateSpawn();
        this.spawnInitialCollectibles();
    }

    /**
     * Set the level control reference for accessing scaling and map data.
     * 
     * @param {Object} levelControl Reference to the level control object
     */
    setLevelControl(levelControl) {
        this.levelControl = levelControl;
    }

    /**
     * Setup the score display UI elements
     * Creates the score text, best score text, and background panel
     */
    setupUI() {

        // Current score display
        this.scoreText = this.k.add([
            this.k.text(`Énergie: ${this.score}`, {
                size: 30,
                font: "orbitron"
            }),
            this.k.pos(20, 50),
            this.k.color(0, 255, 255),
            this.k.fixed(),
            this.k.z(2),
            "scoreUI"
        ]);

        // Best score display
        this.bestScoreText = this.k.add([
            this.k.text(``, {
                size: 30,
                font: "orbitron"
            }),
            this.k.pos(20, 70),
            this.k.color(0, 255, 255),
            this.k.fixed(),
            this.k.z(2),
            "bestScoreUI"
        ]);

        // Semi-transparent background panel for readability
        this.backgroundScore = this.k.add([
            this.k.rect(410, 100, { radius: 8 }),
            this.k.opacity(0.7),
            this.k.fixed(),
            this.k.pos(10, 10),
            this.k.color(8, 45, 103),
            this.k.outline(4, rgb(0, 255, 255)),
            this.k.z(1)
        ]);


    }

    /**
     * Update the player's score.
     * Adjusts UI layout based on the current state.
     * 
     * @param {number} amountScore The amount the score must change (positive or negative)
     */
    changeScore(amountScore) {
        // Update score and clamp to valid range
        this.score += amountScore;
        if (this.score < 0) {
            this.score = 0;
        }
        if (this.score > 999) {
            this.score = 999;
        }

        // Get current map scaling for UI positioning
        const { scaleX, scaleY } = this.levelControl ? this.levelControl.getCurrentScale() : { scaleX: 1, scaleY: 1 };

        // If current score exceeds best score then display only the best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreText.text = `Meilleure Énergie: ${this.bestScore}`;
            this.bestScoreText.color = rgb(255, 215, 0);
            this.bestScoreText.pos = this.k.vec2(
                this.UI_PADDING_X * scaleX,
                this.UI_SCORE_Y * scaleY
            );
            this.scoreText.text = ``; // Hide current score
            this.isBestScore = true;
        }
        // Transition from best score display back to normal display
        // Display the current score and the best score the player ever had
        else if (this.isBestScore) {
            this.isBestScore = false;
            this.scoreText.pos = this.k.vec2(
                this.UI_PADDING_X * scaleX,
                this.UI_SCORE_Y_V2 * scaleY
            );
            this.bestScoreText.pos = this.k.vec2(
                this.UI_PADDING_X * scaleX,
                this.UI_BEST_SCORE_Y * scaleY
            );
            this.bestScoreText.color = rgb(0, 255, 255);
            this.scoreText.text = `Énergie: ${this.score}`;
        }
        // At the start only display the current score
        else {
            this.scoreText.text = `Énergie: ${this.score}`;
        }
    }

    /**
     * Update all game objects when the map is resized or scaled.
     * 
     */
    updateScale() {
        if (!this.levelControl) return;

        const { scaleX, scaleY } = this.levelControl.getCurrentScale();
        const mapOffsetY = this.levelControl.getMapOffsetY();

        // Update all active enemies with new scaling
        this.enemies.forEach(enemy => {
            if (enemy && enemy.gameObject) {
                enemy.updateScale(scaleX, scaleY, mapOffsetY);
            }
        });

        // Update all active collectibles with new scaling
        this.collectibles.forEach(collectible => {
            if (collectible && collectible.gameObject) {
                collectible.updateScale(scaleX, scaleY, mapOffsetY);
            }
        });

        // Update UI text positioning and scale
        this.updateScoreUI(scaleX, scaleY);
    }

    /**
     *  Update score UI elements' position and scale based on current map scaling.
     *  Handles different layouts depending on which scores are displayed.
     * 
     * @param {number} scaleX Horizontal scale factor
     * @param {number} scaleY Vertical scale factor
     */
    updateScoreUI(scaleX, scaleY) {
        // Apply scaling to all UI elements
        this.scoreText.scale = this.k.vec2(scaleX, scaleY);
        this.bestScoreText.scale = this.k.vec2(scaleX, scaleY);
        this.backgroundScore.scale = this.k.vec2(scaleX, scaleY);

        // Adjust positions based on which scores are displayed
        if (this.isBestScore) {
            // Only best score is displayed
            this.bestScoreText.pos = this.k.vec2(
                this.UI_PADDING_X * scaleX,
                this.UI_SCORE_Y * scaleY  // Le best score prend la place du score
            );
            // Le score est vide donc sa position n'importe pas, mais on la met quand même
            // this.scoreText.pos = this.k.vec2(
            //     this.UI_PADDING_X * scaleX,
            //     this.UI_BEST_SCORE_Y * scaleY
            // );
        } else {
            // Display only the current score
            if (this.bestScore == 0) {
                this.scoreText.pos = this.k.vec2(
                    this.UI_PADDING_X * scaleX,
                    50 * scaleY
                );
            }
            else {
                // Display both current and best scores
                this.scoreText.pos = this.k.vec2(
                    this.UI_PADDING_X * scaleX,
                    this.UI_SCORE_Y_V2 * scaleY
                );
                this.bestScoreText.pos = this.k.vec2(
                    this.UI_PADDING_X * scaleX,
                    this.UI_BEST_SCORE_Y * scaleY
                );
            }
        }

        // Update background panel position
        this.backgroundScore.pos = this.k.vec2(
            this.UI_PANEL_X * scaleX,
            this.UI_PANEL_Y * scaleY
        );
    }

    /**
     * Setup collision detection handlers for the player, the enemies and the collectibles.
     */
    setupCollisions() {

        // Collision when a player picks up a collectible
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
                this.startCollectibleSpawnTimer();
            }
        });

        // Collision when the player hits an enemy
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
                //soundManager.playSound("hitSFX");
            }
        });
        // Collision between the enemy and the left border of the map
        this.k.onCollide("enemy", "borderLeft", (enemy) => {
            const indexCollectible = this.enemies.findIndex(element => element.gameObject === enemy);
            if (indexCollectible != -1) {
                // Destroy and remove the enemy that left the level
                this.enemies[indexCollectible].destroy();
                this.enemies.splice(indexCollectible, 1);
            }
        });

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
            }

            // Update collectible respawn timers
            this.updateCollectibleSpawnTimers(dt);
        });
    }

    /**
     * Spawn a new enemy at the right edge of the level.
     */
    spawnEnemy() {
        // Calculate spawn position (right edge of map, slightly off-screen)
        const originalX = this.mapWidth - (this.tileWidth / 2) + 128;
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // Create new enemy
        const enemy = new GroundEnemy(this.k, originalX, originalY + 40);
        this.enemies.push(enemy);

        // Apply current scaling to new enemy
        if (this.levelControl) {
            const { scaleX, scaleY } = this.levelControl.getCurrentScale();
            const mapOffsetY = this.levelControl.getMapOffsetY();

            enemy.updateScale(scaleX, scaleY, mapOffsetY);
        }
    }

    /**
     * Creates enemies for initial challenge at the start of the level.
     */
    initiateSpawn() {
        this.k.wait(2, () => {
            this.initialEnemySpawn(2500);
            this.initialEnemySpawn(3000);
            this.initialEnemySpawn(4500);
        });
    }

    /**
     * Spawn an enemy at a specific position.
     * 
     * @param {number} x : X position to spawn the enemy
     */
    initialEnemySpawn(x) {
        const originalX = x;
        const originalY = this.mapHeight - (this.tileHeight * 2);

        // Create enemy at specified position
        const enemy = new GroundEnemy(this.k, originalX, originalY + 40);
        this.enemies.push(enemy);

        // Apply current scaling
        if (this.levelControl) {
            const { scaleX, scaleY } = this.levelControl.getCurrentScale();
            const mapOffsetY = this.levelControl.getMapOffsetY();

            enemy.updateScale(scaleX, scaleY, mapOffsetY);
        }
    }

    // Collectibles

    /**
     * Spawn initial collectibles at the start of the level.
     */
    spawnInitialCollectibles() {
        for (let i = 0; i < this.initialCollectibles; i++) {
            this.spawnCollectible();
        }
    }

    /**
     * Spawn a single collectible at a random position in the level.
     */
    spawnCollectible() {
        // Don't spawn if at maximum capacity
        if (this.collectibles.length >= this.maxCollectibles) {
            return;
        }

        // Generate random position within the level bounds
        const { x, y } = this.generateRandomCollectiblePosition();
        const collectible = new Collectible(this.k, x, y);
        this.collectibles.push(collectible);

        // Apply the current scaling to the new collectible
        if (this.levelControl) {
            const { scaleX, scaleY } = this.levelControl.getCurrentScale();
            const mapOffsetY = this.levelControl.getMapOffsetY();

            collectible.updateScale(scaleX, scaleY, mapOffsetY);
        }
    }

    /**
     * Generate a random position for a collectible within the level.
     * Keeps collectibles away from edges and within the player jump range.
     * 
     * @returns {Object} Object with x and y properties for the collectible position
     */
    generateRandomCollectiblePosition() {
        // Avoid spawning on the level edges
        const minX = this.tileWidth * 2;
        const maxX = this.mapWidth - (this.tileWidth * 2);

        // Keep within the player jump range
        const groundY = this.groundLevel;
        const maxY = this.groundLevel - this.playerJumpHeight;

        // Generate a random position
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - groundY) + groundY - 50;
        return { x, y };
    }

    /**
     * Start a respawn timer for a collected collectible.
     * Adds the timer to the pending spawns queue.
     */
    startCollectibleSpawnTimer() {
        // Add new timer to the list
        this.pendingCollectibleSpawns.push(this.collectibleSpawnInterval);
    }

    /**
     * Update all pending collectible respawn timers.
     * Spawns new collectible when the timer reaches zero.
     * 
     * @param {number} dt Delta time
     */
    updateCollectibleSpawnTimers(dt) {
        for (let i = this.pendingCollectibleSpawns.length - 1; i >= 0; i--) {
            // Decrement the timer
            this.pendingCollectibleSpawns[i] -= dt;

            // Spawn new collectible when the timer expires
            if (this.pendingCollectibleSpawns[i] <= 0) {
                this.spawnCollectible();
                this.pendingCollectibleSpawns.splice(i, 1);
            }
        }
    }

}