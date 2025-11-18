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

if (localStorage.getItem("anagramState")) {
    state = JSON.parse(localStorage.getItem("anagramState"));
    renderStats();
}

// shuffle helper
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// set up new game
function newGame(obj) {
    const word = obj.word.toUpperCase();

    // store JSON objs with new game attributes
    state.currentGame = {
        target: word,
        letters: shuffle(word,split("")),
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0
    };

    renderGame();
}

// render game helper
function renderGame() {
    // score
    document.querySelector("h2").textContent = 
        `Score: ${state.currentGame.score}`;

    // letters
    document.querySelector(".letters").textContent = 
        `Letters: ${state.currentGam}`
    

    // correct words list
    const ul = document.querySelector(".panel ul");
    ul.innerHTML = "";

    // grouped words by length
    const grouped = {};
    for (let w in state.currentGame.guessedCorrect) {
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
// function renderStats() {
//     const s = state.stats;
//     const statsDiv = document.querySelector(".stats");

//     let lines = statsDiv.querySelectorAll("small");
//     lines[0].textContent = `Games played: ${s.gamesPlayed}`;
//     lines[1].textContent = `Highest score: ${s.highestScore}`;
//     lines[2].textContent = `Lowest score: ${s.lowestScore ?? 0}`;
//     lines[3].textContent = `Average correct words guessed per game: ${s.gamesPlayed ? (s.totalCorrect / s.gamesPlayed).toFixed(2) : 0}`;
//     lines[4].textContent = `Average incorrect words guessed per game: ${s.gamesPlayed ? (s.totalIncorrect / s.gamesPlayed).toFixed(2) : 0}`;
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