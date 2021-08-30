import { shuffle } from "./shuffle.js";
// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeElement = document.querySelector(".final-time");
const baseTimeElement = document.querySelector(".base-time");
const penaltyTimeElement = document.querySelector(".penalty-time");
const playAgainButton = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplayed = "0.0";

// Scroll
let valueY = 0;

function displayBestScores() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreElement = bestScore;
    bestScoreElement.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplayed },
      { questions: 25, bestScore: finalTimeDisplayed },
      { questions: 50, bestScore: finalTimeDisplayed },
      { questions: 99, bestScore: finalTimeDisplayed },
    ];

    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }

  displayBestScores();
}

function updateBestScore() {
  bestScoreArray.forEach((bestScore, index) => {
    if (questionAmount == bestScore.questions) {
      const savedBestScore = Number(bestScoreArray[index].bestScore);

      // Update if final score is less or replacing 0
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplayed;
      }
    }
  });
  displayBestScores();
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

function showScorePage() {
  // Show play again button after 1s
  setTimeout(() => {
    playAgainButton.hidden = false;
  }, 1000);

  gamePage.hidden = true;
  scorePage.hidden = false;
}

function formatAndDisplayTime() {
  // Format numbers
  finalTimeDisplayed = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  // Display numbers
  baseTimeElement.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeElement.textContent = `Penalty Time: +${penaltyTime}s`;
  finalTimeElement.textContent = `${finalTimeDisplayed}s`;
  updateBestScore();

  showScorePage();
}

function stopTimerIfFinishedQuestions() {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);

    // Check for wrong guesses and add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        // Correct guess, no penalty
      } else {
        // Incorrect guess, add penalty
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    formatAndDisplayTime();
  }
}

function addTenthSecondToTimePlayed() {
  timePlayed += 0.1;
  stopTimerIfFinishedQuestions();
}

function startTimer() {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;

  timer = setInterval(addTenthSecondToTimePlayed, 100);
  gamePage.removeEventListener("click", startTimer);
}

// Get random number up to a maximum number
function getRandomNumberUpToMaxNumber(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomNumberUpToMaxNumber(questionAmount);
  console.log("questionAmount :", questionAmount);
  console.log("correctEquations :", correctEquations);

  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log("wrongEquations :", wrongEquations);

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomNumberUpToMaxNumber(9) + 1;
    secondNumber = getRandomNumberUpToMaxNumber(9) + 1;
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomNumberUpToMaxNumber(9) + 1;
    secondNumber = getRandomNumberUpToMaxNumber(9) + 1;
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomNumberUpToMaxNumber(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }

  shuffle(equationsArray);
}

function navigateToGamePage() {
  countdownPage.hidden = true;
  gamePage.hidden = false;
}

// AKA equationToDOM()
function displayEquations() {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement("div");
    item.classList.add("item");

    // Equation Text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;

    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
    console.log("item :", item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  displayEquations();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

function selectQuestionsOption() {
  radioContainers.forEach((radio) => {
    // Remove selected label styling
    radio.classList.remove("selected-label");
    // Add it back if radio input is checked
    if (radio.children[1].checked) radio.classList.add("selected-label");
  });
}

function getSelectedRadioButtonValue() {
  let radioValue;

  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

function startCountdown() {
  countdown.textContent = "3";
  setTimeout(() => {
    countdown.textContent = "2";
  }, 500);
  setTimeout(() => {
    countdown.textContent = "1";
  }, 1000);
  setTimeout(() => {
    countdown.textContent = "GO!";
  }, 1500);
}

// AKA showCountdown()
function navigateFromSplashToCountdownPage() {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  startCountdown();
  populateGamePage();
  setTimeout(navigateToGamePage, 2000);
  itemContainer.scrollTo({ top: 0, behavior: "instant" });
}

function selectQuestionAmount(event) {
  event.preventDefault();
  questionAmount = getSelectedRadioButtonValue();

  if (questionAmount) navigateFromSplashToCountdownPage();
}

// AKA select()
function storeAnswerAndScroll(guessedTrue) {
  // Scrolls 80 pixels at a time
  valueY += 80;
  itemContainer.scroll(0, valueY);

  // Add guesses to array
  guessedTrue ? playerGuessArray.push("true") : playerGuessArray.push("false");
  console.log("playerGuessArray :", playerGuessArray);
  return;
}
window.storeAnswerAndScroll = storeAnswerAndScroll;

function playAgain() {
  // Add the event listener back
  gamePage.addEventListener("click", startTimer);

  playAgainButton.hidden = true;
  scorePage.hidden = true;
  splashPage.hidden = false;

  equationsArray = [];
  playerGuessArray = [];

  valueY = 0;
}

// Event listeners
startForm.addEventListener("click", selectQuestionsOption);
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);
playAgainButton.addEventListener("click", playAgain);

// On Load
getSavedBestScores();
