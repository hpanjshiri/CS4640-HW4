/* loaded/saved with localStorage */
let state = {
    currentGame: {
        target: "",
        letters: [],
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0,
        isOver: false
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

/* ----- small helper for the status text ----- */
function setStatus(msg) {
    const p = document.getElementById("status");
    if (p) p.textContent = msg || "";
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

    state.currentGame = {
        target: word,
        letters: shuffle(word.split("")),
        guessedCorrect: [],
        guessedWrong: 0,
        score: 0,
        isOver: false
    };

    setStatus("");  // clear any old win/end message
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

/* ----- end game logic with win/lose flag and message ----- */
function endGame(won) {
    // avoid double-counting if game is already over
    if (!state.currentGame.target || state.currentGame.isOver) return;

    const g = state.currentGame;
    const s = state.stats;

    s.gamesPlayed += 1;
    s.totalCorrect += g.guessedCorrect.length;
    s.totalIncorrect += g.guessedWrong;

    if (s.gamesPlayed === 1) {
        s.highestScore = g.score;
        s.lowestScore = g.score;
    } else {
        if (g.score > s.highestScore) {
            s.highestScore = g.score;
        }
        if (g.score < s.lowestScore) {
            s.lowestScore = g.score;
        }
    }

    // mark game as over but keep board visible
    state.currentGame.isOver = true;

    saveState();
    renderStats();

    if (won) {
        setStatus(`You found the target word "${g.target}"! Click "Begin New Game" to play again.`);
    } else {
        setStatus(`Game ended. Click "Begin New Game" to start a new game.`);
    }
}

window.addEventListener("DOMContentLoaded", () => { 
    // new game button
    const newGameBtn = document.getElementById("newGameBtn");
    if (newGameBtn) {
        newGameBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const g = state.currentGame;

            // if there was an in-progress game that isn't marked over yet, end it as a loss
            if (g.target && !g.isOver && (g.guessedCorrect.length > 0 || g.guessedWrong > 0 || g.score > 0)) {
                endGame(false);
            }

            getRandomWord(newGame);
        });
    }

    // shuffle button
    const shuffleBtn = document.getElementById("shuffleBtn");
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            // if game is over, don't allow more shuffles
            if (!state.currentGame.target || state.currentGame.isOver) {
                setStatus(`Game is over. Click "Begin New Game" to play again.`);
                return;
            }
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

            // if the game is over, ignore guesses
            if (!state.currentGame.target || state.currentGame.isOver) {
                setStatus(`Game is over. Click "Begin New Game" to play again.`);
                return;
            }

            if (!guess) return;

            if (!validateLetters(guess)) {
                state.currentGame.guessedWrong++;
                renderGame();
                saveState();
                return;
            }

            // if it's exactly the 7-letter target word, treat as win
            if (guess === state.currentGame.target) {
                const stored = guess.toLowerCase();
                if (!state.currentGame.guessedCorrect.includes(stored)) {
                    state.currentGame.guessedCorrect.push(stored);
                    state.currentGame.score += guess.length;
                }
                renderGame();
                saveState();
                endGame(true);
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
        score: 0,
        isOver: false
    };
    renderGame();

    setStatus(""); // clear any previous message
    alert("History Cleared");
});
