// This function is executed when a player has moved and
// needs to be updated in all screens.
//
// Payload:
//
// {
//   userID: '8131ecc5-a838',
//   position: { x: 175, y: 433 },
//   direction: 2,
//   step: 1,
//   character: { name: 'Gandalf', type: 'female-archer' }
// }
//
// Return a player.
//
// Example:
// {
//   userID: '25dfccaf-e2f4',
//   userName: 'Artur',
//   position: { x: 175, y: 433 },
//   direction: 2,
//   step: 1,
//   character: { name: 'Gandalf', type: 'female-assassin' },
//   quiz: {
//     theme: 'Series',
//     option1: 'Friends',
//     option2: 'Vikings',
//     option3: 'Anne with an E',
//     option4: 'Daredevil',
//     answer: 'Anne with an E'
//   }
// }
const playerMoved = (payload, players) => {
  const characterName = payload.character.name;

  players[characterName] = {
    ...players[characterName],
    position: payload.position,
    direction: payload.direction,
    step: payload.step,
    quiz: { ... players[characterName].quiz }
  }

  return players[characterName];
}

exports.playerMoved = playerMoved;
