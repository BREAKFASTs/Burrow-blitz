const screens = document.querySelectorAll(".screen");

const startScreen = document.getElementById("startScreen");
const storyScreen = document.getElementById("storyScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const phaseText = document.getElementById("phaseText");

const startBtn = document.getElementById("startBtn");
const nextStoryBtn = document.getElementById("nextStoryBtn");
const retryBtn = document.getElementById("retryBtn");

const moles = gameScreen.querySelectorAll(".mole");

const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const timerValue = document.getElementById("timerValue");
const timerBar = document.getElementById("timerBar");
const finalScore = document.querySelector(".score-values h2");

const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");

let score = 0;
let combo = 0;
let time = 100;
let timer = null;
const maxTime = 100;
let lives = 3;
let moleInterval = null;
let phase = 1;
let spawnSpeed = 1100;
let activeMole = null;
let lostLifeThisPhase = false;

const critterTypes = {
    mole: {
        name: "Mole",
        score: 10,
        penalty: 0,
        hitsToKill: 1,
        timeEffect: 1,      
        isHazard: false,
        resetsCombo: false,
        emoji: "🐹"
    },
    rabbit: {
        name: "Rabbit",
        score: 15,
        penalty: 0,
        hitsToKill: 1,
        timeEffect: 2,      
        isHazard: false,
        resetsCombo: false,
        emoji: "🐰"
    },
    robot: {
        name: "Robot",
        score: 25,
        penalty: 0,
        hitsToKill: 3,
        isHazard: false,
        resetsCombo: false,
        emoji: "🤖"
    },
    trickster: {
        name: "Trickster",
        score: 0,
        penalty: 1,
        hitsToKill: 1,
        timeEffect: -3,    
        isHazard: true,
        resetsCombo: true,
        emoji: "🦊"
    },
    bomb: {
        name: "Bomb",
        score: 0,
        penalty: 1,
        hitsToKill: 1,
        timeEffect: -5,      
        resetsCombo: true,   
        isHazard: true,
        resetsCombo: true,
        emoji: "💣"
    }
};

const gamePhases = {
    1: {
        label: "PHASE 1 - MEADOW",
        className: "phase-meadow",
        spawnSpeed: 1100,
        enemyPool: ["mole"]
    },
    2: {
        label: "PHASE 2 - DESERT",
        className: "phase-desert",
        spawnSpeed: 950,
        enemyPool: ["mole", "rabbit"]
    },
    3: {
        label: "PHASE 3 - SNOW",
        className: "phase-snow",
        spawnSpeed: 850,
        enemyPool: ["mole", "rabbit", "robot"]
    },
    4: {
        label: "PHASE 4 - SPACE",
        className: "phase-space",
        spawnSpeed: 750,
        enemyPool: ["mole", "robot", "trickster", "bomb"]
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
        text: "The cloned mole swarm has escaped containment... and is now spreading across the world."
    }
];

let currentStory = 0;

function showScreen(screenToShow) {
    screens.forEach(screen => {
        screen.style.display = "none";
    });

    screenToShow.style.display = "flex";
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function updateStory() {
    storyScreen.style.backgroundImage = `url("${stories[currentStory].image}")`;
    storyTitle.textContent = stories[currentStory].title;
    storyText.textContent = stories[currentStory].text;
}

function applyPhaseSettings() {
    const currentPhase = gamePhases[phase];

    gameScreen.classList.remove("phase-meadow", "phase-desert", "phase-snow", "phase-space");
    gameScreen.classList.add(currentPhase.className);
    phaseText.textContent = currentPhase.label;
    spawnSpeed = currentPhase.spawnSpeed;
}

function updatePhase() {
    let newPhase = 1;

    if (score >= 200) newPhase = 4;
    else if (score >= 100) newPhase = 3;
    else if (score >= 50) newPhase = 2;

    if (newPhase === phase) return;

    if (!lostLifeThisPhase) {
        lives = Math.min(3, lives + 1);
    }

    lostLifeThisPhase = false;
    phase = newPhase;
    applyPhaseSettings();

    clearInterval(moleInterval);
    randomMole();
    moleInterval = setInterval(randomMole, spawnSpeed);

    console.log("Phase:", phase, "Lives:", lives);
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

startBtn.onclick = () => {
    showScreen(storyScreen);
    updateStory();
};

/* NEXT STORY */
nextStoryBtn.onclick = () => {
    currentStory++;

    if (currentStory < stories.length) {
        updateStory();
    } else {
        resetGame();
        showScreen(gameScreen);
        startGame();
    }
};

retryBtn.onclick = () => {
    gameOverScreen.style.display = "none";
    gameScreen.style.display = "flex";
    resetGame();
    showScreen(gameScreen);
    startGame();
};

moles.forEach(mole => {
    mole.addEventListener("click", () => {
        if (mole !== activeMole || !mole.classList.contains("active")) {
            if (!mole.classList.contains("matched")) {
                combo = 0;
                comboValue.textContent = combo;
                console.log("Miss Click!");
            }
            return;
        }

        const critter = critterTypes[mole.dataset.type];
        const hitsLeft = Number(mole.dataset.hitsLeft) - 1;
        mole.dataset.hitsLeft = String(hitsLeft);

        mole.classList.add("matched");
        setTimeout(() => {
            mole.classList.remove("matched");
        }, 150);

        if (hitsLeft > 0) {
            console.log(`${critter.name} hit, ${hitsLeft} left`);
            return;
        }

        mole.classList.remove("active");
        mole.dataset.missed = "false";
        clearTimeout(mole._timeout);
        activeMole = null;

        score += critter.score;

        if (critter.isHazard) {
            lives -= critter.penalty;
            lostLifeThisPhase = true;
            combo = 0;
        } else {
            combo++;
        }

        if (critter.resetsCombo) {
            combo = 0;
        }

        scoreValue.textContent = score;
        comboValue.textContent = combo;

        if (lives <= 0) {
            gameOver();
            return;
        }

        updatePhase();

        console.log("Hit:", critter.name);
    });
});

/* SPAWN MOLES */
function randomMole() {
    moles.forEach(m => {
        m.classList.remove("active");
        m.classList.remove("matched");
        m.dataset.missed = "true";
        clearTimeout(m._timeout);
    });

    const mole = pickRandom([...moles]);
    const critterKey = pickRandom(gamePhases[phase].enemyPool);
    const critter = critterTypes[critterKey];

    activeMole = mole;
    mole.dataset.type = critterKey;
    mole.dataset.hitsLeft = String(critter.hitsToKill);
    mole.dataset.missed = "true";
    mole.textContent = critter.emoji;
    mole.classList.add("active");

    mole._timeout = setTimeout(() => {
        if (mole === activeMole && mole.classList.contains("active") && mole.dataset.missed === "true") {
            mole.classList.remove("active");
            activeMole = null;

            lives--;
            lostLifeThisPhase = true;
            combo = 0;
            comboValue.textContent = combo;

            console.log("Missed. Lives:", lives);

            if (lives <= 0) {
                gameOver();
            }
        }
    }, Math.max(300, spawnSpeed - 50));
}

function startGame() {
    clearInterval(moleInterval);
    clearInterval(timer);

    applyPhaseSettings();

    timerBar.classList.remove("warning");
    timerBar.style.width = "100%";
    timerValue.textContent = formatTime(time);

    randomMole();
    moleInterval = setInterval(randomMole, spawnSpeed);

    timer = setInterval(() => {
        time--;

        const timePercent = Math.max(0, (time / maxTime) * 100);
        timerBar.style.width = `${timePercent}%`;
        timerValue.textContent = formatTime(Math.max(0, time));

        if (time < 30) {
            timerBar.classList.add("warning");
        }

        if (time <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 1000);
}

/* GAME OVER */
function gameOver() {
    clearInterval(moleInterval);
    clearInterval(timer);

    moles.forEach(m => {
        clearTimeout(m._timeout);
        m.classList.remove("active");
    });

    activeMole = null;
    finalScore.textContent = `Score: ${score}`;

    showScreen(gameOverScreen);
}

/* RESET */
function resetGame() {
    clearInterval(moleInterval);
    clearInterval(timer);

    score = 0;
    combo = 0;
    time = 100;
    lives = 3;
    phase = 1;
    activeMole = null;
    lostLifeThisPhase = false;
    currentStory = 0;

    applyPhaseSettings();

    scoreValue.textContent = "0";
    comboValue.textContent = "0";
    timerBar.style.width = "100%";
    timerBar.classList.remove("warning");
    timerValue.textContent = formatTime(time);
    finalScore.textContent = "Score: 0";

    moles.forEach(m => {
        clearTimeout(m._timeout);
        m.classList.remove("active");
        m.classList.remove("matched");
        m.dataset.missed = "true";
        m.textContent = "🐹";
    });
}
