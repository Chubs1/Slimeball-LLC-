console.log('Starting DailyFinder');

const fs = require('fs');
const { exec } = require("child_process");
const path = require('path');


let existing = [];
try {
    const raw = fs.readFileSync('../results.json', 'utf8');
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


const getRandomOutcome = (outcome, max) => {
    const r = Math.random() * max;
    for (let i = 0; i < outcome.length; i++) {
        if (r <= outcome[i].prob) {
            return {
                wager: outcome[i].wager,
                outcome: outcome[i].value
            };
        }
    }
}

const simulateHandOfBlackjack = (wagerRequirement, balance, bet) => {
    stuff = getRandomOutcome(blackjackOutcomes, 1000000000);
    return {
        wagerRequirement: wagerRequirement - (stuff.wager * bet),
        balance: balance + (stuff.outcome * bet)
    }
}

const Blackjack = (TARGET, WAGER_REQUIREMENT, BET_SIZE, MIN_BET_SIZE, SIMULATIONS, BALANCE, DEPOSIT) => {
    const stats = new OnlineStats();
    const statsNoFirstLoss = new OnlineStats();
    let timesNotBusted = SIMULATIONS;


    for (let i = 0; i < SIMULATIONS; i++) {
        if (i % (SIMULATIONS / 4) === 0) console.log(`${Math.floor(i / SIMULATIONS * 100)}% Done with Blackjack`);
        let balance = BALANCE;
        let wagerRequirement = WAGER_REQUIREMENT;
        let on2nd = false;

        while (wagerRequirement > 0) {

            if (balance <= 0) {
                timesNotBusted--;
                break;
            }
            if (!on2nd && balance >= TARGET) {
                on2nd = true;
            }

            let bet;
            if (!on2nd) {
                bet = Math.floor(balance / 2);
                if (bet < MIN_BET_SIZE) {
                    bet = balance
                    wagerRequirement -= bet;
                    if (Math.random() < 0.42) balance *= 2;
                    else balance = 0;

                } else {
                    const stuff = getRandomOutcome(halfBankrollBlackjackOutcomes, 1000000000);
                    wagerRequirement -= stuff.wager * bet
                    balance += stuff.outcome * bet;
                }


            } else {
                if (balance < MIN_BET_SIZE) {
                    bet = balance
                    wagerRequirement -= bet;
                    if (Math.random() < 0.42) balance *= 2;
                    else balance = 0;

                } else {

                    const results = simulateHandOfBlackjack(wagerRequirement, balance, BET_SIZE);
                    wagerRequirement = results.wagerRequirement;
                    balance = results.balance;
                }
            }


        }

        if (on2nd) statsNoFirstLoss.add(balance - DEPOSIT);
        stats.add(balance - DEPOSIT);
    }
    console.log('100% Done with Blackjack');
    return {
        timesNotBusted,
        stats,
        statsNoFirstLoss
    };
}
//tk fix link casino and fetch to not be hard coded
const LINK = 'https://horseshoeonlinecasino.com/us/mi/mypromos';
const CASINO = 'Horseshoe';

fetch("https://api.americanwagering.com/regions/us/locations/mi/brands/hrs/igaming/bonus-engine/api/v2/promotions/bonusConfiguration/dep-get-0731", {
        method: "GET",
        headers: {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "origin": "https://horseshoeonlinecasino.com",
            "priority": "u=1, i",
            "referer": "https://horseshoeonlinecasino.com/",
            "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "x-app-version": "5.19.0",
            "x-appbranding": "Horseshoe",
            "x-aws-waf-token": "5e8ec9dc-1b2b-477a-9366-b03daca25eaa:EgoAgY2a/IITAwAA:tVIO9EzaqHchThRUHzjaU1WxzM1Z/CoHcHYr4xKKbStTLPlSspsIqe0JE1PjNIhHrph4ZUmaveZpbKns5HemxQee7/Usb11E+WGjzM/ejcbdyyDlV4ZAzgZgMX63htyegu2zUq+DTjr3loaSUM3C8ItTHdq4cbRZ8R2w4d6YPIoHqHliWh6ZAFgQm8N8lvihxAW00hUd8kaGyNCy714RtLh25EPfrdLUg0X/7+5JHiN9tIO6OtJTzBCwHPm3sCLZeJc=",
            "x-platform": "casino-horseshoe-desktop",
            "x-unique-device-id": "a77f55a8-84a3-4e15-9ec6-0e21b9613fcd"
        }
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Data fetched successfully');
        const DEPOSIT = parseInt(data.title.match(/\$\d+/g)[0].replace("$", ""), 10);
        const BONUS = parseInt(data.title.match(/\$\d+/g)[1].replace("$", ""), 10);
        const BALANCE = DEPOSIT + BONUS;
        const WAGER_REQUIREMENT = parseInt(data.termsAndConditions.match(/\d+/g)[0], 10) * BALANCE;
        const BET_SIZE = 5;
        const MIN_BET_SIZE = 1; // if balance is less than this, bet everything
        const SIMULATIONS = 10_000_000;
  

        let blackjackResults1Target, blackjackResults2Target, blackjackResults3Target;

        blackjackResults1Target = Blackjack(BALANCE, WAGER_REQUIREMENT, BET_SIZE, MIN_BET_SIZE, SIMULATIONS, BALANCE, DEPOSIT);
        blackjackResults2Target = Blackjack(2 * BALANCE, WAGER_REQUIREMENT, BET_SIZE, MIN_BET_SIZE, SIMULATIONS, BALANCE, DEPOSIT);
        blackjackResults3Target = Blackjack(3 * BALANCE, WAGER_REQUIREMENT, BET_SIZE, MIN_BET_SIZE, SIMULATIONS, BALANCE, DEPOSIT);


        console.log('--------------------------------------------------');
        console.log('--------------------------------------------------');
        console.log('--------------------------------------------------');
        console.log('--------------------------------------------------');
        console.log('--------------------------------------------------');

        console.log(`Blackjack 1x Target Profit:`);

        console.log("Mean:", blackjackResults1Target?.stats.getMean().toFixed(2));
        console.log("Risk of Ruin:", 100 - (blackjackResults1Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
        console.log("Standard Deviation:", blackjackResults1Target?.stats.getStdDev().toFixed(2));
        console.log("Mean Excluding First Loss:", blackjackResults1Target?.statsNoFirstLoss.getMean().toFixed(2));
        console.log("Standard Deviation Excluding First Loss:", blackjackResults1Target?.statsNoFirstLoss.getStdDev().toFixed(2));
        console.log('--------------------------------------------------');

        console.log(`Blackjack 2x Target Profit:`);

        console.log("Mean:", blackjackResults2Target?.stats.getMean().toFixed(2));
        console.log("Risk of Ruin:", 100 - (blackjackResults2Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
        console.log("Standard Deviation:", blackjackResults2Target?.stats.getStdDev().toFixed(2));
        console.log("Mean Excluding First Loss:", blackjackResults2Target?.statsNoFirstLoss.getMean().toFixed(2));
        console.log("Standard Deviation Excluding First Loss:", blackjackResults2Target?.statsNoFirstLoss.getStdDev().toFixed(2));
        console.log('--------------------------------------------------');

        console.log(`Blackjack 3x Target Profit:`);
        console.log("Mean:", blackjackResults3Target?.stats.getMean().toFixed(2));
        console.log("Risk of Ruin:", 100 - (blackjackResults3Target?.timesNotBusted / SIMULATIONS * 100).toFixed(2), "%");
        console.log("Standard Deviation:", blackjackResults3Target?.stats.getStdDev().toFixed(2));
        console.log("Mean Excluding First Loss:", blackjackResults3Target?.statsNoFirstLoss.getMean().toFixed(2));
        console.log("Standard Deviation Excluding First Loss:", blackjackResults3Target?.statsNoFirstLoss.getStdDev().toFixed(2));
        console.log('--------------------------------------------------');


        const results = {
            casino: CASINO,
            link: LINK,
            date: new Date().toISOString().split('T')[0],
            deposit: DEPOSIT,
            bonus: BONUS,
            strategy: {
                normal: {
                    mean: blackjackResults1Target?.stats.getMean().toFixed(2),
                    riskOfRuin: (100 - (blackjackResults1Target?.timesNotBusted / SIMULATIONS * 100)).toFixed(2) + "%",
                    stdDev: blackjackResults1Target?.stats.getStdDev().toFixed(2),
                    meanExcludingFirstLoss: blackjackResults1Target?.statsNoFirstLoss.getMean().toFixed(2),
                    stdDevExcludingFirstLoss: blackjackResults1Target?.statsNoFirstLoss.getStdDev().toFixed(2)
                },
                half2x: {
                    mean: blackjackResults2Target?.stats.getMean().toFixed(2),
                    riskOfRuin: (100 - (blackjackResults2Target?.timesNotBusted / SIMULATIONS * 100)).toFixed(2) + "%",
                    stdDev: blackjackResults2Target?.stats.getStdDev().toFixed(2),
                    meanExcludingFirstLoss: blackjackResults2Target?.statsNoFirstLoss.getMean().toFixed(2),
                    stdDevExcludingFirstLoss: blackjackResults2Target?.statsNoFirstLoss.getStdDev().toFixed(2)
                },
                half3x: {
                    mean: blackjackResults3Target?.stats.getMean().toFixed(2),
                    riskOfRuin: (100 - (blackjackResults3Target?.timesNotBusted / SIMULATIONS * 100)).toFixed(2) + "%",
                    stdDev: blackjackResults3Target?.stats.getStdDev().toFixed(2),
                    meanExcludingFirstLoss: blackjackResults3Target?.statsNoFirstLoss.getMean().toFixed(2),
                    stdDevExcludingFirstLoss: blackjackResults3Target?.statsNoFirstLoss.getStdDev().toFixed(2)
                }
            }

        };

        existing.push(results);
        try {
            fs.writeFileSync('../results.json', JSON.stringify(existing, null, 2), 'utf8');

const repoDir = path.resolve(__dirname, '..'); // Adjust if needed

exec(
  'git add results.json && git commit -m "Update results.json" && git push origin master',
  { cwd: repoDir },
  (err, stdout, stderr) => {
    if (err) {
      console.error('Git commit/push error:', err);
      console.error('stderr:', stderr);
      return;
    }
    console.log('✅ Git commit and push success:');
    console.log(stdout);
    if (stderr) console.log(stderr);
  }
);



        } catch (err) {
            console.error('❌ Failed to write results.json:', err);
        }
    })
    .catch(err => {
        console.error("❌ Error fetching data:", err);
    });