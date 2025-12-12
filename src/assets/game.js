// Game logic - adapted for Angular
let gameMenu, gameContainer, startGameButton, pokeballOpening, timerDiv, scoreDiv;
let gameInstructions, gameLinks, gameEnded, finalScoreMessage, backToMenuButton;

const GAME_DURATION = 30 * 1000; // milliseconds
let startTime = null;
let score = 0;
const NUM_TRAINERS = 401;
const NUM_POKEMONS = 401;
const NUM_DISPLAYED = 300;

const IMG_SIZE = 70;
const SAFE_MARGIN = 70;
let START_POSITION_TOP = null;
let START_POSITION_LEFT = null;

const trainerImages = [];
const pokemonImages = [];
const imageNodes = [];

function initializeGame() {
    gameMenu = document.getElementById("game-menu");
    gameContainer = document.getElementById("game");
    startGameButton = document.getElementById("start-game-button");
    pokeballOpening = document.getElementById("pokeball-opening");
    timerDiv = document.getElementById("timer");
    scoreDiv = document.getElementById("score");
    gameInstructions = document.querySelector(".game-instructions");
    gameLinks = document.getElementById("game-links");
    gameEnded = document.getElementById("game-ended");
    finalScoreMessage = document.getElementById("final-score-message");
    backToMenuButton = document.getElementById("back-to-menu-button");

    // Initialize image arrays with Angular asset paths
    for (let i = 0; i < NUM_TRAINERS; i++) {
        trainerImages.push("assets/images/trainers/" + i + ".png");
    }
    for (let i = 0; i < NUM_POKEMONS; i++) {
        pokemonImages.push("assets/images/pokemon_svg/" + i + ".svg");
    }
    
    if (gameContainer) {
        createElements();
    }
    
    if (startGameButton) {
        startGameButton.onclick = startGame;
    }
    
    if (backToMenuButton) {
        backToMenuButton.onclick = showGameMenu;
    }
}

function startGame() {
    score = 0;
    if (scoreDiv) scoreDiv.innerHTML = `Score: ${score}`;
    setImageVisibility(gameMenu, false);
    setImageVisibility(timerDiv, true);
    setImageVisibility(scoreDiv, true);
    startRound();
    startCountdown();
}

function startCountdown() {
    startTime = performance.now();
    updateCountdown(startTime);
    requestAnimationFrame(updateCountdown);
}

function updateCountdown(timestamp) {
    const elapsed = timestamp - startTime;
    const remaining = Math.max(0, GAME_DURATION - elapsed);

    if (timerDiv) {
        timerDiv.innerHTML = `Time: ${Math.round(remaining / 100) / 10}`;
    }

    if (remaining > 0) {
        requestAnimationFrame(updateCountdown);
    } else {
        endGame();
    }
}

function startRound() {
    START_POSITION_TOP = (window.innerHeight * 80) / 100;
    START_POSITION_LEFT = window.innerWidth / 2 - IMG_SIZE / 2;

    shuffle(trainerImages);
    const pokemon = pokemonImages[Math.floor(Math.random() * NUM_POKEMONS)];

    const srcs = trainerImages.slice(0, NUM_DISPLAYED - 1);
    srcs.push(pokemon);

    loadImages(imageNodes, srcs, () => {
        setImageVisibility(pokeballOpening, true);
        for (let i = 0; i < NUM_DISPLAYED; i++) {
            setImageVisibility(imageNodes[i], true);
            animateCurveMove(imageNodes[i]);
        }
    });
}

function pokemonFound() {
    for (let i = 0; i < imageNodes.length; i++) {
        setImageVisibility(imageNodes[i], false);
    }
    score++;
    if (scoreDiv) scoreDiv.innerHTML = `Score: ${score}`;
    startRound();
}

function endGame() {
    for (let i = 0; i < imageNodes.length; i++) {
        setImageVisibility(imageNodes[i], false);
    }
    setImageVisibility(pokeballOpening, false);
    setImageVisibility(timerDiv, false);
    setImageVisibility(scoreDiv, false);
    showEndScreen();
}

function showEndScreen() {
    setImageVisibility(gameMenu, true);
    setImageVisibility(gameInstructions, false);
    setImageVisibility(gameLinks, false);
    if (finalScoreMessage) {
        finalScoreMessage.innerHTML = `Game Over! Your final score is: ${score}`;
    }
    setImageVisibility(gameEnded, true);
}

function showGameMenu() {
    setImageVisibility(gameInstructions, true);
    setImageVisibility(gameLinks, true);
    setImageVisibility(gameEnded, false);
}

function createElements() {
    if (!gameContainer) return;
    
    // Clear existing elements
    while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
    }
    imageNodes.length = 0;
    
    for (let i = 0; i < NUM_DISPLAYED; i++) {
        let trainer = document.createElement("img");
        setImageAttributes(trainer);
        gameContainer.appendChild(trainer);
        imageNodes.push(trainer);
    }
    imageNodes[NUM_DISPLAYED - 1].style.zIndex = 1000; // the pokemon
    imageNodes[NUM_DISPLAYED - 1].onclick = pokemonFound;
}

function setImageAttributes(img) {
    img.width = IMG_SIZE;
    img.height = IMG_SIZE;
    img.style.position = "absolute";
    setImageVisibility(img, false);
}

function generateRandomPosition() {
    let top = Math.floor(
        Math.random() * (window.innerHeight - SAFE_MARGIN * 3 - IMG_SIZE)
    ) + SAFE_MARGIN * 1.5;
    let left = Math.floor(
        Math.random() * (window.innerWidth - IMG_SIZE - SAFE_MARGIN * 0.5)
    ) + SAFE_MARGIN * 0.3;
    return {
        top,
        left
    };
}

function loadImages(nodes, srcs, callback) {
    let remaining = nodes.length;
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].onload = () => {
            remaining--;
            if (remaining === 0) callback();
        };
        nodes[i].src = srcs[i];
    }
}

function setImageVisibility(img, visible) {
    if (img) {
        img.style.display = visible ? "block" : "none";
    }
}

function animateCurveMove(img) {
    img.style.top = `${START_POSITION_TOP}px`;
    img.style.left = `${START_POSITION_LEFT}px`;

    let position = generateRandomPosition();
    const newTop = position.top;
    const newLeft = position.left;

    const dx = newLeft - START_POSITION_LEFT;
    const dy = newTop - START_POSITION_TOP;

    const cx = dx * 0.5 + (-dy * 0.3);
    const cy = -window.innerHeight * 0.3 + dx * dx * 0.0005 - 300 * Math.random();

    img.style.setProperty("--cx", `${cx}px`);
    img.style.setProperty("--cy", `${cy}px`);
    img.style.setProperty("--ex", `${dx}px`);
    img.style.setProperty("--ey", `${dy}px`);

    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "curve 1s linear forwards";

    img.onanimationend = () => {
        img.style.animation = "none";
        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
        setImageVisibility(pokeballOpening, false);
    };
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
