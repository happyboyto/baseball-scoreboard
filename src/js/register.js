import { Batter, Pitcher, Team } from "./player.js";

const registeredTeamArr = {};
const registerTeamForm = document.querySelector("#register-team-form");
const proceedBtnsDiv = document.querySelector("#proceed-btns-div");

function resigeterNewTeam(event){
    event.preventDefault();
    const newTeam = createNewTeam();
    const newPitcher = createNewPitcher();
    const newBatters = createNewBatters();
    newTeam.registerPitcher(newPitcher);
    newTeam.registerBatters(newBatters);
    registeredTeamArr[newTeam.name] = newTeam;
    uploadToList(newTeam);
}
registerTeamForm.addEventListener("submit", resigeterNewTeam);

function createNewTeam() {
    const teamName = document.querySelector("#team-name").value;
    const newTeam = new Team(teamName);
    return newTeam;
}
function createNewPitcher() {
    const pitcherName = document.querySelector("#pitcher-name").value;
    const pitcherNum = 99;
    const newPitcher = new Pitcher(pitcherName, pitcherNum);
    return newPitcher;
}
function createNewBatters() {
    const newBatters = new Array(9);
    for (let order = 1; order < newBatters.length+1; order++) {
        const newBatter = createNewBatter(order);
        newBatters[order-1] = newBatter;
    }
    return newBatters;
}
function createNewBatter(order) {
    const batterName  = document.querySelector(`#batter${order}-name`).value;
    const batterAvg = document.querySelector(`#batter${order}-avg`).value;
    const newBatter = new Batter(batterName, order, order, batterAvg);
    return newBatter
}
function uploadToList(newTeam) {
    const teamList = document.querySelector("#registered-team-list");
    const newListElement = document.createElement("li");
    newListElement.innerHTML = newTeam.name;
    newListElement.id = `${newTeam.name}`;
    newListElement.onclick = function() {displayTeamInfo(this.id)};
    teamList.appendChild(newListElement); 
}

function displayTeamInfo(teamName) {
    const selectedTeam = registeredTeamArr[teamName];
    const teamInfoBox = document.getElementById("team-info-displaybox");
    const teamNameInfo = `팀 이름 : ${selectedTeam.name}<br/>`;
    const pitcherNameInfo = `투수 이름 : ${selectedTeam.pitcher.name}<br/>`;
    const battersInfo = writeBattersInfo(selectedTeam);
    teamInfoBox.innerHTML = teamNameInfo + pitcherNameInfo + battersInfo;
}

function writeBattersInfo(team) {
    const batterArr = team.batterArr;
    let infoText = '';
    for (let i = 0; i < batterArr.length; i++) {
        const currBatter = batterArr[i]
        infoText += `${currBatter.order}번 타자 ${currBatter.name} 타율 : ${currBatter.avg}<br/>`;
    }
    return infoText;
}

const htmlElements = {
    stateMessage : document.querySelector("#curr-ball-result-message"),
    inningStartBtn : document.querySelector('#inning-start-btn'),
    throwBallBtn : document.querySelector('#throw-ball-btn'),
    changeBatterBtn : document.querySelector('#change-batter-btn'),
    batterInfoDiv : document.querySelector("#batter-info"),
    pithcerInfoDiv : document.querySelector("#pitcher-info"),
    strikeDisplay : document.querySelector('#strike-display'),
    ballDisplay : document.querySelector('#ball-display'),
    outDisplay : document.querySelector('#out-display'),
    topTeamPitchCnt :document.querySelector('#top-team-total-throw'),
    bottomTeamPitchCnt :document.querySelector('#bottom-team-total-throw'),
    topTeamStrikeOutCnt :document.querySelector('#top-team-total-strikeout'),
    bottomTeamStrikeOutCnt :document.querySelector('#bottom-team-total-strikeout'),
    topTeamHitCnt :document.querySelector('#top-team-total-hit'),
    bottomTeamHitCnt :document.querySelector('#bottom-team-total-hit'),

    hideElement : function(element) {
        element.classList.add('hidden');
    },

}
//////////////////////////////////////////////////////////////////////////////////
class Game {
    constructor(topTeam, bottomTeam){
        this.topTeam = topTeam;
        this.bottomTeam = bottomTeam;
        this.currBatter;
        this.currPitcher;
        this.currInning = 0;
        this.currAttackTeam;
        this.currDefenceTeam;
        this.gameEnd = false;
        this.connectEventListner();
        this.showInningStartBtn();
        // this.createThrowBallBtn();
    }

    connectEventListner = () => {
        htmlElements.inningStartBtn.addEventListener('click', this.newInningStart);
        htmlElements.throwBallBtn.addEventListener('click', this.throwBall);
        htmlElements.changeBatterBtn.addEventListener('click', this.callBatter);
    }

    showInningStartBtn = () => {
        htmlElements.inningStartBtn.classList.remove("hidden");
        htmlElements.throwBallBtn.classList.add("hidden");
        htmlElements.changeBatterBtn.classList.add("hidden");
    }
    
    showThrowBallBtn = () => {
        htmlElements.throwBallBtn.classList.remove("hidden");
        htmlElements.inningStartBtn.classList.add("hidden");
        htmlElements.changeBatterBtn.classList.add("hidden");
    }

    showChangeBatterBtn = () => {
        htmlElements.changeBatterBtn.classList.remove('hidden');
        htmlElements.inningStartBtn.classList.add("hidden");
        htmlElements.throwBallBtn.classList.add("hidden");
    }

    newInningStart = () => {
        if (this.gameEnd) {
            this.finishGame();
        } else {
        this.currInning += 1;
        this.clearStrikeLight();
        this.clearBallLight();
        this.clearOutLight();
        this.createScoreBoardSpace();
        this.decideAttackDefence();
        this.callBatter();
        this.callPitcher();
        this.showThrowBallBtn();
        }
    }

    createScoreBoardSpace = () => {
        if (this.currInning % 2 === 1) {
            const headRow = document.querySelector('#scoreboard-head');
            const topTeamRow = document.querySelector("#top-team-info");
            const bottomTeamRow = document.querySelector("#bottom-team-info");
            const newHeadRowSpace = document.createElement("td");
            const newTopTeamRowSpace = document.createElement("td");
            const newBottomTeamRowSpace = document.createElement("td");
            newHeadRowSpace.innerHTML = `${parseInt(this.currInning / 2)+1}회`;
            newTopTeamRowSpace.id = `inning${this.currInning}-score`;
            newTopTeamRowSpace.innerHTML = 0;
            newBottomTeamRowSpace.id = `inning${this.currInning + 1}-score`;
            newBottomTeamRowSpace.innerHTML = 0; 
            headRow.insertBefore(newHeadRowSpace, headRow.lastChild);
            topTeamRow.insertBefore(newTopTeamRowSpace, topTeamRow.lastChild);
            bottomTeamRow.insertBefore(newBottomTeamRowSpace, bottomTeamRow.lastChild);
        }
    }

    decideAttackDefence = () => {
        if (this.currInning % 2 === 1) {
            this.currAttackTeam = this.topTeam;
            this.currDefenceTeam = this.bottomTeam;
        } else if (this.currInning % 2 === 0) {
            this.currAttackTeam = this.bottomTeam;
            this.currDefenceTeam = this.topTeam;
        }
    }

    callBatter = () => {
        this.clearStrikeLight();
        this.clearBallLight();
        const nextBatterOrder = this.currAttackTeam.lastBatter + 1;
        this.currBatter = this.currAttackTeam.batterArr[(nextBatterOrder % 9)];
        htmlElements.batterInfoDiv.innerHTML = `${this.currAttackTeam.name}팀 / ${nextBatterOrder+1}번 타자 / ${this.currBatter.name}`;
        htmlElements.stateMessage.innerHTML = `${this.currBatter.name}이 타석에 들어섭니다!`
        this.currAttackTeam.lastBatter += 1;
        this.showThrowBallBtn();
    }

    callPitcher = () => {
        this.currPitcher = this.currDefenceTeam.pitcher;
        htmlElements.pithcerInfoDiv.innerHTML = `${this.currDefenceTeam.name}팀 / 투수 ${this.currPitcher.name}`; 
    }

    throwBall = () => {
        const throwResult = this.decideThrowResult();
        console.log(throwResult);
        switch (throwResult) {
            case "HIT" : 
                this.handleHit();
                break;
            case "STRIKE": 
                this.handleStrike();
                break;
            case "BALL":
                this.handleBall();
                break;
            case "OUT":
                this.handleOut();
        }
        this.currDefenceTeam.pitchingCnt += 1;
        this.updateScoreBoard();
    }

    decideThrowResult = () => {
        const hitP = parseFloat(this.currBatter.avg);
        const strikeP = (1 - hitP) / 2 - 0.05;
        const ballP = strikeP;
        const outP = 0.1
        const random = Math.random();
        if (random <= hitP) {
            console.log("hit")
            return "HIT";
        } else if (random <= hitP + strikeP) {
            console.log("strike")
            return "STRIKE";
        } else if (random <= hitP + strikeP + ballP) {
            console.log("ball")
            return "BALL";
        } else  if (random <= hitP + strikeP + ballP + outP) {
            console.log("out")
            return "OUT";
        }
    }

    handleStrike = () => {
        this.currBatter.strike += 1;
        this.turnOnStrikeLight(this.currBatter.strike);
        if (this.currBatter.strike === 3) {
            this.handleStrikeOut();
        } else {
            htmlElements.stateMessage.innerHTML = "스트라이크!";
        }
    }

    handleStrikeOut = () => {
        this.currAttackTeam.strikeOutCnt += 1;
        this.handleOut();
    }

    handleOut = () => {
        this.currAttackTeam.outCnt += 1;
        this.currBatter.clearCnt();
        this.turnOnOutLight(this.currAttackTeam.outCnt);
        if (this.currAttackTeam.outCnt === 3) {
            htmlElements.stateMessage.innerHTML = "아웃!! 이닝 끝!!";
            this.showInningStartBtn();
        } else {
            htmlElements.stateMessage.innerHTML = "아웃!!"
            this.showChangeBatterBtn();
        }   
    }  

    handleBall = () => {
        this.currBatter.ball += 1;
        this.turnOnBallLight(this.currBatter.ball);
        if (this.currBatter.ball === 4) {
            this.handleHit();
        } else {
            htmlElements.stateMessage.innerHTML = "볼!";
        }
    }

    handleHit = () => {
        this.currAttackTeam.hitCnt += 1;
        this.calScore();
        this.currBatter.clearCnt();
        htmlElements.stateMessage.innerHTML = "타자가 출루합니다!";
        this.clearStrikeLight();
        this.clearBallLight();
        this.showChangeBatterBtn();
    }

    turnOnStrikeLight = (strikeCnt) => {
        const strikeLight = document.querySelector(`#strike${strikeCnt}`);
        strikeLight.classList.remove('hidden');
    }

    turnOnBallLight = (ballCnt) => {
        const ballLight = document.querySelector(`#ball${ballCnt}`);
        ballLight.classList.remove('hidden');
    }

    turnOnOutLight = (outCnt) => {
        const outLight = document.querySelector(`#out${outCnt}`);
        outLight.classList.remove('hidden');
    }

    clearStrikeLight = () => {
        const strikeLights = Array.from(htmlElements.strikeDisplay.children);
        strikeLights.forEach(htmlElements.hideElement);
    }

    clearBallLight = () => {
        const ballLights = Array.from(htmlElements.ballDisplay.children);
        ballLights.forEach(htmlElements.hideElement);
    }

    clearOutLight = () => {
        const outLights = Array.from(htmlElements.outDisplay.children);
        outLights.forEach(htmlElements.hideElement);
    }

    calScore = () => {
        const hitCnt = this.currAttackTeam.hitCnt; 
        if ( hitCnt >= 4) {
            this.currAttackTeam.score = hitCnt - 3;
        }
    }

    updateScoreBoard = () => {
        const scoreSpace = document.querySelector(`#inning${this.currInning}-score`);
        scoreSpace.innerHTML = this.currAttackTeam.score;
    }
}


