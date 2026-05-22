const startScreen = document.getElementById("startScreen");
const storyScreen = document.getElementById("storyScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const nextStoryBtn = document.getElementById("nextStoryBtn");
const retryBtn = document.getElementById("retryBtn");

const moles = document.querySelectorAll(".mole");

const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const timerBar = document.getElementById("timerBar");

const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");

let score = 0;
let combo = 0;
let time = 100;


const critterTypes = {
    mole: {
        name: "Mole",
        hitsToKill: 1,
        timeEffect: 1,      
        isHazard: false,
        image: "mole.png"
    },
    rabbit: {
        name: "Rabbit",
        hitsToKill: 1,
        timeEffect: 2,      
        isHazard: false,
        image: "phase1.png"  
    },
    robot: {
        name: "Robot",
        hitsToKill: 3,     
        timeEffect: 3,      
        isHazard: false,
        image: "phase2.png"   
    },
    trickster: {
        name: "Trickster",
        hitsToKill: 1,
        timeEffect: -3,    
        isHazard: true,
        image: "phase3.png"  
    },
    bomb: {
        name: "Bomb",
        hitsToKill: 1,
        timeEffect: -5,      
        resetsCombo: true,   
        isHazard: true,
        image: "phase4.png"   
    }
};

const gamePhases = {
    phase1: {
        name: "Calm Start",
        spawnSpeed: 1500,     
        maxEnemies: 3,
        enemyPool: ["mole"],  
        background: "phase1.png"
    },
    phase2: {
        name: "Getting Busy",
        spawnSpeed: 1200,
        maxEnemies: 4,
        enemyPool: ["mole", "rabbit"],
        background: "phase2.png"
    },
    phase3: {
        name: "Robot Influx", 
        spawnSpeed: 1000,
        maxEnemies: 5,
        enemyPool: ["mole", "rabbit", "robot"],
        background: "phase3.png"
    },
    phase4: {
        name: "Tricky Business",
        spawnSpeed: 800,
        maxEnemies: 6,
        enemyPool: ["mole", "robot", "trickster"],
        background: "phase4.png"
    },
    phase5: {
        name: "Bomb Defusal",
        spawnSpeed: 600,
        maxEnemies: 7,
        enemyPool: ["mole", "robot", "trickster", "bomb"],
        background: "phase5.png" 
    },
    phase6: {
        name: "Insane Mode",
        spawnSpeed: 400,      // Crazy fast spawning
        maxEnemies: 9,
        enemyPool: ["rabbit", "robot", "trickster", "bomb"],
        background: "phase6.png"
    }
};

// ===================================================

const stories = [
    {
        image: "story1.png",
        title: "Scientist",
        text: "After years of research, my cloning machine is finally complete. It was designed to revolutionize science and safely duplicate organic matter."
    },
    {
        image: "story2.png",
        title: "Experiment Start",
        text: "Everything is ready. I will begin the first controlled test using a simple sample object."
    },
    {
        image: "story3.png",
        title: "Mistake",
        text: "A real mole unexpectedly enters the lab and gets inside the machine during the test sequence."
    },
    {
        image: "story4.png",
        title: "Malfunction",
        text: "The system misreads the mole as the test sample and starts cloning it uncontrollably."
    },
    {
        image: "story5.png",
        title: "Outbreak",
        text: "The machine overloads and releases countless cloned moles, spreading rapidly beyond control."
    },
    {
        image: "story6.png",
        title: "Global Crisis",
        text: "The cloned mole swarm has escaped containment… and is now spreading across the world."
    }
];

let currentStory = 0;

startBtn.onclick = () => {
    startScreen.style.display = "none";
    storyScreen.style.display = "flex";
    updateStory();
};

/* NEXT STORY */
nextStoryBtn.onclick = () => {
    currentStory++;
    if(currentStory < stories.length){
        updateStory();
    } else {
        storyScreen.style.display = "none";
        gameScreen.style.display = "flex";
        startGame();
    }
};

retryBtn.onclick = () => {
    gameOverScreen.style.display = "none";
    gameScreen.style.display = "flex";
    resetGame();
};

function updateStory(){
    storyScreen.style.backgroundImage = `url("${stories[currentStory].image}")`;
    storyTitle.textContent = stories[currentStory].title;
    storyText.textContent = stories[currentStory].text;
}

moles.forEach(mole => {
    mole.addEventListener("click", () => {
        if (mole.classList.contains("active")) {
            mole.classList.remove("active");
            mole.classList.add("matched");

            score += 10;
            combo++;

            scoreValue.textContent = score;
            comboValue.textContent = combo;

            setTimeout(() => {
                mole.classList.remove("matched");
            }, 400);
        }
    });
});

/* SPAWN MOLES */
function randomMole() {
    moles.forEach(m => m.classList.remove("active"));
    const index = Math.floor(Math.random() * moles.length);
    moles[index].classList.add("active", "shuffling");

    setTimeout(() => {
        moles[index].classList.remove("shuffling");
    }, 500);
}

/* GAME LOOP */
function startGame() {
    setInterval(randomMole, 800);

    let timer = setInterval(() => {
        time--;
        timerBar.style.width = time + "%";

        if (time < 30) {
            timerBar.classList.add("warning");
        }

        if (time <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 500);
}

/* GAME OVER */
function gameOver() {
    gameScreen.style.display = "none";
    gameOverScreen.style.display = "flex";
}

/* RESET */
function resetGame() {
    score = 0;
    combo = 0;
    time = 100;

    scoreValue.textContent = 0;
    comboValue.textContent = 0;
    timerBar.style.width = "100%";
}