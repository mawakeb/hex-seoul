var express = require("express");
var http = require("http");
var https = require("https");
var websocket = require("ws");

var port = process.env.PORT || 3000
var app = express();

var gameStatus = require("./statsTracker");
var indexRouter = require("./routes/index");
var messages = require("./public/javascripts/messages");

var Game = require("./game");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", indexRouter);
app.get("/play", indexRouter);

//var server = http.createServer(app);
var server = https.createServer(app);
const wss = new websocket.Server({ server });

var websockets = {}

var currentGame = new Game(gameStatus.gamesInitialized++);
var connectionID = 0; //each websocket receives a unique ID


wss.on("connection", function connection(ws) {
  /*
   * two-player game: every two players are added to the same game
   */
  let con = ws;
  con.id = connectionID++;
  let playerType = currentGame.addPlayer(con);
  websockets[con.id] = currentGame;

 console.log(
    "Player %s placed in game %s as %s",
    con.id,
    currentGame.id,
    playerType
  );

  /*
   * inform the client about its assigned player type
   */
  con.send(playerType == "R" ? messages.S_PLAYER_R : messages.S_PLAYER_B);

  /*
   * once we have two players, there is no way back;
   * a new game object is created;
   * if a player now leaves, the game is aborted (player is not preplaced)
   */
  if (currentGame.hasTwoConnectedPlayers()) {
    currentGame = new Game(gameStatus.gamesInitialized++);
    gameStatus.gamesOngoing++;
    websockets[con.id].setStatus("PLAYING");
    websockets[con.id].playerR.send(messages.S_GAME_STARTED);
    websockets[con.id].playerB.send(messages.S_GAME_STARTED);
  }

 
  /*
   * message coming in from a player:
   *  1. determine the game object
   *  2. determine the opposing player OP
   *  3. send the message to OP
   */
  con.on("message", function incoming(message) {
    let oMsg = JSON.parse(message);

    let gameObj = websockets[con.id];
    let isPlayerR = gameObj.playerR == con ? true : false;

    if (isPlayerR) {

      //red makes move
      if (oMsg.type == messages.T_RED_MOVE) {
        gameObj.playerB.send(message);
      }

      if (oMsg.type == messages.T_GAME_WON_BY) {
        gameObj.playerB.send(message);
        gameObj.setStatus("R");
        gameStatus.gamesCompleted++;
        gameStatus.gamesOngoing--;
      }

    } else {

      //blue makes move
      if (oMsg.type == messages.T_BLUE_MOVE) {
        gameObj.playerR.send(message);
      }

      //win
      if (oMsg.type == messages.T_GAME_WON_BY) {
        gameObj.playerR.send(message);
        gameObj.setStatus("B");
        gameStatus.gamesCompleted++;
        gameStatus.gamesOngoing--;
      }
    }
  });

  con.on("close", function(code) {
    /*
     * code 1001 means almost always closing initiated by the client;
     */
    console.log(con.id + " disconnected ...");

    if (code == "1001") {
      /*
       * if possible, abort the game; if not, the game is already completed
       */
      let gameObj = websockets[con.id];

      if (gameObj.gameState=="WAITING") {
        gameObj.setStatus("EMPTY");
      }

      if (gameObj.gameState=="PLAYING" &&
       gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
        gameObj.setStatus("ABORTED");
        gameStatus.gamesOngoing--;

        /*
         * determine whose connection remains open;
         * close it
         */
        try {
          gameObj.playerR.close();
          gameObj.playerR = null;
        } catch (e) {
          console.log("Player R closing: " + e);
        }

        try {
          gameObj.playerB.close();
          gameObj.playerB = null;
        } catch (e) {
          console.log("Player B closing: " + e);
        }
      }
    }
  });
});

server.listen(port);






