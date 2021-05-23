const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer();
server.listen(webSocketsServerPort);
console.log('listening on port 8000');

const wsServer = new webSocketServer({
  httpServer: server
});

const clients = {}
const players = {}

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const broadcast = (type, message) => {
  for(key in clients) {
    clients[key].sendUTF(JSON.stringify({ message: message, type: type }));
  }
}

wsServer.on('request', (request) => {
  var userID = getUniqueID();

  // console.log((new Date()) + ' received a new connection from origin ' + request.origin + '.');

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;

  // Send the UserID to the client when it connects in the backend
  connection.sendUTF(JSON.stringify({ type: 'client-connected', userID: userID }));

  connection.on('message', (message) => {
    console.log(message);
    if (message.type === 'utf8') {
      console.log('Received message: ', message.utf8Data);

      const payload = JSON.parse(message.utf8Data);
      const { type, value } = payload;

      console.log('Message arrived: ', type);
      console.log('message body: ', value)

      if (type === 'game-connection-request') {
        /*
          Payload's value example:

          {
            userID: 123123123123,
            position: { x: 175, y: 433 },
            direction: 2,
            step: 1,
            character: {
              name: 'Gandalf',
              type: 'male-wizard'
            }
          }
        */

        // Save character in a list
        players[value.character.name] = value;

        // Broadcast list of characters to everyone
        broadcast('new-player', players);
      }

      if (type === 'player-moved') {
        /*
          Payload's value example:

          {
            userID: 123123213,
            position: { x: 10, y: 20 },
            direction: 2,
            step: 1,
            character: {
              name: 'Gandalf',
              type: '',
            }
          }
        */

        players[value.characterName] = {
          ...players[value.characterName],
          position: value.position,
          direction: value.direction,
          step: value.step
        }

        broadcast('player-moved', players[value.characterName]);
      }
    }
  });
});
