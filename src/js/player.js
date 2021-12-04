export class Batter {
    constructor(name, num, order, avg) {
        this.name = name;
        this.num = num;
        this.order = order;
        this.avg = avg;
        this.strike = 0;
        this.ball = 0;
    }
    clearCnt = () => {
        this.strike = 0;
        this.ball = 0;
    }
}

export class Pitcher {
    constructor(name, num) {
        this.name = name;
        this.num = num;
        this.pitchingCnt = 0;
        this.throwCnt = 0;
    }
}

export class Team {
    constructor(name) {
        this.name = name;
        this.pitcher;
        this.batterArr = new Array(9);
        this.score = 0;
        this.outCnt = 0;
        this.lastBatter = -1;
        this.throwCnt = 0;
        this.strikeOutCnt = 0;
        this.hitCnt = 0;
    }
    registerPitcher = (pitcher) => {
        this.pitcher = pitcher;
    }
    registerBatters = (batterArr) => {
        this.batterArr = batterArr;
    }
}
