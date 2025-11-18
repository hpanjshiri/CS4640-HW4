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