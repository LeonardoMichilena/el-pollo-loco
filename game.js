
// General variables
let canvas;
let ctx;
let imgCounters = {
    bg:0,
    walk:0,
    idle:0,
    sleep:0,
    jump:0
}
let simpleCounters = {
    bg:0,
    walk:0,
    idle:0,
    sleep:0,
    jump:0
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
let countJump = 0;
let onTheAir = false;
let lastMoveForward = true;
let character_x = 300;
let character_y = 180;
let countSteps = 0;
let walk = ["img/character/walk1.png", "img/character/walk2.png", "img/character/walk3.png", "img/character/walk4.png", "img/character/walk5.png", "img/character/walk6.png"];

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
    drawGround();
    drawBackground();
    // drawEnemy();
    drawCharacter();

    //Automatically sets the animation frame request interval, flackering decreases
    requestAnimationFrame(draw);
}

function drawSky() {
    let img = new Image();
    img.src = "img/background/bg-cielo.png";
    if (img.complete) {
        ctx.drawImage(img, 0, 0, img.width * 0.38, img.height * 0.38);
    }
    for (i = 0; i < cloudIntensity; i++) {
        drawCloud(i);
    }
}

function drawCloud(i) {
    //if the clouds array is empty, create new cloud with random parameters
    if (clouds[i] == undefined) {
        clouds[i] = {
            type: randomNum(1, 2),
            x: randomNum(720, 1000),
            y: randomNum(0, 40),
            size: randomNum(0.2, 0.7),
            speed: randomNum(0.1, 0.7)
        };
    }
    let img = new Image();
    img.src = `img/background/clouds${clouds[i].type}.png`;
    if (img.complete) {
        ctx.drawImage(img, clouds[i].x, clouds[i].y, img.width * clouds[i].size, img.height * clouds[i].size);
    }
    clouds[i].x = clouds[i].x - (clouds[i].speed * cloudSpeed);
    //if the clouds are out of screen, start new cloud with random parameters
    if (clouds[i].x <= - 1920 * clouds[i].size) {
        clouds[i] = {
            type: randomNum(1, 2),
            x: randomNum(720, 1000),
            y: randomNum(-10, 30),
            size: randomNum(0.2, 0.7),
            speed: randomNum(0.1, 0.7)
        };
    }
}

function drawGround() {
    ctx.fillStyle = "#ffe699";
    ctx.fillRect(0, 350, canvas.width, canvas.height);
}
/**
 * Adds background images, from most far away to closest background
 */
function drawBackground() {
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
    drawCharacterWalk();
    characterJump();

}

function drawCharacterWalk() {
    let img = new Image();
    if (!isMovingLeft && !isMovingRight) {
        simpleCounters.idle++;
        if(simpleCounters.idle < 80) img.src = "img/character/standing.png";
        else if(simpleCounters.idle >= 40 && imgCounters.idle < 10){
            simpleCounters.idle = 0;
            imgCounters.idle++;
            img.src = `img/character/idle${imgCounters.idle}.png`
            console.log(imgCounters.idle);
        } else imgCounters.idle = 0;
    } else {
        if (countSteps > 20) {
            countSteps = 0;
            if (imgCounters.walk >= 5 || imgCounters.walk <= 0) { imgCounters.walk = 0; }
            imgCounters.walk++;
        }
        img.src = walk[imgCounters.walk];
    }
    if (img.complete) {
        if ((isMovingLeft || !lastMoveForward) && !isMovingRight) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
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
            console.log(11);
            isJumping = true;
            countJump++;
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

function randomNum(min, max) {
    if (Number.isInteger(min) && Number.isInteger(max))
        return Math.floor(Math.random() * (max - min + 1) + min);
    else if (!Number.isInteger(min) && !Number.isInteger(max))
        return Math.random() * (max - min) + min;
}
