const colors = require('colors');

const express = require('express');

const PORT = process.env.PORT || 8000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const movementService = require('./player-moved');
const quizService = require('./quiz-ready');

const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
// const http = require('http');

// const server = http.createServer();
// server.listen(webSocketsServerPort);
// console.log('listening on port 8000');

const wsServer = new webSocketServer({
  httpServer: server
});

// Clients contains the connections used by the websocket server
// to communicate with all players. Each player has its own id,
// and this id is the key of the hash (the connection is the value).
const clients = {}

// Players example:
// {
//   Legolas: {
//     userID: 'c8bb4a1c-bd93',
//     userName: 'Kátia',
//     position: { x: 445, y: 415 },
//     direction: 0,
//     step: 1,
//     character: { name: 'Legolas', type: 'female-assassin' },
//     quiz: {
//       theme: 'Colors',
//       option1: 'Blue',
//       option2: 'Red',
//       option3: 'Green',
//       option4: 'Yellow',
//       answer: 'Red'
//     }
//   },
//   Lagertha: {
//     userID: 'a31623a5-c8d5',
//     userName: 'Artur',
//     position: { x: 175, y: 433 },
//     direction: 2,
//     step: 1,
//     character: { name: 'Lagertha', type: 'male-wizard' },
//     quiz: {
//       theme: 'Tv shows',
//       option1: 'Friends',
//       option2: 'Vikings',
//       option3: 'Anne with an E',
//       option4: 'Daredevil',
//       answer: 'Anne with an E'
//     }
//   }
// }
const players = {}

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const broadcast = (type, message) => {
  console.log(`Broadcasting ${type}...`);
  for(key in clients) {
    if (clients[key]) {
      clients[key].sendUTF(JSON.stringify({ message: message, type: type }));
    }
  }
}

wsServer.on('request', (request) => {
  var userID = getUniqueID();

  console.log((new Date()) + ' received a new connection from origin ' + request.origin + '.');

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;

  // Send the UserID to the client when it connects to the backend
  connection.sendUTF(JSON.stringify({ type: 'client-connected', userID: userID }));

  connection.on('message', (message) => {
    console.log('');
    console.log('===================================================================');
    console.log('');

    if (message.type === 'utf8') {
      console.log('                         MESSAGE RECEIVED'.yellow);
      console.log('');

      const payload = JSON.parse(message.utf8Data);
      const { type, value } = payload;

      console.log(`*  ${'Type'.bgCyan.black}: ${type}`);
      console.log('* Body: ')
      console.log(value);
      console.log('');

      if (type === 'players-list-request') {
        broadcast('players-list', players);
      }

      // player has answered all the quizes
      if (type === 'quiz-completed') {
        broadcast('quiz-answered', value);
      }

      // the button to start the quiz was pressed
      if (type === 'quiz-started') {
        broadcast('quiz-started', players);
      }

      // The player has chosen a theme, its options, and the answer
      if (type === 'quiz-ready') {
        const response = quizService.quizReady(value, players);
        broadcast('quiz-ready', value);
      }

      // The admin has completed the quiz and is sending the results to everyone
      if (type === 'quiz-results-ready') {
        broadcast('quiz-results', { value, playersList: players });
      }

      if (type === 'disconnect-player') {
        clients[value.userID].sendUTF(JSON.stringify({ type: 'you-were-disconnected' }));
        players[value.characterName] = null;
        clients[value.userID].close();
        broadcast('player-disconnected', players);
      }

      if (type === 'game-connection-request') {
        // Save character in a list
        players[value.character.name] = value;

        // Broadcast list of characters to everyone
        broadcast('new-player', players);
        broadcast('players-list', players);
      }

      // Player has moved and needs to be updated in all screens.
      if (type === 'player-moved') {
        const response = movementService.playerMoved(value, players);
        broadcast('player-moved', response);
      }

      console.log('===================================================================');
    }
  });
});
