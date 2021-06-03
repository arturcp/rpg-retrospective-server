// This function is execture after a player has chosen a theme,
// its options, and the correct answer. It happens in the first
// modal and indicates that the player is ready to play the game.
//
// Payload:
// {
//   userName: 'Kátia',
//   characterName: 'Gandalf',
//   theme: 'TV Series',
//   option1: 'Friends',
//   option2: 'Vikings',
//   option3: 'Anne With an E',
//   option4: 'Daredevil',
//   quizAnswer: 'Anne With an E'
// }

const quizReady = (payload, players) => {
  players[payload.characterName].quiz = {
    theme: payload.theme,
    option1: payload.option1,
    option2: payload.option2,
    option3: payload.option3,
    option4: payload.option4,
    answer: payload.quizAnswer,
  };

  return payload;
}

exports.quizReady = quizReady;
