(function(exports) {
    /*
     * Client to server: game is complete, the winner is ...
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";
    exports.O_GAME_WON_BY = {
      type: exports.T_GAME_WON_BY,
      data: null
    };

    /*
     * server to client: the game has started
     */
    exports.T_GAME_STARTED = "GAME-STARTED";
    exports.O_GAME_STARTED = {
      type: exports.T_GAME_STARTED,
      data: null
    };
    exports.S_GAME_STARTED = JSON.stringify(exports.O_GAME_STARTED);
  
    /*
     * Server to client: abort game (e.g. if second player exited the game)
     */
    exports.O_GAME_ABORTED = {
      type: "GAME-ABORTED"
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

  
    /*
     * Server to client: set as player RED
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_R = {
      type: exports.T_PLAYER_TYPE,
      data: "R"
    };
    exports.S_PLAYER_R = JSON.stringify(exports.O_PLAYER_R);
  
    /*
     * Server to client: set as player BLUE
     */
    exports.O_PLAYER_B = {
      type: exports.T_PLAYER_TYPE,
      data: "B"
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);
  
    /*
     * Player RED to server OR server to Player BLUE: RED MOVE
     */
    exports.T_RED_MOVE = "RED_MOVE";
    exports.O_RED_MOVE = {
      type: exports.T_RED_MOVE,
      data: null
    };

    /*
     * Player BLUE to server OR server to Player RED: BLUE MOVE
     */
    exports.T_BLUE_MOVE = "BLUE_MOVE";
    exports.O_BLUE_MOVE = {
      type: exports.T_BLUE_MOVE,
      data: null
    };
  
  })(typeof exports === "undefined" ? (this.Messages = {}) : exports);
  //if exports is undefined, we are on the client; else the server