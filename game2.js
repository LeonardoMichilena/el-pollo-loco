let canvas;
let context;
let character_x = 250;
let character_y = 50;
let bg_x = 0;
let isMovingRight = false;
let isMovingLeft = false;
let isJumping = false;
let walk = ["img/walk1.png","img/walk2.png","img/walk3.png","img/walk4.png","img/walk5.png","img/walk6.png"];
let countStep = 0;
let stepNum = 0;


function init (){
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    draw();
    
    listenForKeys();
   
}

function draw() {

    drawBackground();
    updateCharacter();
    requestAnimationFrame(draw);
}
function updateCharacter(){
        let base_image = new Image();
        if (isMovingLeft == false && isMovingRight == false){
            base_image.src = "img/standing.png";
        } else {
            if(countStep >= 2){
                countStep = 0;
                if(stepNum >= 5){ stepNum = 0;}
                if(stepNum <= 0){ stepNum = 0;}
                stepNum++;
            }
            base_image.src = walk[stepNum];
        }
        if (base_image.complete){
            context.drawImage(base_image, character_x, character_y, base_image.width * 0.3, base_image.height * 0.3);
        }
}

function drawBackground (){
    context.fillStyle = "skyblue";
    context.fillRect(0,0,canvas.width,canvas.height);
    drawGround();
}

function drawGround () {
    context.fillStyle = "#ffe699";
    context.fillRect(0,360,canvas.width,canvas.height - 360);
    
    let base_image1 = new Image();
    base_image1.src = "img/bg1.png";
    if (base_image1.complete){
        context.drawImage(base_image1, bg_x, 50, base_image1.width * 0.3, base_image1.height * 0.3);
    }
}

function listenForKeys() {
    document.addEventListener("keydown", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = true;
            bg_x = bg_x - 5;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = true;
            bg_x = bg_x + 5;
        }
    });
    document.addEventListener("keyup", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = false;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = false;
        }
    });
}
