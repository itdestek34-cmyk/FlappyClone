const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Menü ve skor
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const highScoreElem = document.getElementById("highScore");

// Görseller
const birdFrames = [new Image(), new Image(), new Image()];
birdFrames[0].src = "bird1.png";
birdFrames[1].src = "bird2.png";
birdFrames[2].src = "bird3.png";
const pipeImg = new Image(); pipeImg.src = "pipe.png";
const bgImg = new Image(); bgImg.src = "background.png";

// Sesler
const jumpSound = new Audio("jump.mp3");
const hitSound = new Audio("hit.mp3");

// Oyun değişkenleri
let bird = { x: 50, y: 300, width: 30, height: 30, dy: 0 };
const gravity = 0.6; const jump = -10;
let pipes = []; let frame = 0; let score = 0;
let bonuses = []; const bonusSize = 20;
let highScore = localStorage.getItem("highScore") || 0;
highScoreElem.textContent = highScore;
let gameRunning = false;

// Bulutlar
let clouds = [{x:50,y:50},{x:200,y:100},{x:350,y:70}];

function resizeCanvas() { canvas.width = window.innerWidth*0.9; canvas.height = window.innerHeight*0.8; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Kontroller
document.addEventListener("keydown", ()=>{ if(gameRunning){ bird.dy = jump; jumpSound.play(); }});
document.addEventListener("mousedown", ()=>{ if(gameRunning){ bird.dy = jump; jumpSound.play(); }});
document.addEventListener("touchstart", ()=>{ if(gameRunning){ bird.dy = jump; jumpSound.play(); }});

startBtn.addEventListener("click", ()=>{
    menu.style.display="none"; gameRunning=true; resetGame(); update();
});

// Fonksiyonlar
function updateDifficulty(){ pipeSpeed = 2+Math.floor(score/10); pipeGap=Math.max(100,150-Math.floor(score/10)*5); }

function spawnBonus(){ if(frame%500===0) bonuses.push({x:canvas.width, y:Math.random()*(canvas.height-100), type:"point"}); }

function updateBonuses(){
    for(let i=0;i<bonuses.length;i++){
        const b = bonuses[i]; b.x-=2;
        if(bird.x < b.x+bonusSize && bird.x+bird.width > b.x && bird.y < b.y+bonusSize && bird.y+bird.height > b.y){
            score+=5; bonuses.splice(i,1); i--;
        }
    }
    bonuses = bonuses.filter(b=>b.x+bonusSize>0);
}

function animatePipes(){ for(let i=0;i<pipes.length;i++){ const pipe=pipes[i]; pipe.y+=Math.sin(frame*0.05)*0.5; } }
function drawClouds(){ ctx.fillStyle="rgba(255,255,255,0.5)"; clouds.forEach(cloud=>{ ctx.beginPath(); ctx.arc(cloud.x,cloud.y,20,0,Math.PI*2); ctx.fill(); cloud.x-=0.5; if(cloud.x<-30) cloud.x=canvas.width+30; }); }

function screenShake(){ const shake=5; canvas.style.transform=`translate(${Math.random()*shake-shake/2}px,${Math.random()*shake-shake/2}px)`; setTimeout(()=>{canvas.style.transform="translate(0,0)";},100); }

function drawBird(){ birdFrameIndex++; if(birdFrameIndex>=birdFrames.length*5) birdFrameIndex=0; const frameIndex=Math.floor(birdFrameIndex/5); ctx.drawImage(birdFrames[frameIndex],bird.x,bird.y,bird.width,bird.height); }

function drawPipes(){ ctx.fillStyle="#0f0"; for(const pipe of pipes){ ctx.drawImage(pipeImg,pipe.x,pipe.y,pipe.width,pipe.height); ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.fillRect(pipe.x,pipe.y,pipe.width,5); } }

function drawBonuses(){ ctx.fillStyle="orange"; for(const b of bonuses) ctx.fillRect(b.x,b.y,bonusSize,bonusSize); }

function draw(){
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
    drawClouds();
    drawBird();
    drawPipes();
    drawBonuses();
    ctx.fillStyle="#000"; ctx.font="30px Arial"; ctx.fillText("Score: "+Math.floor(score),10,50);
}

function resetGame(){ bird.y=300; bird.dy=0; pipes=[]; bonuses=[]; frame=0; score=0; }

function update(){
    if(!gameRunning) return;
    updateDifficulty();
    bird.dy+=gravity; bird.y+=bird.dy;
    if(bird.y+bird.height>canvas.height) bird.y=canvas.height-bird.height;
    if(bird.y<0) bird.y=0;

    if(frame%100===0){
        const pipeHeight=Math.floor(Math.random()*(canvas.height-pipeGap-40))+20;
        pipes.push({x:canvas.width,y:0,width:50,height:pipeHeight,passed:false});
        pipes.push({x:canvas.width,y:pipeHeight+pipeGap,width:50,height:canvas.height-pipeHeight-pipeGap,passed:false});
    }

    animatePipes();
    spawnBonus();
    updateBonuses();

    for(let i=0;i<pipes.length;i++){
        const pipe=pipes[i]; pipe.x-=pipeSpeed;
        if(bird.x < pipe.x+pipe.width && bird.x+bird.width>pipe.x && bird.y<pipe.y+pipe.height && bird.y+bird.height>pipe.y){
            hitSound.play(); screenShake(); gameRunning=false; menu.style.display="flex";
            if(score>highScore){ highScore=Math.floor(score); localStorage.setItem("highScore",highScore); highScoreElem.textContent=highScore; }
        }
        if(!pipe.passed && pipe.x+pipe.width<bird.x){ pipe.passed=true; score+=0.5; }
    }

    pipes=pipes.filter(pipe=>pipe.x+pipe.width>0);

    draw();
    frame++;
    requestAnimationFrame(update);
}
