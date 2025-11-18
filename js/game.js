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
    document.querySelector()
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
}