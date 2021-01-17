//stopwatch to be shown

var elapsedTimeText = document.getElementById('timeelapsed');

measureTime();

function measureTime() {
    var startTime = performance.now();
    var timerInterval = setInterval(function printTime() {
    elapsedTime = performance.now() - startTime;
    elapsedTimeText.innerText = timeToString(elapsedTime);
    }, 1000);
}

function timeToString(time) {

    time /= 1000;
    let ss = Math.floor(time%60);
    time -= ss;
    let mm = Math.floor(time/60);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
  
    return formattedMM.toString() + ':' + formattedSS.toString();
}