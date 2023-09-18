const tryAgain = document.getElementById('try-again')
const body = document.querySelector('body');
const gameOverDisplay = document.querySelector(".game-over-container");
const backHome = document.getElementById('back-home')
const openingBackgroundSound = document.getElementById("opening-bg")

window.addEventListener("onload", function() {
    openingBackgroundSound.volume = 0.5
    openingBackgroundSound.play()
})

function covidRush(){ 
    // canvas setup 
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let enemies = []; // houses all eney object elements
    let score = 0;
    let gameOver = false;
    openingBackgroundSound.pause()
    const ingameBackgroundSound = new Audio()
    ingameBackgroundSound.src = "./assets/sound-effects/in-game-bg.mp3"
    ingameBackgroundSound.volume = 0.5
    ingameBackgroundSound.play()
    const jumpSound = new Audio()
    jumpSound.src = "./assets/sound-effects/jump.mp3"
    const jumpLandingSound = new Audio()
    jumpLandingSound.src = "./assets/sound-effects/jump-landing3.mp3"
    const gameSpeed = 7;

    class InputHandler { // concept: adds pressed keys in keys array, deletes them when player removes hold of that key. esentially array only holds presently pressed keys
        constructor(){
            this.keys = []; // houses all keys pressed
            window.addEventListener('keydown', e => { // ES6 arrow function is used to inherit 'this' from parent class (lexical scoping)
                if ((   e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight')
                        && this.keys.indexOf(e.key) === -1){ // if key pressed and if key pressed is not present in the array yet execute code block below
                    this.keys.push(e.key)}
                });

            window.addEventListener('keyup', e => { 
                if (    e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight'){ 
                    this.keys.splice(this.keys.indexOf(e.key), 1) // deletes unhold keys

                }
            })
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.spriteWidth = 369;
            this.spriteHeight = 628;
            this.width = this.spriteWidth/3.5;
            this.height = this.spriteHeight/3.5;
            this.x = gameWidth * 0.1;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 20;
            this.frameY = 0;
            this.fps = 20; // how fast we swap between indiv animation frames in sprite sheet
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 0; // horizontal speed
            this.vy = 0; // vertical speeed
            this.weight = 1.2; // gravity
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,  this.x, this.y, this.width, this.height)
        }
        update(input, deltaTime, enemies){
            // circular collision detection
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy) // pythagorean theorem

                if (distance < (enemy.width/2 + this.width/2 - 20)){ // if there is collision
                    gameOver = true
                }
            })

            // sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0; 
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // horizontal motion
            this.x += this.speed;

            // controls
            if (input.keys.indexOf('ArrowRight') > -1){ // index of here checks if a key is in the array
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1){
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1) && this.onGround()){ // jump only when player is on ground
                this.vy -= 31;
                jumpSound.play()
                jumpLandingSound.play()
            } else {
                this.speed = 0;
            }
            
            // horizontal boundaries
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

            // vertical motion
            this.y += this.vy;
            if (!this.onGround()){ // if player not on ground
                this.frameY = 1;
                this.frameX = 0 // changes sprite sheet 
                this.vy += this.weight; // add vertical speed
                this.maxFrame = 10;
            } else {
                this.vy = 0;
                this.frameY = 0; // reset sprite sheet and vertixal speed
                this.maxFrame = 20;
                
            }

            // vertical boundaries
            if (this.y >= this.gameHeight - this.height){
                this.y = this.gameHeight - this.height
            }
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }


    class Layer {
        constructor(image, speedModifier, gameWidth, gameHeight){
            this.x = 0;
            this.y = 0;
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 3000;
            this.height = 1667;
            this.image = image
            this.speedModifier = speedModifier
            this.speed = gameSpeed * speedModifier
        }
        update() {
            this.speed = gameSpeed * this.speedModifier;
            if (this.x <= -this.width){
                this.x = 0
            }
            this.x -= this.speed; 

        }
        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.gameHeight)
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.gameHeight)
        }
    }

    class Background {
        constructor(){
            this.backgroundLayer1 = new Image();
            this.backgroundLayer2 = new Image();
            this.backgroundLayer3 = new Image();
            this.backgroundLayer4 = new Image();
            this.backgroundLayer5 = new Image();
        
            this.backgroundLayer1.src = './assets/parallax/level1/Layer 1.png'
            this.backgroundLayer2.src = './assets/parallax/level1/Layer 2.png'
            this.backgroundLayer3.src = './assets/parallax/level1/Layer 3.png'
            this.backgroundLayer4.src = './assets/parallax/level1/Layer 4.png'
            this.backgroundLayer5.src = './assets/parallax/level1/Layer 5.png'
        
            this.layer1 = new Layer(this.backgroundLayer1, 0, canvas.width, canvas.height)
            this.layer2 = new Layer(this.backgroundLayer2, 0.05, canvas.width, canvas.height)
            this.layer3 = new Layer(this.backgroundLayer3, 0.1, canvas.width, canvas.height)
            this.layer4 = new Layer(this.backgroundLayer4, 0.2, canvas.width, canvas.height)
            this.layer5 = new Layer(this.backgroundLayer5, 1.3, canvas.width, canvas.height)
        
            this.gameObjects = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5]
        }
        
        update(){
            if (score > 9){
                this.backgroundLayer1.src = './assets/parallax/level2/Layer 1.png'
                this.backgroundLayer2.src = './assets/parallax/level2/Layer 2.png'
                this.backgroundLayer3.src = './assets/parallax/level2/Layer 3.png'
                this.backgroundLayer4.src = './assets/parallax/level2/Layer 4.png'
                this.backgroundLayer5.src = './assets/parallax/level2/Layer 5.png'
            }

            if (score > 19){
                this.backgroundLayer1.src = './assets/parallax/level3/Layer 1.png'
                this.backgroundLayer2.src = './assets/parallax/level3/Layer 2.png'
                this.backgroundLayer3.src = './assets/parallax/level3/Layer 3.png'
                this.backgroundLayer4.src = './assets/parallax/level3/Layer 4.png'
                this.backgroundLayer5.src = './assets/parallax/level3/Layer 5.png'
            }
        }
        draw(){
            this.gameObjects.forEach(object => {
                object.update();
                object.draw();
            })
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.spriteWidth = 188.285714;
            this.spriteHeight = 189;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.image = document.getElementById('enemyImage');
            this.x = gameWidth;
            this.y = Math.random() * (gameHeight - this.height);
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 5;
            this.fps = 20; // how fast we swap between indiv animation frames in sprite sheet
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = 10;
            this.markedForDeletion = false;
            this.angle = 0;
            this.angleSpeed = Math.random() * 0.2;
            this.curve = Math.random() * 7;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
        }
        update(deltaTime){
            // level up stage 2 of the game if score is greater than 10 
            if (score > 9) {
                this.image = document.getElementById('enemy_3');
                this.spriteWidth = 464;
                this.spriteHeight = 467;
                this.width = this.spriteWidth/2.3;
                this.height = this.spriteHeight/2.3;
                this.speed = 14;
                // this.angleSpeed = Math.random() * 0.2 + 0.2;
                // this.curve = Math.random() * 5 + 5;
            }

            if (score > 19) {
                this.image = document.getElementById('enemy_4');
                this.width = this.spriteWidth/2.1;
                this.height = this.spriteHeight/2.1;
                this.speed = Math.random() * 14 + 10;
                this.angleSpeed = Math.random() * 0.3;
                this.curve = Math.random() * 7 + 5;
            }

            if (this.frameTimer > this.frameInterval){ // animate spritesheet relative to deltaTime
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            } 
            this.x -= this.speed; // move to the left
            this.y += this.curve * Math.sin(this.angle); // for wavy motions
            this.angle += this.angleSpeed;
            
            // if (this.y > this.gameHeight - this.height) this.y *= -1

            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
             // when sprite moves way past the canvas mark it for deletion and add score
        }
    }

    function handleEnemies(deltaTime){
        if (score > 9) {
            enemyInterval = 500;
        }

        if (score > 19) {
            enemyInterval = 300;
        }

        if (enemyTimer > enemyInterval + randomEnemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height)); // adds enemies to array
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx)
            enemy.update(deltaTime)
        })

        enemies = enemies.filter(enemy => !enemy.markedForDeletion) // to retain enemies not marked for deletion hence the (!)
    }

    function displayStatusText(context){
        // score
        context.strokeStyle = '#256E04';
        context.lineWidth = 0;
        context.fillStyle = '#256E04';
        context.font = 'bold 35px Anime Ace';
        context.fillText('Score: ' + score, 20, 50);
        context.strokeText('Score: ' + score, 20, 50);
        context.stroke();

        // game over
        if (gameOver) {
            ingameBackgroundSound.pause()
            gameOverDisplay.style.display = "grid";
            const gameOverSound = new Audio()
            gameOverSound.src = "./assets/sound-effects/game-over.mp3"
            gameOverSound.play()
        }
    }

    // class instantiate
    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height)

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0,0,canvas.width,canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if(!gameOver) requestAnimationFrame(animate) // only run next animation frame when gameover is false 
    }

    animate(0); // we pass 0 because this is outside request animation frame which has autogenerated timstamp argument
}

// SOUND EFFECTS WHEN BUTTON IS CLICKED
const buttons = document.querySelectorAll("button")
function soundEffectsButtonClicked() {
    const soundEffectBtn = new Audio()
    soundEffectBtn.src = "./assets/sound-effects/click.wav"
    soundEffectBtn.play()
}

buttons.forEach(button => button.addEventListener("click", soundEffectsButtonClicked))

// PLAY
const playBtn = document.getElementById('play-btn')
const startContainer = document.getElementById('start-container')
const boyRunningStart = document.getElementById('canvas-boy-running')
const canvas1 = document.getElementById('canvas1')

playBtn.addEventListener('click', function(){
    startContainer.style.display = "none"
    boyRunningStart.style.display = "none"
    canvas1.style.display = "block"
    covidRush()
})

// STORY LINE

// STORY PAGE 1
const storyBtn = document.getElementById('story-btn')
const storyContainer1 = document.getElementById('story-container1')
const btn1 = document.getElementById('button1')
const btn2 = document.getElementById('button2')
const btn3 = document.getElementById('button3')


storyBtn.addEventListener('click', function(){
    startContainer.style.display = "none"
    boyRunningStart.style.display = "none"
    storyContainer1.style.display = "grid"
    btn1.style.display = 'block'
})

const storyContainer2 = document.getElementById('story-container2')
btn1.addEventListener('click', function(){
    storyContainer1.style.display = "none"
    storyContainer2.style.display = "grid"
    btn1.style.display = "none"
    btn2.style.display = 'block' 
})

const storyContainer3 = document.getElementById('story-container3')
btn2.addEventListener('click', function(){
    storyContainer2.style.display = "none"
    storyContainer3.style.display = "grid"
    btn2.style.display = "none"
    btn3.style.display = 'block' 
})

// TUTORIAl
const tutorialContainer = document.getElementById("tutorial-container")
const tutorialBtn = document.getElementById("button3")
const btn4 = document.getElementById("button4")

tutorialBtn.addEventListener("click",function() {
    storyContainer3.style.display = "none"
    tutorialContainer.style.display = "grid"
    tutorialBtn.style.display = "none"
    btn4.style.display = "block"
})

// AVOID
const avoidContainer = document.getElementById("avoid-container")
const backToHomeBtn = document.getElementById("back-to-home-btn")

btn4.addEventListener("click", function(){
    tutorialContainer.style.display = "none"
    avoidContainer.style.display = "grid"
    btn4.style.display = "none"
    backToHomeBtn.style.display = "block"
})

backToHomeBtn.addEventListener("click", function(){
    window.location.reload()
})

// GAME
tryAgain.addEventListener("click", function(){
	gameOverDisplay.style.display = "none"
	covidRush()
})

backHome.addEventListener("click", function(){
	window.location.reload()
})

// Sprite in Homepage
const canvas = document.getElementById('canvas-boy-running');
const ctx = canvas.getContext('2d');
canvas.width = 192;
canvas.height = 350;
const boyRunning = new Image();
boyRunning.src = './assets/boyrun1.png';

class Sprite {
	constructor(canvasWidth, canvasHeight, animation, spriteWidth, maxFrame){
			this.canvasWidth = canvasWidth;
			this.canvasHeight = canvasHeight;
			this.spriteWidth = spriteWidth;
			this.spriteHeight = 350;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;
			this.image = animation;
			this.x = canvasWidth * 0.5 - this.width * 0.5;
			this.y = canvasHeight - this.height;
			this.frameX = 0;
			this.maxFrame = maxFrame;
			this.fps = 20;
			this.frameTimer = 0;
			this.frameInterval = 1000/this.fps;
	}

	draw(context){
			context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
	}

	update(deltaTime){
			if (this.frameTimer > this.frameInterval){
					if (this.frameX >= this.maxFrame) this.frameX = 0;
					else this.frameX++
					this.frameTimer = 0;
			} else {
					this.frameTimer += deltaTime
			} 
	}
}

const boyRunningSprite = new Sprite(canvas.width, canvas.height, boyRunning, 192, 20);
lastTime = 0;

function animate(timeStamp){
	const deltaTime = timeStamp - lastTime;
	lastTime = timeStamp;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	boyRunningSprite.draw(ctx);
	boyRunningSprite.update(deltaTime);
	requestAnimationFrame(animate);
};

animate(0);

