const socket = new WebSocket("ws://localhost:3000");

const usernameInput = document.getElementById("username");
const usernameContainer = document.getElementById("login-section");

const joinBtn = document.getElementById("joinBtn");
const quizContainer = document.getElementById("quizContainer");
const questionContainer = document.getElementById("questionContainer");
const questionText = document.getElementById("question");
const optionsList = document.getElementById("options");
const scoreboard = document.getElementById("scoreboard");
const scoreboardTable = document.getElementById("scoreboard-table");
const scoreboardBody = document.getElementById("scoreboard-body");
const resultsSection = document.getElementById("results");
const resultsBody = document.getElementById("results-body");
const startBtn = document.getElementById("startBtn");

// Timer elements
const timerDisplay = document.createElement("div");
timerDisplay.id = "timer";
questionContainer.appendChild(timerDisplay);

// Progress tracker
const progressDisplay = document.createElement("div");
progressDisplay.id = "progress";
progressDisplay.style.marginBottom = "10px";
questionContainer.insertBefore(progressDisplay, questionText);

// Next button
const nextBtn = document.createElement("button");
nextBtn.textContent = "Next";
nextBtn.style.marginTop = "10px";
nextBtn.classList.add("hidden");
questionContainer.appendChild(nextBtn);

// Waiting message
const waitingMessage = document.createElement("div");
waitingMessage.id = "waiting-message";
waitingMessage.textContent = "Waiting for other players to finish...";
waitingMessage.style.marginTop = "20px";
waitingMessage.style.fontWeight = "bold";
waitingMessage.style.textAlign = "center";
waitingMessage.classList.add("hidden");
quizContainer.appendChild(waitingMessage);

let hasAnswered = false;
let currentAnswer = null;
let timer = null;
let timeLeft = 15; // seconds
let quizStarted = false;
let username = "";

joinBtn.onclick = function () {
  username = usernameInput.value;
  if (username) {
    socket.send(JSON.stringify({ type: "join", username: username }));
    usernameContainer.classList.add("hidden");
    quizContainer.classList.remove("hidden");
  }
};

startBtn.onclick = function () {
  resultsSection.classList.add("hidden");
  quizStarted = true;
  socket.send(JSON.stringify({ type: "startQuiz" }));
  startBtn.classList.add("hidden");
};

socket.onmessage = function (event) {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case "question":
      waitingMessage.classList.add("hidden");
      displayQuestion(message);
      break;

    case "answerResult":
      showAnswerResult(message);
      break;

    case "scoreUpdate":
      updateScoreboard(message.scores);
      break;

    case "quizEnd":
      waitingMessage.classList.add("hidden");
      questionContainer.classList.add("hidden");
      showFinalResults(message.scores);
      break;
      
    case "waitingForOthers":
      questionContainer.classList.add("hidden");
      waitingMessage.classList.remove("hidden");
      break;
  }
};

function displayQuestion(message) {
  hasAnswered = false;
  currentAnswer = null;
  timeLeft = 15;
  clearInterval(timer);
  startTimer();

  // Update progress display
  if (message.questionNumber && message.totalQuestions) {
    progressDisplay.textContent = `Question ${message.questionNumber} of ${message.totalQuestions}`;
  }

  questionContainer.classList.remove("hidden");
  questionText.textContent = message.question;
  optionsList.innerHTML = "";
  nextBtn.classList.add("hidden");

  message.options.forEach((option, index) => {
    const optionBtn = document.createElement("button");
    optionBtn.textContent = option;
    optionBtn.classList.add("option");
    optionBtn.onclick = () => selectAnswer(index);
    optionsList.appendChild(optionBtn);
  });
}

function selectAnswer(index) {
  if (hasAnswered) return;
  hasAnswered = true;

  const selectedOption = document.querySelectorAll(".option")[index];
  selectedOption.classList.add("selected");
  currentAnswer = index;

  socket.send(JSON.stringify({ type: "answer", answer: index }));
}

function showAnswerResult(message) {
  clearInterval(timer);
  timerDisplay.textContent = "⏱ Time's up or answered";

  const options = document.querySelectorAll(".option");
  options.forEach((option, index) => {
    option.disabled = true;
    if (index === message.correctAnswer) {
      option.classList.add("correct");
    } else if (index === currentAnswer && index !== message.correctAnswer) {
      option.classList.add("incorrect");
    }
  });

  nextBtn.classList.remove("hidden");
}

function updateScoreboard(scores) {
  scoreboardBody.innerHTML = "";
  
  scores.forEach((player) => {
    const row = document.createElement("tr");
    
    const nameCell = document.createElement('td');
    nameCell.textContent = player.username;
    
    const scoreCell = document.createElement('td');
    scoreCell.textContent = player.score;
    
    const progressCell = document.createElement('td');
    if (player.quizCompleted) {
      progressCell.textContent = "Completed";
    } else {
      progressCell.textContent = `${player.currentQuestion}/${player.totalQuestions}`;
    }
    
    // Highlight the current user
    if (player.username === username) {
      row.classList.add("current-user");
    }
    
    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    row.appendChild(progressCell);
    scoreboardBody.appendChild(row);
  });
  
  scoreboardTable.classList.remove("hidden");
}

function showFinalResults(scores) {
  resultsSection.classList.remove("hidden");
  waitingMessage.classList.add("hidden");
  
  resultsBody.innerHTML = "";
  
  scores.forEach((player, index) => {
    const row = document.createElement("tr");
    
    const rankCell = document.createElement('td');
    rankCell.textContent = index + 1;
    
    const nameCell = document.createElement('td');
    nameCell.textContent = player.username;
    
    const scoreCell = document.createElement('td');
    scoreCell.textContent = player.score;
    
    // Highlight the current user
    if (player.username === username) {
      row.classList.add("current-user");
    }
    
    // Add medal for top 3
    if (index < 3) {
      const medal = document.createElement('span');
      medal.classList.add('medal');
      medal.textContent = ['🥇', '🥈', '🥉'][index];
      nameCell.prepend(medal);
    }
    
    row.appendChild(rankCell);
    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    resultsBody.appendChild(row);
  });

  // New Game button
  const newGameBtn = document.createElement("button");
  newGameBtn.textContent = "New Game";
  newGameBtn.style.marginTop = "20px";
  newGameBtn.onclick = () => {
    // Reset client-side state
    resultsSection.classList.add("hidden");
    questionContainer.classList.add("hidden");
    waitingMessage.classList.add("hidden");
    quizStarted = false;
    startBtn.classList.remove("hidden");
  };
  
  // Clear previous buttons
  const prevBtn = document.querySelector("#results button");
  if (prevBtn) {
    prevBtn.remove();
  }
  
  resultsSection.appendChild(newGameBtn);
}

function startTimer() {
  timerDisplay.textContent = `⏱ Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱ Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = "⏱ Time's up!";
      if (!hasAnswered) {
        hasAnswered = true;
        socket.send(JSON.stringify({ type: "answer", answer: -1 }));
      }
    }
  }, 1000);
}

// Proceed to next question when "Next" is clicked
nextBtn.onclick = function () {
  nextBtn.classList.add("hidden");
  timerDisplay.textContent = "";
  socket.send(JSON.stringify({ type: "next" }));
};