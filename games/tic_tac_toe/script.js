const cells = Array.from(document.querySelectorAll(".cell"));
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const gameTypeBtn = document.getElementById("gameTypeBtn");
const onePlayerBtn = document.getElementById("onePlayerBtn");
const twoPlayersBtn = document.getElementById("twoPlayersBtn");
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameDescription = document.getElementById("gameDescription");
const playerOneLabel = document.getElementById("playerOneLabel");
const playerTwoLabel = document.getElementById("playerTwoLabel");

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;
let gameMode = null;

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  statusText.textContent =
    gameMode === "single" ? "Your turn (X)" : "Player 1 (X) turn";
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.className = "cell";
    cell.disabled = false;
  });
}

function checkWinner() {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: [a, b, c] };
    }
  }
  if (board.every((cell) => cell !== null))
    return { winner: "draw", combo: null };

  return null;
}

function makeMove(index, symbol) {
  board[index] = symbol;
  cells[index].textContent = symbol;
  cells[index].classList.add(symbol.toLowerCase());
  cells[index].disabled = true;

  const result = checkWinner();

  if (result) {
    gameOver = true;

    cells.forEach((cell) => (cell.disabled = true));
    if (result.combo)
      result.combo.forEach((i) => cells[i].classList.add("win"));

    if (result.winner === "draw") {
      statusText.textContent = "It's a draw!";
    } else if (gameMode === "single") {
      statusText.textContent =
        result.winner === "X" ? "You win 🎉!" : "Computer wins!";
    } else {
      statusText.textContent =
        result.winner === "X"
          ? "Player 1 (X) wins 🎉!"
          : "Player 2 (O) wins 🎉!";
    }

    return true;
  }
  return false;
}

function playComputerTurn() {
  const availableCells = board.reduce((available, value, index) => {
    if (value === null) available.push(index);
    return available;
  }, []);
  const randomIndex = Math.floor(Math.random() * availableCells.length);
  const finished = makeMove(availableCells[randomIndex], "O");

  if (!finished) {
    currentPlayer = "X";
    statusText.textContent = "Your turn (X)";
  }
}

function startGame(mode) {
  gameMode = mode;
  modeScreen.hidden = true;
  gameScreen.hidden = false;
  gameDescription.textContent =
    mode === "single"
      ? "First to get three in a row wins. You play against the computer."
      : "First to get three in a row wins. Take turns playing.";
  playerOneLabel.textContent = mode === "single" ? "You:" : "Player 1:";
  playerTwoLabel.textContent = mode === "single" ? "Computer:" : "Player 2:";
  resetGame();
  cells[0].focus();
}

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (gameOver || (gameMode === "single" && currentPlayer !== "X")) return;

    const index = Number(cell.dataset.index);
    const finished = makeMove(index, currentPlayer);
    if (finished) return;

    if (gameMode === "single") {
      currentPlayer = "O";
      statusText.textContent = "Computer (O) turn";
      playComputerTurn();
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer === "X" ? "1" : "2"} (${currentPlayer}) turn`;
  });
});

onePlayerBtn.addEventListener("click", () => startGame("single"));
twoPlayersBtn.addEventListener("click", () => startGame("two"));
resetBtn.addEventListener("click", resetGame);
gameTypeBtn.addEventListener("click", () => {
  gameMode = null;
  resetGame();
  gameScreen.hidden = true;
  modeScreen.hidden = false;
  gameDescription.textContent = "Choose a game type to get started.";
  playerOneLabel.textContent = "Player 1:";
  playerTwoLabel.textContent = "Player 2:";
  onePlayerBtn.focus();
});
