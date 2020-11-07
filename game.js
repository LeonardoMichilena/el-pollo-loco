// General variables
let canvas;
let ctx;
let endScreenOn = false;
let gameIsOver = false;

//sounds variables
let AUDIO_WALK = new Audio('./audio/walk.mp3');
let AUDIO_JUMP = new Audio('./audio/jump.mp3');
let AUDIO_SNORING = new Audio('./audio/snoring.mp3');
let AUDIO_YAWNING = new Audio('./audio/yawning.mp3');
let AUDIO_BGMUSIC1 = new Audio('./audio/bgSound-1.mp3');
let AUDIO_BGMUSIC3 = new Audio('./audio/bgSound-3.mp3');
let AUDIO_DEAD = new Audio('./audio/ayayay.mp3');
let AUDIO_COIN = new Audio('./audio/coin.mp3');
let AUDIO_BOSS1 = new Audio('./audio/boss_sound1.mp3');
let AUDIO_SPLASH = new Audio('./audio/splash1.mp3');

AUDIO_COIN.volume = 0.3;
AUDIO_BOSS1.volume = 0.5;

AUDIO_BGMUSIC1.volume = 0.2;
AUDIO_BGMUSIC3.volume = 0.2;

let AUDIO_ENEMYDYING = new Audio('./audio/chicken-dying.mp3');

//JSON for the Graphics/Animations
let graphics = {};

//Variables for the clouds & background
let CLOUDINTENSITY = 5;
let CLOUDSPEED = 1;

let cloudSettings = [];
let bgImgSettings = {};
let bgCounter = 0;

//Variables for the character
let character_x = 300;
let character_y = 220;

let JUMP_HEIGHT = 120;
let CHARACTER_SCALE = 0.2;
let JUMPSTOP = character_y - JUMP_HEIGHT;
let FALLSTOP = character_y;

let isMovingLeft = false;
let isMovingRight = false;
let isJumping = false;
let isFalling = false;
let lastMoveForward = true;
let characterIsHurt = false;

//Variables for the enemies
//Intensity in pairs: 1 equals to 1 pollito & 1 gallinita
let ENEMYINTENSITY = 2;
let enemySettings = {};
let enemyCounter = 0;
let enemyGraphicsInterval = 20;
//Final Boss Variables
let bossMovingRight;
let bossCounter = 0;
let bossIsAttacking = false;
let bossSpeed = 2;
let bossIsHurt = false;

//Variables for the bottle throw
let BOTTLE_NUMBER = 10;
let takeBottle = false;
let bottleThrowTime = 3500;
let bottleX;
let bottleY;
let throwStartTime; // Last throw of bottle


// Variables for the bars and markers
let COIN_NUMBER = ENEMYINTENSITY * 20;
let collectableObject = {};


function init() {
    //Defines the canvas from the html tag and creates a context for drawing
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    //Adds all graphics in arrays in the graphics object
    addGraphics();
    loadAllImages();
    draw();
    listenForKeys();
}

/**
 * Initializes the necesary drawings for the game
 *  */
function draw() {
        drawSky();
        drawBackground();
        drawCollectables();
        drawAllEnemies();
        drawCharacter();
        drawObject("life-bar", 0, 0, 0.35, 0.15);
    
        drawObject("bottle-icon", 0, 70, 0.1, 0.15);
        drawText(collectableObject["bottle1"].count, "50px Arial", 60, 130);
    
        drawObject("coin-icon", 120, 70, 0.08, 0.15);
        drawText(collectableObject["coin"].count + "/" + (COIN_NUMBER + (ENEMYINTENSITY * 2)), "50px Arial", 185, 130);    

    if (endScreenOn) {
        drawObject("boss-bar", canvas.width - 350, 10, 0.35, 0.15);
    }

    drawThrowBottle();
    //Automatically sets the animation frame request interval, flackering decreases
    if(!gameIsOver) requestAnimationFrame(draw);
}

/**
 * Draws all collectable objects for the game
 */
function drawCollectables() {
    for (i = 0; i < COIN_NUMBER; i++) {
        drawCollectableObject(i, "coin", COIN_NUMBER, randomNum(character_y - 100, character_y), 0.5, 0.5);
    }

    for (i = 0; i < BOTTLE_NUMBER; i++) {
        drawCollectableObject(i, "bottle1",BOTTLE_NUMBER, 250, 0.2, 0.25);
    }
}

/**
 * Draws sky and clouds
 */
function drawSky() {
    drawObject("bgCielo", 0, 0, 1, 1);
    //Draws clouds depending on the intensity assigned at the beginning
    for (i = 0; i < CLOUDINTENSITY; i++) {
        drawCloud(i);
    }
}

/**
 * Creates new clouds and sets random settings
 * @param {*} i Index for the new cloud in the array
 */
function drawCloud(i) {
    //if the clouds array is empty, create new cloud with random parameters
    //or if the clouds are out of screen, start new cloud with random parameters
    if (cloudSettings[i] == undefined || cloudSettings[i].x <= -(canvas.width * 2) * cloudSettings[i].size) {
        cloudSettings[i] = {
            type: randomNum(1, 2),
            x: randomNum(canvas.width, canvas.width + 300),
            y: randomNum(0, 40),
            size: randomNum(0.2, 0.7),
            speed: randomNum(0.1, 0.7)
        };
    }
    //Cloud offsetting depending on each cloud's speed & if character moves left or right
    cloudSettings[i].x = cloudSettings[i].x - (cloudSettings[i].speed * CLOUDSPEED);
    if (isMovingLeft && !endScreenOn) cloudSettings[i].x++;
    else if (isMovingRight && !endScreenOn) cloudSettings[i].x--;
    //Assigns and draws the cloud image, depending on the type, to the variable from the graphics array
    let img = graphics.clouds.cachedImages[cloudSettings[i].type - 1];
    ctx.drawImage(img, cloudSettings[i].x, cloudSettings[i].y, img.width * cloudSettings[i].size, img.height * cloudSettings[i].size);
}

/**
 * Adds ground and background images, from most far away to closest background
 */
function drawBackground() {
    ctx.fillStyle = "#ffe699";
    ctx.fillRect(0, canvas.height - (canvas.height / 3), canvas.width, canvas.height);
    addBackgroundImage("bg3", 150, 1);
    addBackgroundImage("bg2", 140, 5);
    addBackgroundImage("bg1", canvas.height / 4, 9);

    bgCounter = 0;
}

/**
 * Adds background images given in pairs, and makes an infinite background
 * @param {*} name Name of the background image, I.E.: file name is bg1-1.png, name will be 'bg1' 
 * @param {*} y Coordinate for the background to be positioned
 * @param {*} offsetSpeed Backgrounds further away should have a slower offset speed
 */
function addBackgroundImage(name, y, offsetSpeed) {
    if (bgImgSettings[bgCounter] == undefined) bgImgSettings[bgCounter] = { x: [-canvas.width, 0], y: y, offsetSpeed: offsetSpeed };
    let img = [];
    for (i = 0; i < 2; i++) {
        img[i] = graphics[name].cachedImages[i];
        //background reapears on the other side when offscreen, making the background infinite
        if (bgImgSettings[bgCounter].x[i] < -canvas.width) bgImgSettings[bgCounter].x[i] = bgImgSettings[bgCounter].x[i] + (canvas.width * 2);
        if (bgImgSettings[bgCounter].x[i] > canvas.width) bgImgSettings[bgCounter].x[i] = bgImgSettings[bgCounter].x[i] - (canvas.width * 2);
        //Background moves when character is moving, offset will be slower for further away backgrounds
        if (isMovingLeft && !characterIsHurt && !endScreenOn) {
            bgImgSettings[bgCounter].x[i] = bgImgSettings[bgCounter].x[i] + offsetSpeed;
        }
        else if (isMovingRight && !characterIsHurt && !endScreenOn) {
            bgImgSettings[bgCounter].x[i] = bgImgSettings[bgCounter].x[i] - offsetSpeed;
        }
        ctx.drawImage(img[i], bgImgSettings[bgCounter].x[i], (1 / (img[i].height / canvas.height)) * 10 - y, img[i].width * (1 / (img[i].width / canvas.width)), img[i].height * (1 / (img[i].width / canvas.width)));
    }

    bgCounter++;
}

/**
 * Character animations when standing, moving, jumping or dead
 */
function drawCharacter() {
    let img;
    img = checkForStanding(img);
    img = checkForMoving(img);
    img = checkForJump(img);
    img = checkForHurt(img);

    //When moving left, mirrors the images to the left side, and it's not the end screen
    //if(isMovingLeft || !lastMoveForward) {
    if ((isMovingLeft || !lastMoveForward) && !isMovingRight && !endScreenOn) {
        ctx.save();
        ctx.translate(img.width + 120, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(img, character_x, character_y, img.width * CHARACTER_SCALE, img.height * CHARACTER_SCALE);
    ctx.restore();
}

/**
 * Checks if character is hurt, then adjusts the corresponding sounds and returns an image
 * @param {*} image image from the graphics
 */
function checkForHurt(image) {
    if (characterIsHurt) {
        AUDIO_SNORING.pause();
        AUDIO_WALK.pause();
        AUDIO_JUMP.pause();
        graphics.standing.counter = 0;
        image = graphics.dead.cachedImages[graphics.dead.index];
        animateGraphic(graphics.dead, 3);
    }
    return image;
}

/**
 * Checks if is jumping, makes the character jump and then adjusts the corresponding sounds and returns an image
 * @param {*} image image from the graphics
 */
function checkForJump(image) {
    if (isJumping && !isFalling && !characterIsHurt) {
        if (character_y > JUMPSTOP) {
            character_y = character_y - 10;
        }
        else if (character_y < FALLSTOP) {
            isFalling = true;
            isJumping = false;
        }
    } else if (isFalling && character_y < FALLSTOP && !characterIsHurt) character_y = character_y + 10;
    else if (character_y > FALLSTOP - 1) {
        graphics.jump.index = 0;
        isFalling = false;
    }
    if ((isJumping || isFalling) && !characterIsHurt) {
        AUDIO_SNORING.pause();
        AUDIO_WALK.pause();
        AUDIO_JUMP.play();
        graphics.standing.counter = 0;
        image = graphics.jump.cachedImages[graphics.jump.index];
        animateGraphic(graphics.jump, 3);
    }
    return image;
}

/**
 * Checks if the character is moving left or right, then adjusts the corresponding sounds and returns an image
 * @param {*} image image from the graphics
 */
function checkForMoving(image) {
    if ((isMovingRight || isMovingLeft) && !characterIsHurt) {
        AUDIO_SNORING.pause();
        AUDIO_JUMP.pause();
        AUDIO_WALK.play();
        graphics.standing.counter = 0;
        image = graphics.walk.cachedImages[graphics.walk.index];
        animateGraphic(graphics.walk, 5);
    }
    if (endScreenOn) {
        if (isMovingRight) {
            character_x += 5;
        } else if (isMovingLeft && character_x > -15){
            character_x -= 5;
        }
    }
    return image;
}

/**
 * Checks if the character is standing, then adjusts the corresponding sounds and returns an image
 * @param {*} image image from the graphics
 */
function checkForStanding(image) {
    if (!isMovingLeft && !isMovingRight && !isJumping && !characterIsHurt) {
        AUDIO_JUMP.pause();
        AUDIO_WALK.pause();
        graphics.jump.counter = 0;
        if (graphics.standing.counter <= 500) image = graphics.standing.cachedImages[0];
        else if (graphics.standing.counter < 1000) {
            AUDIO_YAWNING.play();
            image = graphics.idle.cachedImages[graphics.idle.index];
            animateGraphic(graphics.idle, 30);
        } else if (graphics.standing.counter >= 1000) {
            AUDIO_YAWNING.pause();
            AUDIO_SNORING.play();
            image = graphics.sleep.cachedImages[graphics.sleep.index];
            animateGraphic(graphics.sleep, 30);
        }
        graphics.standing.counter++;
    }
    return image;
}

function drawThrowBottle() {

    if(takeBottle || throwStartTime) {
        bottleY = character_y + 25;
        bottleX = character_x + 50;
        
        if (throwStartTime) {
            takeBottle = false;
            let timePassed = new Date().getTime() - throwStartTime;
            let gravity = Math.pow(9.81,timePassed / 200);
            bottleX = bottleX + (timePassed * 0.6);
            bottleY = bottleY - (timePassed * 0.3 -gravity);
        } 
        if(bottleY > canvas.height){
            throwStartTime = undefined;
            bottleY = "";
            bottleX = "";
        }
        animateGraphic(graphics.botella,10);
        drawObject("botella", bottleX, bottleY, 0.07, 0.15);
    }
    
}

/**
 * Changes the graphic's index for the current action
 * @param {*} graphicName Inside the graphics json, the animation name
 * @param {*} intervalPerMs Check for action every X ms 
 */
function animateGraphic(graphicName, intervalPerMs) {
    graphicName.counter++;
    if (graphicName.counter > intervalPerMs) {
        graphicName.index++;
        graphicName.counter = 0;
    }
    if (graphicName.index > graphicName.cachedImages.length - 1) graphicName.index = 0;
}

/**
 * Draws all enemies for the game and then resets the enemy counter
 */
function drawAllEnemies() {
    for (i = 0; i < ENEMYINTENSITY; i++) {
        drawEnemy("pollito", 0.35, 220,);
        drawEnemy("gallina", 0.35, 220);
    }
    //Final Enemy
    drawEnemy("boss-walk", 0.4, -150);
    enemyCounter = 0;
}

/**
 * Creates and draws new enemy on the canvas
 * @param {*} type Type of enemy, also graphic name
 * @param {*} sizeScale Number to scale the enemy, 1 is the original image size
 * @param {*} y coordinate to locate the enemy
 */
function drawEnemy(type, sizeScale, y) {

    if (enemySettings[enemyCounter] == undefined) {
        enemySettings[enemyCounter] = {
            type: type,
            x: (enemyCounter + 1) * randomNum(canvas.width, canvas.width * 1.5),
            y: y,
            size: sizeScale,
            speed: randomNum(1, 2),
            isDead: false
        }
    }
    let img;
    img = updateEnemy(img);
    checkForEnemyCollision();
    checkForBottleEnemyCollision();
    animateGraphic(graphics[enemySettings[enemyCounter].type], enemyGraphicsInterval);
    ctx.drawImage(img, enemySettings[enemyCounter].x, enemySettings[enemyCounter].y + 164, img.width * enemySettings[enemyCounter].size, img.height * enemySettings[enemyCounter].size);
    enemyCounter++;
}

/**
 * Updates enemies coordinates and image if enemy dies, returns image
 */
function updateEnemy(image) {
    enemySettings[enemyCounter].x = calculateOffset(enemySettings[enemyCounter].x);

    if (enemySettings[enemyCounter].type == "pollito" || enemySettings[enemyCounter].type == "gallina") {
        if (!enemySettings[enemyCounter].isDead) {
            enemySettings[enemyCounter].x = enemySettings[enemyCounter].x - enemySettings[enemyCounter].speed;
            image = graphics[enemySettings[enemyCounter].type].cachedImages[graphics[enemySettings[enemyCounter].type].index];
        } else {
            //If enemy is dead, draws dead Enemy
            let deadName = `${enemySettings[enemyCounter].type}-dead`;
            image = graphics[deadName].cachedImages[graphics[deadName].index];
        }
    } else {
        image = updateFinalBoss(image);
        checkForEndScreen();
    }
    return image;
}

/**
 * Checks if the Final Boss is near and activates the End screen of the game and the sounds and bg music
 */
function checkForEndScreen() {
    if (character_x >= enemySettings[enemyCounter].x - 800) {
        AUDIO_BOSS1.play();
        AUDIO_BOSS1.loop = true;
    } else AUDIO_BOSS1.pause();
    if (character_x >= enemySettings[enemyCounter].x - 300 && !endScreenOn) {
        endScreenOn = true;
        AUDIO_BGMUSIC3.play();
        AUDIO_BGMUSIC3.loop = true;
    }
}

/**
 * Updates Final Boss graphics, movements and sounds and returns an image
 * @param {*} image 
 */
function updateFinalBoss(image) {
    //Conditions on how far and how close should the boss move depending on their position to one another and its direction
    let bossChangeDirection;
    if (bossMovingRight && enemySettings[enemyCounter].x > 400 && enemySettings[enemyCounter].x <= 700) bossChangeDirection = randomNum(150, 200);
    else if (bossMovingRight && enemySettings[enemyCounter].x > 700) bossChangeDirection = randomNum(50, 100);
    else if (!bossMovingRight && enemySettings[enemyCounter].x > 400) bossChangeDirection = randomNum(150, 200);
    else if (!bossMovingRight && enemySettings[enemyCounter].x < 400) bossChangeDirection = randomNum(50, 100);
    finalBossMovements(bossChangeDirection);
    image = graphics[enemySettings[enemyCounter].type].cachedImages[graphics[enemySettings[enemyCounter].type].index];
    return image;
}

/**
 * Sets all posible states for the final boss, and calculates its movements
 * @param {*} bossChangeDirection When counter arrives to this number, the direccion will change
 */
function finalBossMovements(bossChangeDirection) {
    if (endScreenOn) {
        if (character_x >= 200 && character_x > enemySettings[enemyCounter].x - 300 && !bossIsHurt && !bossMovingRight && !bossIsAttacking) {
            bossIsAttacking = true;
            enemySettings[enemyCounter].type = "boss-attack";
            enemyGraphicsInterval = 5;
            bossSpeed = randomNum(8, 14);
        } else if (character_x >= 150 && character_x < 250 && character_x <= enemySettings[enemyCounter].x - 400 && !bossIsHurt && !bossIsAttacking) {
            enemySettings[enemyCounter].type = "boss-alert";
            bossSpeed = 0.3;
            enemyGraphicsInterval = 15;
        } else if (!bossIsAttacking && !bossIsHurt) {
            enemySettings[enemyCounter].type = "boss-walk";
            enemyGraphicsInterval = 10;
            bossSpeed = 5;
        }
        if (bossCounter < bossChangeDirection) bossCounter++;
        else if (bossCounter >= bossChangeDirection) {
            if (bossMovingRight == undefined || !bossMovingRight) {
                bossMovingRight = true;
                bossIsAttacking = false;
            } else if ((bossMovingRight && character_x <= randomNum(250,350)) || (bossMovingRight && enemySettings[enemyCounter].x >= canvas.width - randomNum(250,350))) {
                bossMovingRight = false;
            }
            bossCounter = 0;
        }
        if (bossMovingRight) enemySettings[enemyCounter].x = enemySettings[enemyCounter].x + bossSpeed;
        else if (!bossMovingRight) enemySettings[enemyCounter].x = enemySettings[enemyCounter].x - bossSpeed;

    }
}

/**
 * Action when character collides with enemy
 */
function checkForEnemyCollision() {
    let enemy_x = enemySettings[enemyCounter].x;

    if (!enemySettings[enemyCounter].isDead && (enemySettings[enemyCounter].type == "pollito" || enemySettings[enemyCounter].type == "gallina")) {

        //Enemy dies when by colision character is falling on it and character gains 1 coin
        if (character_x >= enemy_x - 50 && character_x <= enemy_x + 40 && character_y <= 200 && character_y > 170 && isFalling && !characterIsHurt) {
            if (!enemySettings[enemyCounter].isDead) {
                AUDIO_ENEMYDYING.play();
                collectableObject["coin"].count++;
                enemySettings[enemyCounter].isDead = true;
            }
            //Character loses energy when by colision was not falling high enough or not falling at all, character loses energy
        } else if (character_x >= enemy_x - 50 && character_x <= enemy_x + 40 && character_y > 200 && !isFalling && !characterIsHurt) {
            console.log(graphics["life-bar"].index);
            if (graphics["life-bar"].index < 4) graphics["life-bar"].index++;
            else if (graphics["life-bar"].index == 4) {
                gameOver();
                graphics["life-bar"].index = 0;
            }
            AUDIO_DEAD.play();
            characterIsHurt = true;
            setTimeout(function () {
                characterIsHurt = false;
                AUDIO_DEAD.pause();
                AUDIO_DEAD.currentTime = 0;
            }, 2000);
        }
        // Colision with Final boss on End screen
    } else if (!enemySettings[enemyCounter].isDead && enemySettings[enemyCounter].type != "pollito" && enemySettings[enemyCounter].type != "gallina") {
        if (character_x >= enemy_x - 25 && character_x <= enemy_x + 40 && character_y > 200 && !isFalling && !characterIsHurt) {
            if (graphics["life-bar"].index < 4) graphics["life-bar"].index++;
            else if (graphics["life-bar"].index == 4) {
                gameOver();
                graphics["life-bar"].index = 0;
            }
            AUDIO_DEAD.play();
            characterIsHurt = true;
            setTimeout(function () {
                characterIsHurt = false;
                AUDIO_DEAD.pause();
                AUDIO_DEAD.currentTime = 0;
            }, 1500);
        }
    }
}

function checkForBottleEnemyCollision (){
    enemyX = enemySettings[enemyCounter].x;
    enemyY = enemySettings[enemyCounter].y;
    if(bottleX >= enemyX - 10 
        && bottleX <= enemyX + 10 
        && bottleY >= enemyY - 10 
        && !enemySettings[enemyCounter].isDead 
        && !endScreenOn) 
        {
        enemySettings[enemyCounter].isDead = true; 
    }
    if (endScreenOn && !bossIsHurt
        && bottleX >= enemyX - 10 
        && bottleX <= enemyX + 10
        && graphics["boss-bar"].index <= 4) 
         {
         bossHurt();
    } 
    else if(endScreenOn && !bossIsHurt
        && bottleX >= enemyX - 10 
        && bottleX <= enemyX + 10
         && graphics["boss-bar"].index == 5) {
         characterWins();
    }
}

function bossHurt(){
    bossIsHurt = true;
    enemySettings[enemyCounter].type = "boss-hurt";
    graphics["boss-bar"].index++;
    setTimeout(function () {
        bossIsHurt = false;
        // AUDIO_DEAD.pause();
        // AUDIO_DEAD.currentTime = 0;
    }, 2000);
}

/**
 * Draws and creates an array of collectable objects
 * @param {*} i index inside the object array
 * @param {*} graphicName coin
 * @param {*} x Coordinate
 * @param {*} y Coordinate
 * @param {*} width This number will be multiply for the canvas width 
 * @param {*} height This number will be multiply for the canvas height 
 */
function drawCollectableObject(i, graphicName, total_items, y, width, height) {

    //If object type does not exist, creates an object category with its counter, and its array of objects
    if (collectableObject[graphicName] == undefined) {
        collectableObject[graphicName] = {
            count: 0,
            id: []
        };
    }
    //If an object with id[i] inside the array does not exist, creates a new object at the end of the array
    if (collectableObject[graphicName].id[i] == undefined) {
        collectableObject[graphicName].id.push({
            x:randomNum((canvas.width/2 * (ENEMYINTENSITY*2) / total_items) * (i + 1),(canvas.width/2 * (ENEMYINTENSITY*2) / total_items) * (i + 1) + 100),
            y: y,
            isCollected: false
        });
    }
    collectableObject[graphicName].id[i].x = calculateOffset(collectableObject[graphicName].id[i].x);
    let img = graphics[graphicName].cachedImages[graphics[graphicName].index];
    checkForObjectCollision(i, graphicName);
    animateGraphic(graphics[graphicName], 20);
    ctx.drawImage(img, collectableObject[graphicName].id[i].x, collectableObject[graphicName].id[i].y + 100, img.width * width, img.height * height);
}

/**
 * Action when character collides with object
 */
function checkForObjectCollision(i, objectName) {
    let object_x = collectableObject[objectName].id[i].x;
    let object_y = collectableObject[objectName].id[i].y;
    if (character_x >= object_x - 50
        && character_x <= object_x + 50
        && character_y >= object_y - 50
        && character_y <= object_y + 50
        && !collectableObject[objectName].id[i].isCollected) {
        collectableObject[objectName].id[i].isCollected = true;
        AUDIO_COIN.play();
        collectableObject[objectName].count++;
    }
    if (collectableObject[objectName].id[i].isCollected) {
        collectableObject[objectName].id[i].x = undefined;
        collectableObject[objectName].id[i].y = undefined;
    }
}

/**
 * Calculates offset of an object relative to the nearest background
 * @param {*} objectX 
 */
function calculateOffset(objectX) {
    if (isMovingLeft && !characterIsHurt && !endScreenOn) objectX = objectX + bgImgSettings[2].offsetSpeed;
    else if (isMovingRight && !characterIsHurt && !endScreenOn) objectX = objectX - bgImgSettings[2].offsetSpeed;
    return objectX;
}

/**
 * Draws static object from a graphic from graphics array
 * @param {*} graphicName Name of the graphic 
 * @param {*} x Coordinate
 * @param {*} y Coordinate
 * @param {*} width This number will be multiplied for the canvas width to set the final width
 * @param {*} height This number will be multiplied for the canvas height to set the final height
 */
function drawObject(graphicName, x, y, width, height) {
    let img = graphics[graphicName].cachedImages[graphics[graphicName].index];
    ctx.drawImage(img, x, y, canvas.width * width, canvas.height * height);
}

/**
 * Draws text in canvas
 * @param {*} text Text to write, can also be a variable 
 * @param {*} fontAndSize Font and Size of the text, for example "50px arial"
 * @param {*} x coordinate
 * @param {*} y coordinate
 */
function drawText(text, fontAndSize, x, y) {
    ctx.font = fontAndSize;
    ctx.fillText(text, x, y);
}

/**
 * Contains all graphics for the game added with the function addGraphicsList
 */
function addGraphics() {
    addGraphicsList("background", "bgCielo", 1);
    addGraphicsList("background", "clouds", 2);
    addGraphicsList("background", "bg1", 3);
    addGraphicsList("background", "bg2", 3);
    addGraphicsList("background", "bg3", 3);
    addGraphicsList("character", "standing", 1);
    addGraphicsList("character", "hurt", 3);
    addGraphicsList("character", "jump", 9);
    addGraphicsList("character", "walk", 6);
    addGraphicsList("character", "idle", 10);
    addGraphicsList("character", "dead", 7);
    addGraphicsList("character", "sleep", 10);
    addGraphicsList("enemies", "pollito", 3);
    addGraphicsList("enemies", "pollito-dead", 1);
    addGraphicsList("enemies", "gallina", 3);
    addGraphicsList("enemies", "gallina-dead", 1);
    addGraphicsList("enemies", "boss-walk", 4);
    addGraphicsList("enemies", "boss-alert", 8);
    addGraphicsList("enemies", "boss-hurt", 3);
    addGraphicsList("enemies", "boss-attack", 8);
    addGraphicsList("enemies", "boss-dead", 3);
    addGraphicsList("bars", "life-bar", 6);
    addGraphicsList("bars", "boss-bar", 6);
    addGraphicsList("icons", "bottle-icon", 1);
    addGraphicsList("icons", "coin-icon", 1);
    addGraphicsList("coin", "coin", 2);
    addGraphicsList("bottle", "bottle1", 1);
    addGraphicsList("bottle", "bottle2", 1);
    addGraphicsList("bottle", "botella", 4);
    addGraphicsList("egg", "egg", 4);
}

/**
 * Adds graphics/animations to the game, IMPORTANT: the name of the files have to be: name-1.png,name-2.png,name-3.png, etc.
 * @param {String} grName Name of the graphic/animation, I.E.: If the file name is jump-1.png the name of the graphic is "jump".
 * @param {Number} NumberOfImages Number of total images with the same name for the animation
 */
function addGraphicsList(folder, grName, numberOfImages) {
    if (graphics[grName] == undefined) graphics[grName] = { list: [], cachedImages: [], index: 0, counter: 0 };
    for (i = 0; i < numberOfImages; i++) {
        graphics[grName].list.push(`img/${folder}/${grName}-${i + 1}.png`);
    }
}

/**
 * Loads into the graphics json all the images that have been added inside the addGraphics function.
 */
function loadAllImages() {
    //Puts keys of the graphics object in an array
    let keys = Object.keys(graphics);
    for (i = 0; i < keys.length; i++) {
        for (j = 0; j < graphics[keys[i]].list.length; j++) {
            let img = new Image();
            img.src = graphics[keys[i]].list[j];
            graphics[keys[i]].cachedImages.push(img);
        }
    }
}

/**
 * Listens to which keys are being pressed or let go and determines an accion for each
 */
function listenForKeys() {
    document.addEventListener("keydown", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = true;
            isMovingLeft = false;
            lastMoveForward = true;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = true;
            isMovingRight = false;
            lastMoveForward = false;
        }
        if (k == "ArrowUp") {
            if (!isFalling) isJumping = true;
        }
        if (k == " ") {
            if (collectableObject["bottle1"].count > 0) takeBottle = true;
        }
        if (k == "m") {
            if (!AUDIO_BGMUSIC1.paused && !endScreenOn) AUDIO_BGMUSIC1.pause();
            else if (AUDIO_BGMUSIC1.paused && !endScreenOn) AUDIO_BGMUSIC1.play();
            else if (!AUDIO_BGMUSIC3.paused && endScreenOn) AUDIO_BGMUSIC3.pause();
            else if (AUDIO_BGMUSIC3.paused && endScreenOn) AUDIO_BGMUSIC3.play();
        }
        if(k == "r") {
            window.location.reload();
        }
        if(k == "h") {
            document.getElementById("help-screen").classList.remove("d-none");
            document.getElementById("canvas-box").classList.add("d-none");
        }
    });


    document.addEventListener("keyup", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = false;
           // lastMoveForward = true;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = false;
            //lastMoveForward = false;
        }
        if (k == "ArrowUp") {
            isJumping = false;
            if (character_y < 220) isFalling = true;
            else if (character_y > 219) isFalling = false;
        }
        if (k == " ") {
            if (collectableObject["bottle1"].count > 0)  {
                collectableObject["bottle1"].count--;
                throwStartTime = new Date().getTime();
            }
        }
        if(k == "h") {
            document.getElementById("help-screen").classList.add("d-none");
            document.getElementById("canvas-box").classList.remove("d-none");

        }
    });
}

/**
 * Returns a random number between a mininum and a maximum, integers or floats.
 * @param {*} min
 * @param {*} max 
 */
function randomNum(min, max) {
    if (Number.isInteger(min) && Number.isInteger(max))
        return Math.floor(Math.random() * (max - min + 1) + min);
    else if (!Number.isInteger(min) && !Number.isInteger(max))
        return Math.random() * (max - min) + min;
}

function startGame(){
    document.getElementById("canvas-box").classList.remove("d-none");
    document.getElementById("btn-start-box").classList.add("d-none");
    init();
}

function gameOver(){
    gameIsOver = true;
    AUDIO_BGMUSIC3.pause();
    document.getElementById("canvas-box").classList.add("d-none");
    document.getElementById("btn-gameOver-box").classList.remove("d-none");
}
function characterWins(){
    gameIsOver = true;
    AUDIO_BGMUSIC3.pause();
    document.getElementById("canvas-box").classList.add("d-none");
    document.getElementById("btn-win-box").classList.remove("d-none");
}