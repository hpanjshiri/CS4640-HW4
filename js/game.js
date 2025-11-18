/* loaded/saved with localStorage */
let state = {
    currentGame: {
        target: "",
        letters: [],
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0
    },
    stats: {
        gamesPlayed: 0,
        highestScore: 0,
        lowestScore: null,
        totalCorrect: 0,
        totalIncorrect: 0
    }
};

function saveState() {
    localStorage.setItem("anagramState", JSON.stringify(state));
}

if (localStorage.getItem("anagramState")) {
    state = JSON.parse(localStorage.getItem("anagramState"));
    renderStats();
}

// shuffle helper
function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// set up new game
function newGame(obj) {
    const word = obj.word.toUpperCase();

    // store JSON objs with new game attributes
    state.currentGame = {
        target: word,
        letters: shuffle(word.split("")),
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0
    };

    renderGame();
    saveState();
}

// render game helper
function renderGame() {
    // score
    document.querySelector("h2").textContent = 
        `Score: ${state.currentGame.score}`;

    // letters
    document.querySelector(".letters").textContent = 
        state.currentGame.letters.join(" ");
    

    // correct words list
    const ul = document.querySelector(".panel ul");
    ul.innerHTML = "";

    // grouped words by length
    const grouped = {};
    for (let w of state.currentGame.guessedCorrect) {
        const len = w.length;
        if (!grouped[len]) grouped[len] = [];
        grouped[len].push(w);
    }

    for (let len in grouped) {
        ul.innerHTML += `<li><strong>${len}-letter words</strong>: ${grouped[len].join(", ")}</li>`;
    }
}

// render game stats
function renderStats() {
    // const stats = state.stats;

    // const gamesSpan = document.querySelector("#stat-games");
    // const highSpan = document.querySelector("#stat-high");
    // const lowSpan = document.querySelector("#stat-low");
    // const avgCorrectSpan = document.querySelector("#stat-avg-correct");
    // const avgIncorrectSpan = document.querySelector("#stat-avg-incorrect");

    // const games = stats.gamesPlayed || 0;
    // const totalCorrect = stats.totalCorrect || 0;
    // const totalIncorrect = stats.totalIncorrect || 0;

    // const avgCorrect = (games > 0) ? (totalCorrect / games).toFixed(2) : "0";
    // const avgIncorrect = (games > 0) ? (totalIncorrect / games).toFixed(2) : "0";

    // if (gamesSpan) gamesSpan.textContent = games;
    // if (highSpan) highSpan.textContent = stats.highestScore || 0;
    // if (lowSpan) lowSpan.textContent = (stats.lowestScore == null ? 0 : stats.lowestScore);
    // if (avgCorrectSpan) avgCorrectSpan.textContent = avgCorrect;
    // if (avgIncorrectSpan) avgIncorrectSpan.textContent = avgIncorrect;
    const stats = state.stats;

    const gamesSpan = document.querySelector("#stat-games");
    const highSpan = document.querySelector("#stat-high");
    const lowSpan = document.querySelector("#stat-low");
    const avgCorrectSpan = document.querySelector("#stat-avg-correct");
    const avgIncorrectSpan = document.querySelector("#stat-avg-incorrect");

    const games = stats.gamesPlayed || 0;
    const totalCorrect = stats.totalCorrect || 0;
    const totalIncorrect = stats.totalIncorrect || 0;

    const avgCorrect = (games > 0) ? (totalCorrect / games).toFixed(2) : "0";
    const avgIncorrect = (games > 0) ? (totalIncorrect / games).toFixed(2) : "0";

    if (gamesSpan) gamesSpan.textContent = games;
    if (highSpan) highSpan.textContent = stats.highestScore || 0;
    if (lowSpan) lowSpan.textContent = (stats.lowestScore == null ? 0 : stats.lowestScore);
    if (avgCorrectSpan) avgCorrectSpan.textContent = avgCorrect;
    if (avgIncorrectSpan) avgIncorrectSpan.textContent = avgIncorrect;
}

async function checkDictionaryWord(word) {
    let response = await fetch(
        "https://cs4640.cs.virginia.edu/homework/checkword.php",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ word })
        }
    );

    return await response.json();
}

function validateLetters(guess) {
    const available = [...state.currentGame.target];
    for (let char of guess) {
        let idx = available.indexOf(char);
        if (idx === -1) return false;
        available.splice(idx, 1);
    }
    return true;
}

async function handleGuess(guess) {
    guess = guess.toUpperCase();

    if (!validateLetters(guess)) {
        state.currentGame.guessedWrong++;
        renderGame();
        saveState();
        return;
    }

    let result = await checkDictionaryWord(guess.toLowerCase());

    if (result.valid) {
        if (!state.currentGame.guessedCorrect.includes(guess)) {
            state.currentGame.guessedCorrect.push(guess);
            state.currentGame.score += guess.length;
        }
    } else {
        state.currentGame.guessedWrong++;
    }

    renderGame();
    saveState();

    if (guess === state.currentGame.target) {
        endGame();
    }
}

window.addEventListener("DOMContentLoaded", () => { 
    // start game button
    const startGameBtn = document.getElementById("startGameBtn");
    if (startGameBtn) {
        startGameBtn.addEventListener("click", (e) => {
            e.preventDefault();
            getRandomWord(newGame);
        });
    }

    // new game button
    const newGameBtn = document.getElementById("newGameBtn");
    if (newGameBtn) {
        newGameBtn.addEventListener("click", (e) => {
            e.preventDefault();
            getRandomWord(newGame);
        });
    }

    // shuffle button
    const shuffleBtn = document.getElementById("shuffleBtn");
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            state.currentGame.letters = shuffle(state.currentGame.letters);
            renderGame();
            saveState();
        });
    }

    const guessForm = document.getElementById("guessForm");
    if (guessForm) {
        guessForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const guess = e.target.guess.value.trim().toUpperCase();
            e.target.guess.value = "";

            if (!guess) return;

            if (!validateLetters(guess)) {
                state.currentGame.guessedWrong++;
                renderGame();
                saveState();
                return;
            }

            const result = await checkDictionaryWord(guess.toLowerCase());

            if (result.valid) {
                if (!state.currentGame.guessedCorrect.includes(guess.toLowerCase())) {
                    state.currentGame.guessedCorrect.push(guess.toLowerCase());
                    state.currentGame.score += guess.length;
                }
            } else {
                state.currentGame.guessedWrong++;
            }
            
            renderGame();
            saveState();

            // if (guess === state.currentGame.target) {
            //     endGame();
            // }
        });
        const saved = localStorage.getItem("anagramState");
        if (saved) {
            state = JSON.parse(saved);
            renderStats();
            renderGame();
        }
    }
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    state.stats = {
        gamesPlayed: 0,
        highestScore: 0,
        lowestScore: null,
        totalCorrect: 0,
        totalIncorrect: 0
    };

    localStorage.removeItem("anagramState");
    renderStats();
    state.currentGame = {
        target: "",
        letters: [],
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0
    };
    renderGame();

    alert("History Cleared");
});

