var audio = document.getElementById('sound');


/* constructor of game state */
function GameState(socket) {
  this.playerType = null;
  this.turn = false;
  this.turnElement = document.querySelector('[data-turn]');
  this.isPlaying = false;
  this.hexagonArray = [];
  this.winner = null;

  this.getPlayerType = function () {
    return this.playerType;
  };

  this.getIsPlaying = function () {
    return this.isPlaying;
  }

  this.setPlaying = function (s) {
    this.isPlaying = s;
  };

  this.setPlayerType = function (p) {
    this.playerType = p;
    this.turnElement.classList.add(p);
  };

  this.isTurn = function () {
    return this.turn;
  };

  this.setTurn = function (t) {
    this.turn = t;
    this.turnElement.classList.toggle("yes");
  };

  this.whoWon = function () {

    //call method only if player has start tile
    if (this.playerType == 'R') {
      for (var j = 0; j < this.hexagonArray.length; j++) {
        if (this.hexagonArray[j].substr(2) == '01') {
            var visited = [];
            this.hasNeighbour(visited,j);
        }
      }
    }

    if (this.playerType == 'B') {
      for (var j = 0; j < this.hexagonArray.length; j++) {
        if (this.hexagonArray[j].slice(0,2) == '01') {
            var visited = [];
            this.hasNeighbour(visited,j);
        }
      }
    }

  };

  this.hasNeighbour = function (visited, index) {
    var start = this.hexagonArray[index];

    //return if winner was already identified
    if (this.winner!=null) return;

    //return if current hexagon was visited
    for (var i =0; i<visited.length; i++) {
      if (visited[i] == index) return;
    }
    visited.push(index);

    //check if player reached end tile
    if (this.playerType == 'R' && start.substr(2)=='11') {
      this.winner = this.playerType;
      return;
    }
    if (this.playerType == 'B' && start.slice(0,2)=='11') {
      this.winner = this.playerType;
      return;
    }

    //check if tile has neighbour and call method recursively if it does
    var coordinate = parseInt(start);
    for (var i =0; i<this.hexagonArray.length; i++){
      if (parseInt(this.hexagonArray[i]) == coordinate + 100 || 
          parseInt(this.hexagonArray[i]) == coordinate + 1 || 
          parseInt(this.hexagonArray[i]) == coordinate + 101 ||
          parseInt(this.hexagonArray[i]) == coordinate - 100 ||
          parseInt(this.hexagonArray[i]) == coordinate - 101 ||
          parseInt(this.hexagonArray[i]) == coordinate - 1 ) {
            this.hasNeighbour(visited, i);
            if (this.winner!=null) return;
      }
    }

    return;
      
  }

  this.updateGame = function (clickedHexagon) {

    this.hexagonArray.push(clickedHexagon);

    if (this.playerType == "R") {
        var outgoingMsg = Messages.O_RED_MOVE;
        outgoingMsg.data = clickedHexagon;
        socket.send(JSON.stringify(outgoingMsg));
    } else {
        var outgoingMsg = Messages.O_BLUE_MOVE;
        outgoingMsg.data = clickedHexagon;
        socket.send(JSON.stringify(outgoingMsg));
    }

    //is the game complete?
    this.whoWon();

    if (this.winner != null) {

      this.isPlaying = false;
      alert("YOU WON!");

      //send win message  
      socket.send(JSON.stringify(Messages.O_GAME_WON_BY));
      socket.close();
    }


  };
}

function Board(gs) {
  
    if(gs.getPlayerType() == "R") gs.setTurn("true");
    const hexagonElements = document.querySelectorAll('[data-hexagon]');
    
    Array.from(hexagonElements).forEach(function (hexagon) {
      hexagon.addEventListener("click", function singleClick(e) {
        if (!gs.isTurn() || !gs.getIsPlaying()) return;
        if (e.target.classList.contains("R") || e.target.classList.contains("B")) {
          e.target.removeEventListener("click", singleClick, false);
          return;
        }

        var clickedHexagon = e.target.id;
        audio.play();

        e.target.classList.add(gs.getPlayerType());
        
        gs.updateGame(clickedHexagon);

        gs.setTurn(false);
        //do not allow clicking twice
        e.target.removeEventListener("click", singleClick, false);
      });
    });
  
}

//set everything up, including the WebSocket
(function setup() {
  var socket = new WebSocket(location.origin.replace('http', 'ws'));

  var gs = new GameState(socket);
  var board = new Board(gs);

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);

    //set player type
    if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
      gs.setPlayerType(incomingMsg.data); //should be "R" or "B"
        
      if (gs.getPlayerType()=="R") {
          gs.setTurn(true);
          alert("WAITING FOR OPPONENT...");
        }
    }

    //start game
    if (incomingMsg.type == Messages.T_GAME_STARTED) {
      gs.setPlaying(true);
      alert("THE GAME HAS STARTED!");
    }

    if (
        incomingMsg.type == Messages.T_BLUE_MOVE &&
        gs.getPlayerType() == "R"
      ) {
        gs.setTurn("true");
        document.getElementById(incomingMsg.data).classList.add('B');
      }

    if (
      incomingMsg.type == Messages.T_RED_MOVE &&
      gs.getPlayerType() == "B"
    ) {
      gs.setTurn("true");
      document.getElementById(incomingMsg.data).classList.add('R');
    }

    //alert player when opponent won
    if (incomingMsg.type == Messages.T_GAME_WON_BY) {
        alert("YOU LOST");
        gs.setPlaying(false);
        
    }

  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
    if (gs.whoWon() == null) {
      alert("GAME WAS ABORTED BY OPPONENT");
      gs.setPlaying(false);
    }
  };

  socket.onerror = function () { };
})(); //execute immediately