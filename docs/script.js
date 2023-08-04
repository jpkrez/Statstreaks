// Initialize the streak counter and game state flags
let streakCounter = 0;
let highScore = 0;
let isStreakWon = false;
let isGameEnded = false;
let featuredStat = null;
let jsonData = null; // Declare jsonData at the global level

// Function to update the streak counter when the user wins
const incrementStreakCounter = () => {
  streakCounter++;
};

const resetStreakCounter = () => {
  streakCounter = 0;
};

// Function to reset the streak counter and game state when the user loses or clicks "Play Again"
const resetGameState = () => {
  streakCounter = 0;
  selectedPick = null;
  isStreakWon = false;
  isGameEnded = false;
  featuredStat = null; // Reset the current featured stat
  confirmButton.textContent = 'Confirm Pick';
  confirmButton.style.backgroundColor = '#45a049';

  displayFeaturedStat(); // Fetch a new featured stat and display it
  updateButtonStyles();
};

// Function to handle the "Play Again" scenario
const playAgain = () => {
  resetGameState();
  startGame(); // Restart the game after resetting the state
};

// Function to handle the "Continue the Streak" scenario
const continueStreak = () => {
  confirmButton.textContent = 'Confirm Pick';
  startGame(); // Allow the user to make a new prediction
};

function updateStreak(streak) {
  const streakCounter = document.getElementById("streakCounter");
  streakCounter.textContent = streak;

  // Remove previous fire classes (if any)
  streakCounter.classList.remove("streak-fire-orange","streak-fire-red","streak-fire-blue");

  // Add the appropriate fire class based on the streak value
  if (streak >= 3 && streak < 5) {
    streakCounter.classList.add("streak-fire-orange");
  } else if (streak >= 5 && streak < 10) {
    streakCounter.classList.add("streak-fire-red");
  } else if (streak >= 10) {
    streakCounter.classList.add("streak-fire-blue");
  }
}

// Function to start the game when the user clicks on one of the buttons
const startGame = async () => {
  isGameStarted = true;
  isGameEnded = false; // Reset isGameEnded to false when starting a new game

  try {
    // Fetch a new featured stat and display it
    await getJsonData();
    featuredStat = getFeaturedStatWithOverUnder(jsonData);
    displayFeaturedStat();
  } catch (error) {
    console.error('Error fetching data:', error);
    // Show an error message on the UI
    const featuredStatContainer = document.getElementById('featuredStatContainer');
    featuredStatContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
  }

  updateButtonStyles();
};

// Access the necessary elements in the DOM
const overButton = document.getElementById('over-button');
const underButton = document.getElementById('under-button');
const confirmButton = document.getElementById('confirm-button');
const confirmedPick = document.getElementById('confirmed-pick');

// Set initial state
let selectedPick = null;

// Event handlers
function handleOverButtonClick() {
  if (isGameStarted && !isGameEnded) {
    selectedPick = 'over';
    updateButtonStyles();
  }
}

function handleUnderButtonClick() {
  if (isGameStarted && !isGameEnded) {
    selectedPick = 'under';
    updateButtonStyles();
  }
}

// Function to handle the confirm button click
// Function to handle the confirm button click
const handleConfirmButtonClick = () => {
  if (isGameEnded) {
    // Game has ended, handle "Play Again" or "Continue the Streak" scenario
    if (isStreakWon) {
      continueStreak(); // Continue the streak
    } else {
      playAgain(); // Play again
    }
  } else {
    if (selectedPick) {
      const actualKills = featuredStat.actualKills;

      if (
        (selectedPick === 'over' && actualKills > featuredStat.overUnder) ||
        (selectedPick === 'under' && actualKills < featuredStat.overUnder)
      ) {
        // User's prediction was correct
        console.log('Congratulations! You made the right prediction!');
        confirmedPick.textContent = `Congratulations! You predicted correctly. \nActual Kills: ${actualKills}`;
        isStreakWon = true; // Set the game state to won
        isGameEnded = true; // Game is ended now
        confirmButton.textContent = 'Continue the Streak'; // Change the button text
        incrementStreakCounter(); // Increment the streak counter
        updateStreak(streakCounter)
        // Update the streak counter
        const streakCounterElement = document.getElementById('streakCounter');
        streakCounterElement.textContent = streakCounter;
        //Update high score
        if (streakCounter>highScore){
          highScore = streakCounter
        }
        const highScoreElement = document.getElementById('highScore');
        highScoreElement.textContent = highScore;
      } else {
        // User's prediction was wrong
        console.log('Sorry, you were wrong.');
        confirmButton.style.backgroundColor = '#ff0000';
        confirmedPick.textContent = `Sorry, you predicted incorrectly. \nActual Kills: ${actualKills}`;
        isStreakWon = false; // Set the game state to lost
        isGameEnded = true; // Game is ended now
        confirmButton.textContent = 'Play Again'; // Change the button text
        resetStreakCounter(); // Reset streak counter
        updateStreak(streakCounter)
        // Update the streak counter
        const streakCounterElement = document.getElementById('streakCounter');
        streakCounterElement.textContent = streakCounter;
        if (streakCounter>highScore){
          highScore = streakCounter
        }
        const highScoreElement = document.getElementById('highScore');
        highScoreElement.textContent = highScore;
        return; // Return early to avoid updating the game state with "Continue the Streak"
      }

      // Reset the selected pick to allow the user to choose again
      selectedPick = null;
      updateButtonStyles();
    } else {
      console.log('Please select Over or Under before confirming.');
      confirmedPick.textContent = 'Please select Over or Under before confirming.';
    }
  }
};



// Update button styles based on the selected pick
const updateButtonStyles = () => {
  overButton.classList.toggle('selected', isGameStarted && !isGameEnded && selectedPick === 'over');
  underButton.classList.toggle('selected', isGameStarted && !isGameEnded && selectedPick === 'under');
};

async function getJsonData() {
  const response = await fetch('http://localhost:3000/api/data');
  jsonData = await response.json(); // Update the global jsonData variable
}

function getRandomStat(data) {
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

function getFeaturedStat(data) {
  const randomStat = getRandomStat(data);
  const mode = randomStat['Mode'];
  const mapName = randomStat['Map.Name'];
  const playerName = randomStat['Player.Name'];
  const teamName = randomStat['Team.Name'];
  const opponentTeamName = randomStat['Opponent.Name'];
  const actualKills = randomStat['Kills'];

  return { mode, mapName, playerName, teamName, opponentTeamName, actualKills };
}

function calculateAverageKills(data, playerName, mode, mapName) {
  const playerStats = data.filter(
    (stat) =>
      stat['Player.Name'] === playerName &&
      stat['Mode'] == mode &&
      stat['Map.Name'] === mapName
  );

  const totalKills = playerStats.reduce((total, stat) => total + parseInt(stat['Kills']), 0);
  const averageKills = totalKills / playerStats.length;

  return averageKills;
}

function getFeaturedStatWithOverUnder(data) {
  const { mode, mapName, playerName, teamName, opponentTeamName, actualKills } = getFeaturedStat(data);
  const averageKills = calculateAverageKills(data, playerName, mode, mapName);

  // Set the Over/Under value, e.g., you can set it to 1 kill above the average.
  const overUnder = Math.round(averageKills) + 0.5;

  return { mode, mapName, playerName, teamName, opponentTeamName, averageKills, overUnder, actualKills };
}

const displayFeaturedStat = () => {
  if (!featuredStat) {
    console.error('No featured stat available.');
    return;
  }

  // Create the HTML content to display the featured stat
  const featuredStatHTML = `
    <p>Player: ${featuredStat.playerName} (${featuredStat.teamName}) vs. ${featuredStat.opponentTeamName}</p>
    <p>Map: ${featuredStat.mode} - ${featuredStat.mapName}</p>
    <p>Over/Under: ${featuredStat.overUnder}</p>
  `;

  // Get the featured stat container and set its HTML content
  const featuredStatContainer = document.getElementById('featuredStatContainer');
  featuredStatContainer.innerHTML = featuredStatHTML;

  // Show the buttons and other elements now that the content is ready
  const buttonContainer = document.getElementById('buttonContainer');
  buttonContainer.style.display = 'block';

  // Reset the confirmedPick element and button styles
  confirmedPick.textContent = 'Please select Over or Under before confirming.';
  updateButtonStyles();
};

startGame();

// Attach event listeners after the page is loaded
window.onload = () => {
  const overButton = document.getElementById('over-button');
  const underButton = document.getElementById('under-button');
  const confirmButton = document.getElementById('confirm-button');

  overButton.addEventListener('click', handleOverButtonClick);
  underButton.addEventListener('click', handleUnderButtonClick);
  confirmButton.addEventListener('click', handleConfirmButtonClick);

  // Set initial game state
  isGameStarted = true;
};