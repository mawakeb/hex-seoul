/* 
 In-memory game statistics "tracker".
*/

var gameStatus = {
  gamesInitialized: 0 /* number of games initialized */,
  gamesOngoing: 0 /* number of games ongoing */,
  gamesCompleted: 0 /* number of games successfully completed */
};

module.exports = gameStatus;