const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correctAnswer: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: 1
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Iron", "Silver"],
    correctAnswer: 1
  }
];

let players = [];
let quizActive = false;

function sendToClient(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function getScoreboard() {
  return players.map(p => ({
    username: p.username,
    score: p.score,
    currentQuestion: p.currentQuestionIndex + 1,
    totalQuestions: questions.length,
    quizCompleted: p.quizCompleted
  })).sort((a, b) => b.score - a.score);
}

function broadcastScoreboard() {
  const scores = getScoreboard();
  broadcast({
    type: "scoreUpdate",
    scores: scores
  });
}

function sendQuestionToPlayer(player) {
  if (player.currentQuestionIndex < questions.length) {
    const q = questions[player.currentQuestionIndex];
    sendToClient(player, {
      type: "question",
      question: q.question,
      options: q.options,
      questionNumber: player.currentQuestionIndex + 1,
      totalQuestions: questions.length
    });
  } else {
    // Player has completed all questions
    player.quizCompleted = true;
    broadcastScoreboard();
    
    // Check if all players have completed the quiz
    const allCompleted = players.every(p => p.quizCompleted);
    
    if (allCompleted && players.length > 0) {
      endQuiz();
    } else {
      // Just tell this player they're waiting for others
      sendToClient(player, {
        type: "waitingForOthers"
      });
    }
  }
}

function endQuiz() {
  quizActive = false;
  const scores = getScoreboard();
  
  broadcast({ 
    type: "quizEnd", 
    message: "Quiz Over!", 
    scores 
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "join") {
      ws.username = msg.username;
      ws.score = 0;
      ws.currentQuestionIndex = 0;
      ws.quizCompleted = false;
      players.push(ws);
      
      broadcastScoreboard();
      
      if (quizActive) {
        // If quiz is already active, send the first question to the new player
        sendQuestionToPlayer(ws);
      }
    }

    if (msg.type === "startQuiz") {
      quizActive = true;
      
      // Reset all players' progress when starting a new quiz
      players.forEach(p => {
        p.score = 0;
        p.currentQuestionIndex = 0;
        p.quizCompleted = false;
        sendQuestionToPlayer(p);
      });
      
      broadcastScoreboard();
    }

    if (msg.type === "answer") {
      const currentQuestion = questions[ws.currentQuestionIndex];
      const isCorrect = msg.answer === currentQuestion.correctAnswer;
      
      if (isCorrect) {
        ws.score += 1;
      }
      
      sendToClient(ws, {
        type: "answerResult",
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect
      });
      
      broadcastScoreboard();
    }

    if (msg.type === "next") {
      ws.currentQuestionIndex++;
      sendQuestionToPlayer(ws);
    }
  });

  ws.on("close", () => {
    players = players.filter(p => p !== ws);
    console.log("Client disconnected");
    
    broadcastScoreboard();
    
    // If everyone has left, reset quiz state
    if (players.length === 0) {
      quizActive = false;
    } 
    // If quiz is active and all remaining players have finished, end the quiz
    else if (quizActive && players.every(p => p.quizCompleted)) {
      endQuiz();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});