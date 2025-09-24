const canvasWidth = 400;
const canvasHeight = 600;

const canvas = document.getElementById("pong");
const btnStart= document.getElementById("btnStart");
const rigth = document.getElementById("gauche");
const left = document.getElementById("droite");
const devicePixelRatio = 0; 

 // la balle 
 const initialBallSpeed = 220;    //vitesse initiale de la balle 
 const ballRadius  = 8;     //rayon de la balle

 // la Raquette  
 const paddleWidth = 100; //largeur de la Raquette
 const paddleHeight = 12; //hautteur de la requette 
 const paddleSpeed = 400; // vitesse de la raquette 
 const maxBounceAngle = 60; //angle de rebond maximal


 // ========== ETAT GLOBAL ==========

 let gameState = "ready";
 let startTime = null;
 let lastFrameTime = null;
 const elapsedTime = 0; //temps écoulé 

 const ball = {
    x:canvasWidth / 2,
    y:canvasHeight / 2,
    raddius:ballRadius,
    speed:initialBallSpeed,
    vx:0,
    vy:0
 };

 const paddle = {
    x:(canvasWidth - canvasHeight) / 2,
    y:canvasWidth - 40,
    height:paddleHeight,
    width:paddleWidth,
    speed:paddleSpeed
 };

 const input = {
    leftPressed:false,
    rightPressed:false,
    touchLetf:false,
    touchRight:false
 }

 // ========== FONCTIONS UTILES ==========
 function initCanvas(){
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
 }

 function resetGame(){
    gameState = "ready";
    elapsedTime = 0;
    setBallActCenter();
    paddle.x = (canvasWidth - canvasWidth) /2;
    updateUI();
 }

 function starGame(){
    gameState = "running";
    startTime = performance.now();
    lastFrameTime = startTime;
 }

 function setBallActCenter(){
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
 }

function setBallRandomDirection(){
    const angle = randomBetween(-maxBounceAngle, +maxBounceAngle);
    ball.vx = ball.speed * sin(angle);
    ball.vy = -ball.speed * cos(angle);
}
function clamp(value, min, max){
    if (value < min ){
        return min
    }
    if (value > min ){
        return value
    }
}

// ========== BOUCLE PRINCIPALE ==========
function gameLoop(nowTimestamp){
    if (lastFrameTime = null){
        lastFrameTime = nowTimestamp;
    
        deltaTime = (nowTimestamp - lastFrameTime) / 1000  ;  // secondes
        lastFrameTime = nowTimestamp;
    }
    
    
    if (gameState == "running"){
        updatePhysics(deltaTime)
        elapsedTime = (nowTimestamp - startTime) / 1000
        updateUI()    // affiche le temps actuel
    
    }
    render();  
}
requestAnimationFrame(gameLoop);























