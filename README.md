# Multiplayer Online Quiz

A real-time multiplayer quiz game built with WebSockets that allows multiple players to participate in quizzes simultaneously, with live scoring and progress tracking.

![Multiplayer Online Quiz](https://via.placeholder.com/800x400?text=Multiplayer+Online+Quiz)

## Features

- **Real-time Multiplayer**: Multiple players can join and participate in the quiz simultaneously
- **Live Scoreboard**: See how all players are progressing in real-time
- **Independent Progress**: Each client can take the quiz at their own pace
- **Timed Questions**: Each question has a 15-second timer
- **Instant Feedback**: Get immediate feedback on correct/incorrect answers
- **Final Results**: View detailed results with rankings at the end of the quiz

## Technologies Used

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js, Express
- WebSockets: WS library for real-time communication

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multiplayer_online_quiz.git
   cd multiplayer_online_quiz
   ```

2. Install dependencies:
   ```bash
   npm install express ws
   ```

## Running the Application

### Local Development

1. Start the server:
   ```bash
   node server.js
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Enter a username and join the quiz
   
4. When all players are ready, click the "Start Quiz" button

## Using on Different Devices on the Same Network

To connect clients from different devices on the same network:

1. Find the IP address of your server machine:
   - On Windows: Open Command Prompt and type `ipconfig`
   - On macOS/Linux: Open Terminal and type `ifconfig` or `ip addr`

2. Identify the IPv4 address of your computer on the local network (usually starts with 192.168.x.x or 10.0.x.x)

3. Modify the WebSocket connection in the client's script.js file:
   ```javascript
   // Change this line:
   const socket = new WebSocket("ws://localhost:3000");
   
   // To use the server's IP address:
   const socket = new WebSocket("ws://192.168.1.X:3000");
   // Replace 192.168.1.X with your actual IP address
   ```

4. Run the server as usual
   ```bash
   node server.js
   ```

5. On other devices, open a browser and navigate to:
   ```
   http://192.168.1.X:3000
   ```
   (Replace 192.168.1.X with your server's actual IP address)

## How It Works

1. **Server-Side**:
   - The server manages all players, questions, and game state
   - Handles player connections via WebSockets
   - Tracks scores and question progression for each player
   - Broadcasts updates to all connected clients

2. **Client-Side**:
   - Connects to the server via WebSockets
   - Renders questions and collects user answers
   - Updates UI based on server responses
   - Shows live scoreboard and final results

## Game Flow

1. Players enter usernames and join the quiz
2. Any player can start the quiz when everyone is ready
3. Each player receives questions in sequence
4. Players have 15 seconds to answer each question
5. After answering, players see the correct answer
6. The scoreboard updates in real-time as players progress
7. When all players complete the quiz, final results are displayed

## Project Structure

```
multiplayer_online_quiz/
├── client/
│   ├── index.html      # Main HTML page
│   └── script.js       # Client-side JavaScript
├── server.js           # WebSocket server and game logic
└── README.md           # Project documentation
```

## Customizing the Quiz

To add or modify questions, edit the `questions` array in `server.js`:

```javascript
const questions = [
  {
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0  // Index of the correct answer (0-based)
  },
  // Add more questions...
];
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
