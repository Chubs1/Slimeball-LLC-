const jsonUrl = './results.json?v=' + new Date().getTime();

const DEV_MODE = false // this actually is gonna be if user wasnts to be putting in profits or not.

fetch(jsonUrl)
  .then(response => response.json())
  .then(results => {
    console.log(results);
    startSite(results);
  })
  .catch(error => console.error('Error loading JSON:', error));





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
  // on creation get user strategy from top drop down, but if user saved other as default you can get from cookie of same name as casino? TK
  // and when they switch it themselves update cookie if applicable and just update the chip there. TK

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

function updateBetSizeLabels(isRps) {
    const sizes = isRps ? rpsBetSizes : blackjackBetSizes;
    // Update the label text only, keep the values intact
    Array.from(betSizeSelect.options).forEach((option, index) => {
        if (sizes[index]) {
            option.textContent = sizes[index].label;
        }
    });
}

const strategySelect = document.getElementById("strategySelect");
const betSizeSelect = document.getElementById("betSizeSelect");

strategySelect.addEventListener("change", () => {
    const chosenStrategy = strategySelect.value;
    console.log("Chosen strategy:", chosenStrategy);

    const isRps = chosenStrategy.startsWith("rps");
    updateBetSizeLabels(isRps);

    updateChipStrategy(document.querySelectorAll('.casino-chip'), chosenStrategy);
});

}

const betSizeSelect = document.getElementById("betSizeSelect");

betSizeSelect.addEventListener("change", () => {
  const betSize = betSizeSelect.value;
  console.log("Chosen betsize:", betSize);
  updateChipBetSize(document.querySelectorAll('.casino-chip'), betSize)
})


const today = new Date().toISOString().slice(0,10); // "YYYY-MM-DD" like "2025-08-05"
let chipCounter = 0;

function createChip(result, chosenStrategy, loggedDealsMap, betSize) {
  const chipId = result.id;


  const chip = document.createElement('div');
  chip.classList.add('chip', 'casino-chip');
  chip.dataset.chipId = chipId;
  chip.dataset.link = result.link;
  chip.dataset.betSize = betSize;
  chip.dataset.chosenStrategy = chosenStrategy;
  chip.result = result;

  chip.dataset.sd = result.strategy[betSize][chosenStrategy].stdDev;
  chip.dataset.mean = result.strategy[betSize][chosenStrategy].mean;

  chip.innerHTML = `
    <div class="chip-left">
      <div class="chip-title">${result.casino}</div>
      <div class="chip-text">Deposit: $${result.deposit}</div>
      <div class="chip-text">Bonus: $${result.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${chip.dataset.mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${chip.dataset.sd}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${result.strategy[betSize][chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${result.strategy[betSize][chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${result.strategy[betSize][chosenStrategy].stdDevExcludingFirstLoss}</div>
    </div>
    <div class="chip-right" style="position: relative;">
      <button class="dropdown-button"> Mark as done ^</button>

    </div>
  `;

  

  chip.querySelector('.chip-left').addEventListener('click', () => {
    window.open(result.link, '_blank');
  });

  const right = chip.querySelector('.chip-right');
const button = right.querySelector('button');

if (loggedDealsMap && loggedDealsMap.has(chipId)) {
  button.textContent = 'Add another deal';
}

button.addEventListener('click', e => {
  console.log("clicked right");

  if (DEV_MODE) {
    logDeal({
      chipId, 
      mean: chip.dataset.mean,
      sd: chip.dataset.sd,
      profit: 0,
      time: new Date().toISOString()
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

  input.addEventListener('keydown', (e) => {
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
        time: new Date().toISOString()
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


function updateChipStrategy(chips, chosenStrategy) {
  
  chips.forEach(chip => {
  const result = chip.result;
  const betSize = chip.dataset.betSize;
  chip.dataset.mean = result.strategy[betSize][chosenStrategy].mean;
  chip.dataset.sd = result.strategy[betSize][chosenStrategy].stdDev;
  chip.dataset.chosenStrategy = chosenStrategy;
      chip.querySelector('.chip-left').innerHTML = `
      <div class="chip-title">${result.casino}</div>
      <div class="chip-text">Deposit: $${result.deposit}</div>
      <div class="chip-text">Bonus: $${result.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${chip.dataset.mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${chip.dataset.sd}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${result.strategy[betSize][chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${result.strategy[betSize][chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${result.strategy[betSize][chosenStrategy].stdDevExcludingFirstLoss}</div>
  `;
  });
}

function updateChipBetSize(chips, betSize) {
  
  chips.forEach(chip => {
  const result = chip.result;
  const chosenStrategy = chip.dataset.chosenStrategy;
  chip.dataset.betSize = betSize
  chip.dataset.mean = result.strategy[betSize][chosenStrategy].mean;
  chip.dataset.sd = result.strategy[betSize][chosenStrategy].stdDev;
      chip.querySelector('.chip-left').innerHTML = `
      <div class="chip-title">${result.casino}</div>
      <div class="chip-text">Deposit: $${result.deposit}</div>
      <div class="chip-text">Bonus: $${result.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${chip.dataset.mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${chip.dataset.sd}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${result.strategy[betSize][chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${result.strategy[betSize][chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${result.strategy[betSize][chosenStrategy].stdDevExcludingFirstLoss}</div>
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
