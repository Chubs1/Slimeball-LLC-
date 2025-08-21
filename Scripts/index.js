const jsonUrl = './results.json?v=' + new Date().getTime();

const DEV_MODE = false // this actually is gonna be if user wasnts to be putting in profits or not.
fetch(jsonUrl)
  .then(response => response.json())
  .then(results => {
    console.log(results);
    startSite(results);
  })
  .catch(error => console.error('Error loading JSON:', error));

const blackjackBetSizes = [
    { value: 5, label: "$5" },
    { value: 10, label: "$10" },
    { value: 15, label: "$15" },
    { value: 20, label: "$20" }
];

const rpsBetSizes = [
    { value: 5, label: "$1" },
    { value: 10, label: "$2" },
    { value: 15, label: "$3" },
    { value: 20, label: "$4" }
];




async function startSite(results) {

  if (!db) {
    await new Promise(resolve => {
      request.onsuccess = () => {
        db = request.result;
        resolve();
      };
    });
  }
  const loggedDealsMap = await loadLoggedDeals();

const chipContainer = document.querySelector('.chip-container');

results.forEach(result => {

const chosenStrategy = "normal";
const betSize = 5
  const chip = createChip(result, chosenStrategy,loggedDealsMap,betSize);
  chipContainer.appendChild(chip);
});

document.getElementById('quickOpenBtn').addEventListener('click', () => {
  const chips = document.querySelectorAll('.chip[data-link]');
  chips.forEach(chip => {
    if(chip.style.display === 'none') return    
    const url = chip.getAttribute('data-link');
    if (url) {
      window.open(url, '_blank');
    }
  });

});





const strategySelect = document.getElementById("strategySelect");

strategySelect.addEventListener("change", () => {
    const chosenStrategy = strategySelect.value;
    console.log("Chosen strategy:", chosenStrategy);

    const isRps = chosenStrategy.startsWith("rps");

    document.querySelectorAll('.casino-chip').forEach(chip => {
        const chipStrategySelect = chip.querySelector('select.strategy-select');
        if (chipStrategySelect) {
            chipStrategySelect.value = chosenStrategy; // set to match top selector
        }
        updateBetSizeLabels(isRps, chip);
        updateChipsStrategy([chip], chosenStrategy);
    });
});

const betSizeSelect = document.getElementById("betSizeSelect");

betSizeSelect.addEventListener("change", () => {
    const chosenBetSize = betSizeSelect.value;

    document.querySelectorAll('.casino-chip').forEach(chip => {
        // Update each chip's bet size select
        const chipBetSizeSelect = chip.querySelector('select.bet-size-select');
        if (chipBetSizeSelect) {
            chipBetSizeSelect.value = chosenBetSize;
        }
        // Optional: If you need a function to re-render chip bet visuals
          updateChipsBetSize([chip], chosenBetSize)

    });
});


}

function getWagerX(casino, deposit, bonus, wagerReq){
  if(casino == "Horseshoe") return wagerReq / (deposit + bonus)
  if (casino == "Caesars") return (wagerReq / (deposit + bonus)) / 5
}


function createChip(result, chosenStrategy, loggedDealsMap, betSize) {
  const chipId = result.id;
  const chip = document.createElement('div');
  chip.classList.add('chip', 'casino-chip');
  chip.dataset.chipId = chipId;
  chip.dataset.link = result.link;
  chip.dataset.betSize = betSize;
  chip.dataset.chosenStrategy = chosenStrategy;
  chip.result = result;

  // Destructure strategy once, with fallback
  const strategy = result.strategy?.[betSize]?.[chosenStrategy] || {};
  const fmt = num => typeof num === 'number' ? num.toFixed(2) : num ?? 'N/A';

  chip.dataset.mean = strategy.mean ?? 'N/A';
  chip.dataset.sd = strategy.stdDev ?? 'N/A';

  chip.innerHTML = `
    <div class="chip-left">
      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus}) ${getWagerX(result.casino,result.deposit,result.bonus,result.wagerRequirement)}x</div>
      <div class="chip-text mean">Average Profit: $${fmt(strategy.mean)}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${fmt(strategy.stdDev)}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${strategy.riskOfRuin ?? 'N/A'}</div>
      <div class="chip-text meanExcludingFirstLoss">Average Excluding First Loss: $${fmt(strategy.meanExcludingFirstLoss)}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn; $${fmt(strategy.stdDevExcludingFirstLoss)}</div>
      <div class="chip-text chanceToProfit">Chance To Profit: ${strategy.chanceToProfit ?? 'N/A'}</div>
    </div>
    <div class="chip-right">
      <button class="dropdown-button">Mark as done ^</button>
      
      <div class="chip-selectors">
            <label>Choose a strategy:
            <select class="strategy-select">
                <optgroup label="Blackjack">
               <option value="normal">Flat Bets</option>
               <option value="half2x">Half Bankroll (2x Target)</option>
               <option value="half3x">Half Bankroll (3x Target)</option>
               <option value="full2x">Full Bankroll (2x Target)</option>
               <option value="full4x">Full Bankroll (4x Target)</option>
              </optgroup>
              <optgroup label="Rock Paper Scissors">
               <option value="rpsFlat">RPS Flat Bets</option>
               <option value="rpsHalf2x">RPS Half Bankroll (2x Target)</option>
               <option value="rpsHalf3x">RPS Half Bankroll (3x Target)</option>
               <option value="rpsFull2x">RPS Full Bankroll (2x Target)</option>
               <option value="rpsFull4x">RPS Full Bankroll (4x Target)</option>
              </optgroup>
              </select>
            </label>
            
          <label">Choose a bet size:
            <select class="bet-size-select">
               <option value="5">$5</option>
               <option value="10">$10</option>
               <option value="15">$15</option>
               <option value="20">$20</option>
            </select>
          </label>
    </div>


    </div>
  `;
const strategySelect = chip.querySelector('.strategy-select');
  const wagerReq = getWagerX(result.casino, result.deposit, result.bonus, result.wagerRequirement)
console.log(wagerReq)
if(result.casino == "Horseshoe"){
  if(wagerReq == 2) strategySelect.value = getCookie("horseshoeS2") || strategySelect.value;
  else if(wagerReq == 5) strategySelect.value = getCookie("horseshoeS5") || strategySelect.value;

} 
else if(result.casino == "Caesars"){
  if(wagerReq == 2) strategySelect.value = getCookie("caesarsS2") || strategySelect.value;
  else if(wagerReq == 5) strategySelect.value = getCookie("caesarsS5") || strategySelect.value;
} 

const betSizeSelect = chip.querySelector('.bet-size-select');
if(result.casino == "Horseshoe") {
  if(wagerReq == 2) betSizeSelect.value = getCookie("horseshoeB2") || betSizeSelect.value;
  else if(wagerReq == 5) betSizeSelect.value = getCookie("horseshoeB5") || betSizeSelect.value;
}
else if(result.casino == "Caesars"){
  if(wagerReq == 2) betSizeSelect.value = getCookie("caesarsB2") || betSizeSelect.value;
  else if(wagerReq == 5) betSizeSelect.value = getCookie("caesarsB5") || betSizeSelect.value;
}

    updateOneBetSizeLabel(strategySelect.value.startsWith("rps"), betSizeSelect);

  strategySelect.addEventListener("change", e => {

    const chosenStrategy = strategySelect.value;
    if(result.casino == "Horseshoe"){
      if(wagerReq == 2) document.cookie = `horseshoeS2=${chosenStrategy};expires=Thu, 18 Dec 2033 12:00:00 UTC `
      if(wagerReq == 5) document.cookie = `horseshoeS5=${chosenStrategy};expires=Thu, 18 Dec 2033 12:00:00 UTC `
    }
    else if(result.casino == "Caesars"){
      if(wagerReq == 2) document.cookie = `caesarsS2=${chosenStrategy};expires=Thu, 18 Dec 2033 12:00:00 UTC `
      if(wagerReq == 5) document.cookie = `caesarsS5=${chosenStrategy};expires=Thu, 18 Dec 2033 12:00:00 UTC `
    }
    console.log(document.cookie);
    console.log("Chosen strategy:", chosenStrategy);

    const isRps = chosenStrategy.startsWith("rps");
    updateOneBetSizeLabel(isRps, betSizeSelect);

    const chip = e.target.closest('.casino-chip');

    updateChipsStrategy([chip], chosenStrategy);
});

betSizeSelect.addEventListener("change", e => {
  const betSize = betSizeSelect.value;
    if(result.casino == "Horseshoe"){
      if(wagerReq == 2) document.cookie = `horseshoeB2=${betSize};expires=Thu, 18 Dec 2033 12:00:00 UTC `
      if(wagerReq == 5) document.cookie = `horseshoeB5=${betSize};expires=Thu, 18 Dec 2033 12:00:00 UTC `
    }
    else if(result.casino == "Caesars"){
      if(wagerReq == 2) document.cookie = `caesarsB2=${betSize};expires=Thu, 18 Dec 2033 12:00:00 UTC `
      if(wagerReq == 5) document.cookie = `caesarsB5=${betSize};expires=Thu, 18 Dec 2033 12:00:00 UTC `
    }
    console.log(document.cookie);
  console.log("Chosen betsize:", betSize);
  const chip = e.target.closest('.casino-chip');

  updateChipsBetSize([chip], betSize)
})


  chip.querySelector('.chip-left').addEventListener('click', () => {
    window.open(result.link, '_blank');
  });

  const right = chip.querySelector('.chip-right');
  const button = right.querySelector('button');

  if (loggedDealsMap?.has(chipId)) {
    button.textContent = 'Add another deal';
  }

  button.addEventListener('click', () => {
    // If DEV_MODE logic
    if (DEV_MODE) {
      logDeal({
        chipId,
        mean: chip.dataset.mean,
        sd: chip.dataset.sd,
        profit: 0,
        time: new Date().toISOString(),
      });
      button.textContent = 'Add another deal';
      return;
    }

    const existing = right.querySelector('.profit-bubble');
    if (existing) {
      existing.remove();
      return;
    }

    const bubble = document.createElement('div');
    bubble.classList.add('profit-bubble');
    bubble.innerHTML = `
      <input type="number" placeholder="Enter Profit (&plusmn;${chip.dataset.mean})" />
      <button>Submit</button>
    `;

    const input = bubble.querySelector('input');
    const submitBtn = bubble.querySelector('button');

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
      }
    });

    submitBtn.addEventListener('click', () => {
      const profit = parseFloat(input.value);
      if (!isNaN(profit)) {
        logDeal({
          chipId,
          mean: chip.dataset.mean,
          sd: chip.dataset.sd,
          profit,
          time: new Date().toISOString(),
        });
        button.textContent = 'Add another deal';
        bubble.remove();
      } else {
        alert('Please enter a valid number.');
      }
    });

    right.appendChild(bubble);
    input.focus();
  });

  return chip;
}



function updateChipsStrategy(chips, chosenStrategy) {
  chips.forEach(chip => {
    const { result, dataset } = chip;
    const betSize = dataset.betSize;

    // Grab the relevant strategy object once
    const strategy = result.strategy?.[betSize]?.[chosenStrategy];
    if (!strategy) return; // defensive: skip if strategy not found

    // Destructure needed values with defaults/fallbacks
    const {
      mean = 'N/A',
      stdDev = 'N/A',
      riskOfRuin = 'N/A',
      meanExcludingFirstLoss = 'N/A',
      stdDevExcludingFirstLoss = 'N/A',
      chanceToProfit = 'N/A'
    } = strategy;

    // Update dataset attributes (strings only)
    dataset.mean = mean;
    dataset.sd = stdDev;
    dataset.chosenStrategy = chosenStrategy;

    // Format numbers with two decimals if they are numbers
    const fmt = (num) => typeof num === 'number' ? num.toFixed(2) : num;

    chip.querySelector('.chip-left').innerHTML = `

      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus}) ${getWagerX(result.casino,result.deposit,result.bonus,result.wagerRequirement)}x</div>
      <div class="chip-text mean">Average Profit: $${fmt(strategy.mean)}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${fmt(strategy.stdDev)}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${strategy.riskOfRuin ?? 'N/A'}</div>
      <div class="chip-text meanExcludingFirstLoss">Average Excluding First Loss: $${fmt(strategy.meanExcludingFirstLoss)}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn; $${fmt(strategy.stdDevExcludingFirstLoss)}</div>
      <div class="chip-text chanceToProfit">Chance To Profit: ${strategy.chanceToProfit ?? 'N/A'}</div>

    `;
  });
}


function updateChipsBetSize(chips, betSize) {
  chips.forEach(chip => {
    const { result, dataset } = chip;
    const chosenStrategy = dataset.chosenStrategy;

    // Defensive check if chosenStrategy or strategy missing
    const strategy = result.strategy?.[betSize]?.[chosenStrategy];
    if (!strategy) return;

    const {
      mean = 'N/A',
      stdDev = 'N/A',
      riskOfRuin = 'N/A',
      meanExcludingFirstLoss = 'N/A',
      stdDevExcludingFirstLoss = 'N/A',
      chanceToProfit = 'N/A'
    } = strategy;

    dataset.betSize = betSize;
    dataset.mean = mean;
    dataset.sd = stdDev;

    const fmt = (num) => typeof num === 'number' ? num.toFixed(2) : num;

    chip.querySelector('.chip-left').innerHTML = `
      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus}) ${getWagerX(result.casino,result.deposit,result.bonus,result.wagerRequirement)}x</div>
      <div class="chip-text mean">Average Profit: $${fmt(strategy.mean)}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${fmt(strategy.stdDev)}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${strategy.riskOfRuin ?? 'N/A'}</div>
      <div class="chip-text meanExcludingFirstLoss">Average Excluding First Loss: $${fmt(strategy.meanExcludingFirstLoss)}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn; $${fmt(strategy.stdDevExcludingFirstLoss)}</div>
      <div class="chip-text chanceToProfit">Chance To Profit: ${strategy.chanceToProfit ?? 'N/A'}</div>
    `;
  });
}


function logDeal(data) {
  console.log('Logging deal:', data);
    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    store.add(data);
    tx.oncomplete = () => console.log('Deal saved:', data);
    tx.onerror = () => console.error('Save failed');
}

let db;
const request = indexedDB.open('CasinoDB', 1);
request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Create object store with auto-incrementing key
    if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('Database ready');
};

request.onerror = function (event) {
    console.error('Database error:', event.target.errorCode);
};


async function loadLoggedDeals() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const map = new Map();
      for (const deal of request.result) {
        if (deal.chipId) {
          map.set(deal.chipId, deal);
        }
      }
      resolve(map);
    };
    
    request.onerror = () => reject('Failed to load deals');
  });
}

function updateBetSizeLabels(isRps, chip = null) {
  const sizes = isRps ? rpsBetSizes : blackjackBetSizes;

  // If called with a specific chip, only update that chip's bet-size-select
  const selects = chip 
    ? [chip.querySelector('.bet-size-select')].filter(Boolean)
    : document.querySelectorAll('.bet-size-select, #betSizeSelect');

  selects.forEach(select => {
    Array.from(select.options).forEach((option, index) => {
      if (sizes[index]) {
        option.textContent = sizes[index].label;
      }
    });
  });
}

function updateOneBetSizeLabel(isRps, select) {
    const sizes = isRps ? rpsBetSizes : blackjackBetSizes;
    // Update the label text only, keep the values intact
    Array.from(select.options).forEach((option, index) => {
        if (sizes[index]) {
            option.textContent = sizes[index].label;
        }
    });
}


function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

