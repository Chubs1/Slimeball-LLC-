console.log('Starting DailyFinder');

const fs = require('fs');



// find casino stuff TK
const CASINO = 'Horseshoe';
const LINK = 'https://horseshoeonlinecasino.com/us/mi/mypromos';

const SIMULATIONS = 100_000;
const DEPOSIT = 100;
const BONUS = 100;
const BET_SIZE = 5;
const MIN_BET_SIZE = 1; // if balance is less than this, bet everything
const WAGER_REQUIREMENT = 3000;


let existing = [];
try {
  const raw = fs.readFileSync('./results.json', 'utf8');
  existing = JSON.parse(raw);
} catch (err) {
  // If file doesn't exist or is empty, start fresh
  existing = [];
}


class OnlineStats {
  constructor() {
    this.n = 0;
    this.mean = 0;
    this.M2 = 0;
  }

  add(x) {
    this.n++;
    const delta = x - this.mean;
    this.mean += delta / this.n;
    this.M2 += delta * (x - this.mean); // Use updated mean
  }

  getMean() {
    return this.n > 0 ? this.mean : NaN;
  }

  getVariance() {
    return this.n > 1 ? this.M2 / (this.n - 1) : NaN; // sample variance
  }

  getStdDev() {
    const variance = this.getVariance();
    return isNaN(variance) ? NaN : Math.sqrt(variance);
  }
}


const blackjackOutcomes = [
  { wager: 6, value: -6, prob: 2005},
  { wager: 6, value: -4, prob: 3096},
  { wager: 6, value: -2, prob: 10468},
  { wager: 6, value: 0, prob: 13204},
  { wager: 6, value: 2, prob: 24513},
  { wager: 6, value: 4, prob: 26548},
  { wager: 6, value: 6, prob: 33436},

  { wager: 5, value: -5, prob: 57589},
  { wager: 5, value: -4, prob: 59474},
  { wager: 5, value: -3, prob: 81797},
  { wager: 5, value: -2, prob: 82525},
  { wager: 5, value: -1, prob: 146990},
  { wager: 5, value: 0, prob: 152130},
  { wager: 5, value: 1, prob: 208476},
  { wager: 5, value: 2, prob: 209450},
  { wager: 5, value: 3, prob: 263106},
  { wager: 5, value: 4, prob: 266828},
  { wager: 5, value: 5, prob: 310926},

  { wager: 4, value: -4, prob: 551495},
  { wager: 4, value: -3, prob: 573819},
  { wager: 4, value: -2, prob: 774409},
  { wager: 4, value: -1, prob: 792879},
  { wager: 4, value: 0, prob: 1364149},
  { wager: 4, value: 1, prob: 1394950},
  { wager: 4, value: 2, prob: 1691155},
  { wager: 4, value: 3, prob: 1713983},
  { wager: 4, value: 4, prob: 2126729},

  { wager: 3, value: -3, prob: 3430234},
  { wager: 3, value: -2, prob: 3636144},
  { wager: 3, value: -1, prob: 4983672},
  { wager: 3, value: 0, prob: 5117453},
  { wager: 3, value: 1, prob: 7101615},
  { wager: 3, value: 2, prob: 7321807},
  { wager: 3, value: 3, prob: 8814246},

  { wager: 2, value: -2, prob: 50390464},
  { wager: 2, value: -1, prob: 51471100},
  { wager: 2, value: 0, prob: 64640718},
  { wager: 2, value: 1, prob: 65669220},
  { wager: 2, value: 2, prob: 123791521},

  { wager: 1, value: -1, prob: 521945321},
  { wager: 1, value: -0.5, prob: 566679691},
  { wager: 1, value: 0, prob: 641289259},
  { wager: 1, value: 1, prob: 954734941},
  { wager: 1, value: 1.5, prob: 1000000000},
]

const halfBankrollBlackjackOutcomes = [
  { wager: 2, value: -2, prob: 43470036},
  { wager: 2, value: -1, prob: 45116621},
  { wager: 2, value: 0, prob: 61915296},
  { wager: 2, value: 1, prob: 63480734},
  { wager: 2, value: 2, prob: 123801413},

  { wager: 1, value: -1, prob: 521968668},
  { wager: 1, value: -0.5, prob: 566717401},
  { wager: 1, value: 0, prob: 641329602},
  { wager: 1, value: 1, prob: 954733306},
  { wager: 1, value: 1.5, prob: 1000000000},
];


const getRandomOutcome = (outcome,max) => {
  const r = Math.random() * max;
  for (let i = 0; i < outcome.length; i++) {
    if (r <= outcome[i].prob) {
      return {wager: outcome[i].wager, outcome: outcome[i].value};
    }
  }
}

const simulateHandOfBlackjack = (wagerRequirement, balance, bet) => {
                stuff = getRandomOutcome(blackjackOutcomes,1000000000);
                return {wagerRequirement: wagerRequirement - (stuff.wager * bet), balance: balance + (stuff.outcome * bet)}
}

const Blackjack = (TARGET) => {
const stats = new OnlineStats();
const statsNoFirstLoss = new OnlineStats();
let timesNotBusted = SIMULATIONS;


for (let i = 0; i < SIMULATIONS; i++) {
          if ( i % (SIMULATIONS/4) === 0) console.log(`${Math.floor(i / SIMULATIONS * 100)}% Done with Blackjack` );
    let balance = DEPOSIT + BONUS;
    let wagerRequirement = WAGER_REQUIREMENT;
    let on2nd = false;
    
    while (wagerRequirement > 0) {
        
      if(balance <= 0) {
        timesNotBusted--;
        break;
      }
              if(!on2nd && balance >= TARGET) {
            on2nd = true;
        }

        let bet;
        if(!on2nd) {
            bet = Math.floor(balance / 2);
            if(bet < MIN_BET_SIZE) {            
                bet = balance
                wagerRequirement -= bet;
                if(Math.random() < 0.42) balance *= 2;
                else balance = 0;

            } else{
            const stuff = getRandomOutcome(halfBankrollBlackjackOutcomes, 1000000000);
            wagerRequirement -= stuff.wager * bet
            balance += stuff.outcome * bet;
            }
            

        } else{ 
                if(balance < MIN_BET_SIZE) {            
                bet = balance
                wagerRequirement -= bet;
                if(Math.random() < 0.42) balance *= 2;
                else balance = 0;

            } else{

            const results = simulateHandOfBlackjack(wagerRequirement, balance, BET_SIZE);
            wagerRequirement = results.wagerRequirement;
            balance = results.balance;
            }
            }


    }

    if(on2nd) statsNoFirstLoss.add(balance - DEPOSIT);
    stats.add(balance - DEPOSIT);
}
console.log('100% Done with Blackjack');
return {timesNotBusted, stats, statsNoFirstLoss};
}

let blackjackResults1Target, blackjackResults2Target, blackjackResults3Target;

blackjackResults1Target = Blackjack((DEPOSIT + BONUS)); 
blackjackResults2Target = Blackjack(2*(DEPOSIT + BONUS));
blackjackResults3Target = Blackjack(3*(DEPOSIT + BONUS)); 


console.log('--------------------------------------------------');
console.log('--------------------------------------------------');
console.log('--------------------------------------------------');
console.log('--------------------------------------------------');
console.log('--------------------------------------------------');

console.log(`Blackjack 1x Target Profit:`);

console.log("Mean:", blackjackResults1Target?.stats.getMean().toFixed(2));
console.log("Risk of Ruin:", 100-(blackjackResults1Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
console.log("Standard Deviation:", blackjackResults1Target?.stats.getStdDev().toFixed(2));
console.log("Mean Excluding First Loss:", blackjackResults1Target?.statsNoFirstLoss.getMean().toFixed(2));
console.log("Standard Deviation Excluding First Loss:", blackjackResults1Target?.statsNoFirstLoss.getStdDev().toFixed(2));
console.log('--------------------------------------------------');

console.log(`Blackjack 2x Target Profit:`);

console.log("Mean:", blackjackResults2Target?.stats.getMean().toFixed(2));
console.log("Risk of Ruin:", 100-(blackjackResults2Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
console.log("Standard Deviation:", blackjackResults2Target?.stats.getStdDev().toFixed(2));
console.log("Mean Excluding First Loss:", blackjackResults2Target?.statsNoFirstLoss.getMean().toFixed(2));
console.log("Standard Deviation Excluding First Loss:", blackjackResults2Target?.statsNoFirstLoss.getStdDev().toFixed(2));
console.log('--------------------------------------------------');

console.log(`Blackjack 3x Target Profit:`);
console.log("Mean:", blackjackResults3Target?.stats.getMean().toFixed(2));
console.log("Risk of Ruin:", 100-(blackjackResults3Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
console.log("Standard Deviation:", blackjackResults3Target?.stats.getStdDev().toFixed(2));
console.log("Mean Excluding First Loss:", blackjackResults3Target?.statsNoFirstLoss.getMean().toFixed(2));
console.log("Standard Deviation Excluding First Loss:", blackjackResults3Target?.statsNoFirstLoss.getStdDev().toFixed(2));
console.log('--------------------------------------------------');


const results = {
  casino: CASINO,
  LINK: LINK,
  Date: new Date().toISOString().split('T')[0],
  Strategy: {
  Normal: {
    mean: blackjackResults1Target?.stats.getMean().toFixed(2),
    riskOfRuin: (100 - (blackjackResults1Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2)) + "%",
    stdDev: blackjackResults1Target?.stats.getStdDev().toFixed(2),
    meanExcludingFirstLoss: blackjackResults1Target?.statsNoFirstLoss.getMean().toFixed(2),
    stdDevExcludingFirstLoss: blackjackResults1Target?.statsNoFirstLoss.getStdDev().toFixed(2)
  },
  Half2x: {
    mean: blackjackResults2Target?.stats.getMean().toFixed(2),
    riskOfRuin: (100 - (blackjackResults2Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2)) + "%",
    stdDev: blackjackResults2Target?.stats.getStdDev().toFixed(2),
    meanExcludingFirstLoss: blackjackResults2Target?.statsNoFirstLoss.getMean().toFixed(2),
    stdDevExcludingFirstLoss: blackjackResults2Target?.statsNoFirstLoss.getStdDev().toFixed(2)
  },
  Half3x: {
    mean: blackjackResults3Target?.stats.getMean().toFixed(2),
    riskOfRuin: (100 - (blackjackResults3Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2)) + "%",
    stdDev: blackjackResults3Target?.stats.getStdDev().toFixed(2),
    meanExcludingFirstLoss: blackjackResults3Target?.statsNoFirstLoss.getMean().toFixed(2),
    stdDevExcludingFirstLoss: blackjackResults3Target?.statsNoFirstLoss.getStdDev().toFixed(2)
  }
}
  
};

existing.push(results);
try {
  fs.writeFileSync('./results.json', JSON.stringify(existing, null, 2), 'utf8');
  console.log('✅ Results written to results.json');
} catch (err) {
  console.error('❌ Failed to write results.json:', err);
}


























