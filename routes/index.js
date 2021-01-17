var express = require('express');
var router = express.Router();
var gameStatus = require("../statsTracker");

/* GET home page */
router.get("/", function(req, res) {
  res.render("splash.ejs", {
    root: "./views",
    gamesInitialized: gameStatus.gamesInitialized,
    gamesOngoing: gameStatus.gamesOngoing,
    gamesCompleted: gameStatus.gamesCompleted
  });
  });

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});

module.exports = router;
