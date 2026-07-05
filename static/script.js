const wordDisplay = document.getElementById("word-display");
const alphabetDiv = document.getElementById("alphabet");
const wrongCountDiv = document.getElementById("wrong-count");
const messageDiv = document.getElementById("message");
const newGameBtn = document.getElementById("new-game");

const buttons = {};

function buildAlphabet() {
  alphabetDiv.innerHTML = "";
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.addEventListener("click", () => guess(letter));
    alphabetDiv.appendChild(btn);
    buttons[letter] = btn;
  }
}

function render(state) {
  wordDisplay.innerHTML = "";
  for (const letter of state.display) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = letter || " ";
    wordDisplay.appendChild(slot);
  }

  for (let i = 1; i <= state.max_wrong; i++) {
    document.getElementById(`part-${i}`).classList.toggle("visible", i <= state.wrong_count);
  }

  wrongCountDiv.textContent = `Wrong guesses: ${state.wrong_count} / ${state.max_wrong}`;

  for (const [letter, btn] of Object.entries(buttons)) {
    btn.classList.remove("correct", "wrong");
    btn.disabled = state.guessed.includes(letter) || state.status !== "playing";
    if (state.guessed.includes(letter)) {
      btn.classList.add(state.display.includes(letter) ? "correct" : "wrong");
    }
  }

  if (state.status === "won") {
    messageDiv.textContent = `You win! The word was ${state.secret_word}.`;
  } else if (state.status === "lost") {
    messageDiv.textContent = `You lose! The word was ${state.secret_word}.`;
  } else {
    messageDiv.textContent = "";
  }
}

async function guess(letter) {
  const res = await fetch("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ letter }),
  });
  const state = await res.json();
  render(state);
}

async function startNewGame() {
  const res = await fetch("/api/new", { method: "POST" });
  const state = await res.json();
  render(state);
}

buildAlphabet();
newGameBtn.addEventListener("click", startNewGame);
startNewGame();
