let canvas;
let context;
let character_x = 0;
let bg_x = 0;
let isMovingRight = false;
let isMovingLeft = false;
let walk = ["img/walk1.png","img/walk2.png","img/walk3.png","img/walk4.png","img/walk5.png","img/walk6.png"];
let stepNum = 0;
function init (){
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    setInterval(function(){
        drawBackground();
        updateCharacter();
    }, 50);

    listenForKeys();
   
}

function updateCharacter(){

        let base_image = new Image();
        if (isMovingLeft == false && isMovingRight == false){
            base_image.src = "img/standing.png";
        } else {
            if(stepNum == 5){
                stepNum = 0;
            }
            base_image.src = walk[stepNum];
            stepNum++;
        }
        base_image.onload = function (){
            context.drawImage(base_image, character_x, 50, base_image.width * 0.3, base_image.height * 0.3);
        };
}

function drawBackground (){
    context.fillStyle = "skyblue";
    context.fillRect(0,0,canvas.width,canvas.height);

    drawGround();
}

function drawGround () {
    context.fillStyle = "#ffe699";
    context.fillRect(0,360,canvas.width,canvas.height - 360);

    let base_image = new Image();
    base_image.src = "img/bg1.png";
    base_image.onload = function (){
        context.drawImage(base_image, bg_x, 50, base_image.width * 0.3, base_image.height * 0.3);
    };
}

function listenForKeys() {
    document.addEventListener("keydown", e => {
        const k = e.key;
        if (k == "ArrowRight") {
            isMovingRight = true;
            character_x = character_x + 10;
            bg_x = bg_x - 5;
        }
        if (k == "ArrowLeft") {
            isMovingLeft = true;
            character_x = character_x - 10;
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
