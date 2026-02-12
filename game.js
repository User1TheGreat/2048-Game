// --- VARIABLES ---
// 'board' will hold the 4x4 data matrix (numbers)
let board;
// 'score' tracks the current game points
let score = 0;
// Fixed game dimensions
let rows = 4;
let columns = 4;

// --- INITIALIZATION ---
// This function runs automatically when the webpage is fully loaded
window.onload = function () {
  setGame(); // Set up the game board data and visuals

  // Retrieve the high score from localStorage (browser memory)
  // If no score exists yet, default to 0
  document.getElementById("best-score").innerText =
    localStorage.getItem("bestScore") || 0;
};

// Initializes the board data structure and creates visual tile elements
function setGame() {
  // Create a 2D Array (4x4 matrix) filled with 0s to represent empty spaces
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  // Loop through the 2D array rows
  for (let r = 0; r < rows; r++) {
    // Loop through the columns in each row
    for (let c = 0; c < columns; c++) {
      // Create a new div element for each tile
      let tile = document.createElement("div");

      // Set a unique ID for the tile based on its coordinate (e.g., "0-2")
      tile.id = r.toString() + "-" + c.toString();

      // Get the current number from the board data (initially 0)
      let num = board[r][c];

      // Style the tile based on the number and place it in the correct visual position
      updateTile(tile, num, r, c);

      // Add the tile div to the #board div in the HTML
      document.getElementById("board").append(tile);
    }
  }

  // Place the first two random "2" tiles to start the game
  setTwo();
  setTwo();
}

// Resets the game data and clears the visual board to restart
function restartGame() {
  // 1. HIGH SCORE LOGIC: Check if current score beats the high score
  let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
  if (score > bestScore) {
    // If higher, save new high score to localStorage
    localStorage.setItem("bestScore", score);
    // Update the visual high score display
    document.getElementById("best-score").innerText = score;
  }

  // 2. RESET DATA: Reset the current game score to 0
  score = 0;
  document.getElementById("score").innerText = score;

  // 3. RESET VISUALS: Hide the Game Over screen
  document.getElementById("game-over").classList.add("hidden");

  // Clear the board div HTML entirely
  document.getElementById("board").innerHTML = "";

  // Re-run setGame to generate a fresh 4x4 matrix and tiles
  setGame();
}

// Checks if the player has lost (no empty spaces and no adjacent merges possible)
function checkGameOver() {
  // If at least one empty tile exists, the game is still active
  if (hasEmptyTile()) return;

  // Check every tile to see if it can merge with its neighbor
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let current = board[r][c];

      // Check if there is a matching tile to the right
      if (c < columns - 1 && current === board[r][c + 1]) return;

      // Check if there is a matching tile below
      if (r < rows - 1 && current === board[r + 1][c]) return;
    }
  }

  // If we reach here, no moves are possible.
  // Final high score check/update before showing game over
  let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
  if (score > bestScore) {
    localStorage.setItem("bestScore", score);
    document.getElementById("best-score").innerText = score;
  }

  // Make the Game Over div visible
  document.getElementById("game-over").classList.remove("hidden");
}

// Places a new tile with the value "2" in a random empty spot
function setTwo() {
  // If the board is full, do nothing
  if (!hasEmptyTile()) {
    return;
  }

  // Keep looking for an empty spot until we find one
  let found = false;
  while (!found) {
    // Generate random row and column indices
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * columns);

    // If the data spot is 0 (empty), place a 2 there
    if (board[r][c] == 0) {
      board[r][c] = 2; // Update data

      // Find the visual tile div and update it
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      updateTile(tile, 2, r, c);

      found = true; // Exit the loop
    }
  }
}

// Scans the data board for any spot containing 0
function hasEmptyTile() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[r][c] == 0) {
        return true; // Found an empty spot
      }
    }
  }
  return false; // No empty spots found
}

// Updates the visual tile div based on its numerical value and position
function updateTile(tile, num, r, c) {
  // Clear any existing text and classes from the tile div
  tile.innerText = "";
  tile.classList.value = "";

  // Re-add the base 'tile' class for styling
  tile.classList.add("tile");

  // --- ADDED FOR SLIDING ANIMATION ---
  // Add specific classes to determine where the tile sits (e.g., 'row-0', 'col-2')
  tile.classList.add("row-" + r, "col-" + c);
  // ------------------------------------

  // If the tile has a number, display it and apply color styling
  if (num > 0) {
    tile.innerText = num;

    // Assign a color class based on the number (x2, x4, x8, etc.)
    if (num <= 4096) {
      tile.classList.add("x" + num.toString());
    } else {
      // For very high numbers, use a default high-value color
      tile.classList.add("x8192");
    }
  }
}

// --- INPUT HANDLING ---
// Listen for keyboard input (arrows or WASD)
document.addEventListener("keyup", (e) => {
  let moved = false; // Track if a move actually occurred

  // Check which key was pressed and call the corresponding direction function
  if (e.code == "ArrowLeft" || e.code == "KeyA") {
    slideLeft();
    moved = true;
  } else if (e.code == "ArrowRight" || e.code == "KeyD") {
    slideRight();
    moved = true;
  } else if (e.code == "ArrowUp" || e.code == "KeyW") {
    slideUp();
    moved = true;
  } else if (e.code == "ArrowDown" || e.code == "KeyS") {
    slideDown();
    moved = true;
  }

  // If a valid move was made, update the game state
  if (moved) {
    setTwo(); // Add a new random tile
    document.getElementById("score").innerText = score; // Update score display
    checkGameOver(); // Check if the player lost
  }
});

// --- CORE GAME LOGIC (SLIDING & MERGING) ---
// Removes all zeros from an array, shifting numbers to the left
function filterZero(row) {
  return row.filter((num) => num != 0);
}

// Main logic: Slides and merges tiles in a 4-element array
function slide(row) {
  // Step 1: Remove all zeros (e.g., [0, 2, 0, 2] -> [2, 2])
  row = filterZero(row);

  // Step 2: Check adjacent tiles for merging
  for (let i = 0; i < row.length - 1; i++) {
    // If two adjacent tiles have the same value
    if (row[i] == row[i + 1]) {
      row[i] *= 2; // Merge them by doubling the first one
      row[i + 1] = 0; // Empty the second one
      score += row[i]; // Add the new value to the total score
    }
  }

  // Step 3: Remove zeros again after merging (e.g., [4, 0, 0, 0])
  row = filterZero(row);

  // Step 4: Add zeros back to the end to maintain array length of 4
  while (row.length < columns) {
    row.push(0);
  }
  return row;
}

// --- DIRECTIONAL FUNCTIONS ---
// Handles the logic for moving tiles to the left
function slideLeft() {
  for (let r = 0; r < rows; r++) {
    let row = board[r]; // Get the data array for the current row
    row = slide(row); // Process the row data
    board[r] = row; // Update the board data array

    // Update the visual position of every tile in the row
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num, r, c); // Redraw tile with new position classes
    }
  }
}

// Handles the logic for moving tiles to the right
function slideRight() {
  for (let r = 0; r < rows; r++) {
    let row = board[r];
    row.reverse(); // Reverse row to treat it as a left-slide
    row = slide(row); // Process
    row.reverse(); // Reverse back to original order
    board[r] = row;

    // Update visual tiles
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num, r, c);
    }
  }
}

// Handles the logic for moving tiles up
function slideUp() {
  for (let c = 0; c < columns; c++) {
    // Extract column data into a temporary array
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    row = slide(row); // Process column as if it were a row

    // Re-insert processed column data back into the matrix
    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num, r, c);
    }
  }
}

// Handles the logic for moving tiles down
function slideDown() {
  for (let c = 0; c < columns; c++) {
    // Extract column data
    let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
    row.reverse(); // Reverse to treat as up-slide
    row = slide(row);
    row.reverse(); // Reverse back

    // Re-insert data
    for (let r = 0; r < rows; r++) {
      board[r][c] = row[r];
      let tile = document.getElementById(r.toString() + "-" + c.toString());
      let num = board[r][c];
      updateTile(tile, num, r, c);
    }
  }
}

function toggleFooter() {
  const footer = document.querySelector("footer");
  const button = document.getElementById("toggle-footer");

  footer.classList.toggle("open");

  if (footer.classList.contains("open")) {
    button.innerHTML = "&#8595;"; // Down Arrow
  } else {
    button.innerHTML = "&#8593;"; // Up Arrow
  }
}
