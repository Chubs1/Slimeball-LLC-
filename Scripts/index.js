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

  const chip = createChip(result, chosenStrategy,loggedDealsMap);
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

  const select = document.getElementById("strategySelect");


  select.addEventListener("change", () => {
    const chosenStrategy = select.value;
    console.log("Chosen strategy:", chosenStrategy);

    updateChips(document.querySelectorAll('.casino-chip'), chosenStrategy);
  });

}

const today = new Date().toISOString().slice(0,10); // "YYYY-MM-DD" like "2025-08-05"
let chipCounter = 0;

function createChip(result, chosenStrategy, loggedDealsMap) {
  const chipId = result.id;


  const chip = document.createElement('div');
  chip.classList.add('chip', 'casino-chip');
  chip.dataset.chipId = chipId;
  chip.dataset.link = result.link;
  chip.result = result;

  const mean = result.strategy[chosenStrategy].mean;
  const sd = result.strategy[chosenStrategy].stdDev;

  chip.innerHTML = `
    <div class="chip-left">
      <div class="chip-title">${result.casino}</div>
      <div class="chip-text">Deposit: $${result.deposit}</div>
      <div class="chip-text">Bonus: $${result.bonus}</div>
      <div class="chip-text mean">Average Profit: $${mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn;$${sd}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${result.strategy[chosenStrategy].riskOfRuin}</div>
    </div>
    <div class="chip-right" style="position: relative;">
      <button class="chip-button">Mark as Done</button>
    </div>
  `;

  chip.querySelector('.chip-left').addEventListener('click', () => {
    window.open(result.link, '_blank');
  });

  const btn = chip.querySelector('.chip-button');
  const right = chip.querySelector('.chip-right');

    if (loggedDealsMap && loggedDealsMap.has(chipId)) {
    btn.textContent = 'Edit';
    btn.style.backgroundColor = '#4CAF50';
  }


  btn.addEventListener('click', () => {
    if (DEV_MODE) {
      logDeal({
        chipId, 
        mean, sd,
        profit: 0,
        time: new Date().toISOString()
      });
              btn.textContent = 'Done';
    btn.style.backgroundColor = '#4CAF50';  // a nice green
      return;
    }

    // If bubble already exists, remove it
    const existing = right.querySelector('.profit-bubble');
    if (existing) {
      existing.remove();
      return;
    }

    const bubble = document.createElement('div');
    bubble.classList.add('profit-bubble');
    bubble.innerHTML = `
      <input type="number" placeholder="Enter Profit (&plusmn;${sd})" />
      <button>Submit</button>
    `;

    const input = bubble.querySelector('input');
    input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitBtn.click(); // Trigger same submit logic
  }
});


    const submitBtn = bubble.querySelector('button');

    submitBtn.addEventListener('click', () => {
      const profit = parseFloat(input.value);
      if (!isNaN(profit)) {
        logDeal({
          chipId,
          mean,
          sd,
          profit,
          time: new Date().toISOString()
        });

        btn.textContent = 'Edit';
    btn.style.backgroundColor = '#4CAF50';  // a nice green

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


function updateChips(chips, chosenStrategy) {
  
  chips.forEach(chip => {
    console.log(chip);
  const result = chip.result;
  console.log(result)
      chip.querySelector('.chip-left').innerHTML = `
      <div class="chip-title">${result.casino}</div>
      <div class="chip-text">Deposit: $${result.deposit}</div>
      <div class="chip-text">Bonus: $${result.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${result.strategy[chosenStrategy].mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${result.strategy[chosenStrategy].stdDev}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${result.strategy[chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${result.strategy[chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${result.strategy[chosenStrategy].stdDevExcludingFirstLoss}</div>
    </div>
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


