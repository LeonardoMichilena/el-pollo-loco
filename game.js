
// General variables
let canvas;
let ctx;
let imgCounters = {
    bg: 0,
    standing: 0
}
let simpleCounters = {
    bg: 0,
    standing: 0
}
//JSON for the Graphics
let graphics = {
    bgSky:"img/background/bg-cielo.png",
    clouds:["img/background/clouds1.png","img/background/clouds2.png"],
    walk:["img/background/walk1.png","img/background/walk2.png","img/background/walk3.png","img/background/walk4.png","img/background/walk5.png","img/background/walk6.png"]
}

//Variables for the clouds & background
let cloudIntensity = 3;
let cloudSpeed = 1;
let clouds = [];
let bgImgSettings = [];

//Variables for the character
let isMovingLeft = false;
let isMovingRight = false;
let isJumping = false;
let lastMoveForward = true;
let character_x = 300;
let character_y = 180;
let countSteps = 0;

function init() {
    //Defines the canvas from the html tag and creates a context for drawing
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    draw();

    listenForKeys();
}

/**
 * Initializes the necesary drawings for the game
 *  */
function draw() {
    drawSky();
    drawBackground();
   // drawEnemies();
    drawCharacter();

    //Automatically sets the animation frame request interval, flackering decreases
    requestAnimationFrame(draw);
}

function drawSky() {
    let img = new Image();
    img.src = graphics.bgSky;
    if (img.complete) {
        ctx.drawImage(img, 0, 0, img.width * 0.38, img.height * 0.38);
    }
    for (i = 0; i < cloudIntensity; i++) {
        drawCloud(i);
    }
}

function drawCloud(i) {
    //if the clouds array is empty, create new cloud with random parameters
    //or if the clouds are out of screen, start new cloud with random parameters
    if (clouds[i] == undefined || clouds[i].x <= - 1920 * clouds[i].size) {
        clouds[i] = {
            type: randomNum(1, 2),
            x: randomNum(720, 1000),
            y: randomNum(0, 40),
            size: randomNum(0.2, 0.7),
            speed: randomNum(0.1, 0.7)
        };
    }
    let img = new Image();
    img.src = graphics.clouds[clouds[i].type-1];
    if (img.complete) {
        ctx.drawImage(img, clouds[i].x, clouds[i].y, img.width * clouds[i].size, img.height * clouds[i].size);
    }
    clouds[i].x = clouds[i].x - (clouds[i].speed * cloudSpeed);
}
/**
 * Adds ground and background images, from most far away to closest background
 */
function drawBackground() {
    ctx.fillStyle = "#ffe699";
    ctx.fillRect(0, 350, canvas.width, canvas.height);

    addBackgroundImage("bg3", -30, 1);
    addBackgroundImage("bg2", -10, 2);
    addBackgroundImage("bg1", 0, 5);

    imgCounters.bg = 0;
}
/**
 * Adds bg img (in pairs) and adds the given parameters to the bgImgSettings array, alternating always the two files of each background
 * @param {*} name: name of the img files without the end number, i.E: file names are "bg1-1" & "bg1-2", the name will be "bg1"
 * @param {*} y: background image y coordinate
 * @param {*} offsetSpeed: Offset when the character is moving left or right
 */
function addBackgroundImage(name, y, offsetSpeed) {
    if (bgImgSettings[imgCounters.bg] == undefined) bgImgSettings[imgCounters.bg] = { x: [0, 719], y: y, offsetSpeed: offsetSpeed };
    let img = [];
    for (i = 0; i < 2; i++) {
        if (bgImgSettings[imgCounters.bg].x[i] < -719) bgImgSettings[imgCounters.bg].x[i] = 719;
        else if (bgImgSettings[imgCounters.bg].x[i] > 720) bgImgSettings[imgCounters.bg].x[i] = -717;
        img[i] = new Image();
        img[i].src = `img/background/${name}-${i + 1}.png`;
        if (img[i].complete) {
            if (isMovingLeft) {
                bgImgSettings[imgCounters.bg].x[i] = bgImgSettings[imgCounters.bg].x[i] + bgImgSettings[imgCounters.bg].offsetSpeed;
                countSteps++;
            } else if (isMovingRight) {
                bgImgSettings[imgCounters.bg].x[i] = bgImgSettings[imgCounters.bg].x[i] - bgImgSettings[imgCounters.bg].offsetSpeed;
                countSteps++;
            }
            //Draws img and resizes it to fill the width of the canvas (720)
            ctx.drawImage(img[i], bgImgSettings[imgCounters.bg].x[i], y, img[i].width * (1 / (img[i].width / 720)), img[i].height * (1 / (img[i].width / 720)));
        }
    }
    imgCounters.bg++;
}

function drawCharacter() {
    drawCharacterAnimations();
    characterJump();
}
/**
 * Character animations when standing, moving and jumping
 */
function drawCharacterAnimations() {
    let img = new Image();

    //If standing without moving or jumping
    if (!isMovingLeft && !isMovingRight && !isJumping) {
        simpleCounters.standing++;
        //if standing less than 5 seconds
        if (simpleCounters.standing < 200) img.src = "img/character/standing.png";
        //if standing more than 5 seconds
        else if (simpleCounters.standing >= 200 && simpleCounters.standing < 400)
            img.src = addAnimation("character", "idle", 6, 2);
        //if standing mofe than 10 seconds until character moves
        else if (simpleCounters.standing >= 400 && simpleCounters.standing < 800)
            img.src = addAnimation("character", "sleep", 6, 2);
        else simpleCounters.standing = 400;
        //If moving to the left or right
    } else if ((isMovingRight || isMovingRight) && !isJumping) {
        simpleCounters.standing = 0;
        img.src = addAnimation("character", "walk", 6, 10);
        //If jumping (from standing or moving)
    } else if (isJumping || (isJumping && (isMovingLeft || isMovingRight))) {
        simpleCounters.standing = 0;
        img.src = addAnimation("character", "jump", 10, 20);
    }
    ctx.save();
    //When moving left, mirrors the images to the left side
    if ((isMovingLeft || !lastMoveForward) && !isMovingRight) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    if (img.complete) {
        ctx.drawImage(img, character_x, character_y, img.width * 0.2, img.height * 0.2);
    }
    ctx.restore();
}

function characterJump() {
    if (isJumping) {
        if (character_y > 50) character_y = character_y - 10;
        if (character_y == 50) isJumping = false;
    } else if (!isJumping) {
        if (character_y < 175) character_y = character_y + 10;
    }
}
/**
 * Animates images and returns a image.src link.
 * @param {*} folder : where the images are located inside img/
 * @param {*} name : Name of the action, i.E.: the images should be named action1,action2,action3, etc.
 * @param {*} numberOfImages : The total of images for the animation
 * @param {*} frameSpeed : How quick the animation should be
 */
function addAnimation(folder, name, numberOfImages, frameSpeed) {
    if (simpleCounters.name == undefined || imgCounters.name == undefined) {
        simpleCounters.name = 0;
        imgCounters.name = 1;
    } else if (simpleCounters.name > 100 / frameSpeed && imgCounters.name < numberOfImages) {
        simpleCounters.name = 0;
        imgCounters.name++;
        if (imgCounters.name >= numberOfImages) imgCounters.name = 1;
    }
    simpleCounters.name++;
    return `img/${folder}/${name}${imgCounters.name}.png`;
}

function listenForKeys() {
    document.addEventListener("keydown", e => {
        const k = e.key;
        console.log(k);
        if (k == "ArrowRight") {
            isMovingRight = true;
            isMovingLeft = false;
        }
        if (k == "ArrowLeft") {
            isMovingRight = false;
            isMovingLeft = true;
        }
        if (k == " " || k == "ArrowUp") {
            isJumping = true;
        }
    });
    document.addEventListener("keyup", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = false;
            lastMoveForward = true;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = false;
            lastMoveForward = false;
        }
        if (k == " " || k == "ArrowUp") {
            isJumping = false;
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
