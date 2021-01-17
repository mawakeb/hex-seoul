
/* every game has two players, identified by their WebSocket */

var game = function(gameID) {
    this.playerR = null;
    this.playerB = null;
    this.id = gameID;
    this.gameState = "EMPTY"; 
  };
  
  /*
   * The game can be in a number of different states.
   */
  game.prototype.transitionStates = {};
  game.prototype.transitionStates["EMPTY"] = 0;
  game.prototype.transitionStates["WAITING"] = 1;
  game.prototype.transitionStates["PLAYING"] = 2;
  game.prototype.transitionStates["R"] = 3; //RED won
  game.prototype.transitionStates["B"] = 4; //BLUE won
  game.prototype.transitionStates["ABORTED"] = 5;

    /*
    * Not all game states can be transformed into each other;
    * the matrix contains the valid transitions.
    * They are checked each time a state change is attempted.
    */
    game.prototype.transitionMatrix = [
        [0, 1, 0, 0, 0, 0], //empty
        [1, 1, 1, 0, 0, 0], //waiting
        [0, 0, 1, 1, 1, 1], //Playing 
        [0, 0, 0, 0, 0, 0], //R WON
        [0, 0, 0, 0, 0, 0], //B WON
        [0, 0, 0, 0, 0, 0] //ABORTED
    ];
  
    //check if state transition is valid
    game.prototype.isValidTransition = function(from, to) {

        console.assert(
        typeof from == "string",
        "%s: Expecting a string, got a %s",
        arguments.callee.name,
        typeof from
        );
        console.assert(
        typeof to == "string",
        "%s: Expecting a string, got a %s",
        arguments.callee.name,
        typeof to
        );
        console.assert(
        from in game.prototype.transitionStates == true,
        "%s: Expecting %s to be a valid transition state",
        arguments.callee.name,
        from
        );
        console.assert(
        to in game.prototype.transitionStates == true,
        "%s: Expecting %s to be a valid transition state",
        arguments.callee.name,
        to
        );
    
        let i, j;
        if (!(from in game.prototype.transitionStates)) {
        return false;
        } else {
        i = game.prototype.transitionStates[from];
        }
    
        if (!(to in game.prototype.transitionStates)) {
        return false;
        } else {
        j = game.prototype.transitionStates[to];
        }
    
        return game.prototype.transitionMatrix[i][j] > 0;
    };
    
    //check if state is valid
    game.prototype.isValidState = function(s) {
        return s in game.prototype.transitionStates;
    };


    //set status
    game.prototype.setStatus = function(w) {
        console.assert(
        typeof w == "string",
        "%s: Expecting a string, got a %s",
        arguments.callee.name,
        typeof w
        );
    
        if (
        game.prototype.isValidState(w) &&
        game.prototype.isValidTransition(this.gameState, w)
        ) {
        this.gameState = w;
        console.log("[STATUS] %s", this.gameState);
        } else {
        return new Error(
            "Impossible status change from %s to %s",
            this.gameState,
            w
        );
        }
    };
    
    game.prototype.hasTwoConnectedPlayers = function() {
        return this.gameState == "PLAYING";
    };
    
    game.prototype.addPlayer = function(p) {
        console.assert(
        p instanceof Object,
        "%s: Expecting an object (WebSocket), got a %s",
        arguments.callee.name,
        typeof p
        );
    
        if (this.gameState != "EMPTY" && this.gameState != "WAITING") {
        return new Error(
            "Invalid call to addPlayer, current state is %s",
            this.gameState
        );
        }
    
        /*
        * revise the game state
        */
    
        //var error = this.setStatus("WAITING");
        if (this.gameState=='EMPTY') {
            this.setStatus("WAITING");
            this.playerR = p;
            return "R";
        } else if (this.gameState=='WAITING') {
            this.setStatus("PLAYING");
            this.playerB = p;
            return "B";
        }
    
    };
    
    module.exports = game;