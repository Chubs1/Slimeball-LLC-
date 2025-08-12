const jsonUrl = './results.json?v=' + new Date().getTime();

const leftSide = document.querySelector('#left-container');
const rightSide = document.querySelector('#right-container');
const leftSelectSt = document.querySelector('#strategySelectLeft')
const rightSelectSt = document.querySelector('#strategySelectRight')
const leftSelectBet = document.querySelector("#betSelectLeft")
const rightSelectBet = document.querySelector("#betSelectRight")
const middle = document.querySelector('#middle-container')



const speedOfTransition = 1000

fetch(jsonUrl)
  .then(response => response.json())
  .then(results => {
    startSite(results, "normal", 5);
  })

function startSite(results){



results.forEach(result => {
  const chipLeft = createChip(result, "normal", 5);
  const chipRight = createChip(result, "normal", 5);

  [chipLeft, chipRight].forEach(chip => {
    chip.addEventListener('click', () => chipClickHandler(chip));
  });

  leftSide.appendChild(chipLeft);
  rightSide.appendChild(chipRight);
});
    


leftSelectSt.addEventListener('change', e => onStrategyChange(leftSide, e));
rightSelectSt.addEventListener('change', e => onStrategyChange(rightSide, e));
leftSelectBet.addEventListener('change', e => onBetChange(leftSide, e));
rightSelectBet.addEventListener('change', e => onBetChange(rightSide, e));

}


function updateMiddle(leftTop, rightTop) {
    const leftResults = leftTop.result;
    const rightResults = rightTop.result;
      const chip = document.createElement('div');
      console.log(rightResults)
      chip.classList.add("chip")
        chip.innerHTML = `
    <div class="chip-left">
      <div class="chip-title">Comparison</div>
      <div class="chip-text mean">${leftResults.strategy?.[5]?.normal?.mean}</div>
      <div class="chip-text stdDev">w</div>
      <div class="chip-text riskOfRuin">w</div>
      <div class="chip-text meanExcludingFirstLoss">w</div>
      <div class="chip-text stdDevExcludingFirstLoss">w</div>
      <div class="chip-text chanceToProfit">Cw</div>
    </div>
  `;
  const topThing = document.createElement('div');
  topThing.classList.add('chip')
  topThing.innerHTML = `
        <div class="chip-left">
            <label for="strategySelectRightw">Choose a strategy:</label>
            <select id="strategySelectRightw">
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

          <label for="betSelectRightw">Choose a bet size:</label>
            <select id="betSelectRightw">
               <option value="5">$5</option>
               <option value="10">$10</option>
               <option value="15">$15</option>
               <option value="20">$20</option>
            </select>
            
        </div>
    
`
      middle.replaceChildren(topThing,chip);

}

function chipClickHandler(chip) {
  const parent = chip.parentElement;
  if (!parent) return;

  // Move the chip to be the first child of its parent
  animateMoveToTop(chip);

}

function animateMoveToTop(chip) {
  const parent = chip.parentElement;
  if (!parent) return;

  // Get original position of clicked chip
  const firstRect = chip.getBoundingClientRect();

  // Get siblings (exclude clicked chip)
const siblings = Array.from(parent.children).filter(c => 
  c !== chip && 
  c.classList.contains('chip') && 
  !c.classList.contains('strategy-chip')
);


  const siblingsFirstRects = siblings.map(sib => sib.getBoundingClientRect());

  // Move clicked chip to top
  parent.insertBefore(chip, parent.children[1]);

  // Get new position of clicked chip
  const lastRect = chip.getBoundingClientRect();
  const deltaY = firstRect.top - lastRect.top;

  // Animate clicked chip moving up
  chip.style.transition = 'none';
  chip.style.transform = `translateY(${deltaY}px)`;
  chip.offsetHeight; // force reflow
  chip.style.transition = `transform ${speedOfTransition}ms ease`;
  chip.style.transform = 'translateY(0)';
  chip.style.zIndex = 1000;
  chip.style.background = "tan"
    chip.classList.add('active')
    chip.classList.remove('inactive')
  // Animate siblings moving down smoothly
  siblings.forEach((sib, i) => {
    const sibLastRect = sib.getBoundingClientRect();
    const sibDeltaY = siblingsFirstRects[i].top - sibLastRect.top;
      sib.classList.remove('active')
      sib.classList.add('inactive')
      sib.style.zIndex = 999;
    if (sibDeltaY !== 0) {
      sib.style.transition = 'none';
      sib.style.transform = `translateY(${sibDeltaY}px)`;
      sib.offsetHeight; // force reflow
      sib.style.transition = `transform ${speedOfTransition}ms ease`;
      sib.style.transform = 'translateY(0)';
      sib.style.background = "grey"


      sib.addEventListener('transitionend', () => {
        sib.style.transition = '';
        sib.style.transform = '';
        
      }, { once: true });
    }
  });

  chip.addEventListener('transitionend', () => {
    chip.style.transition = '';
    chip.style.transform = '';
    chip.style.zIndex = '';  

  }, { once: true });
  updateMiddle(leftSide.children[1], rightSide.children[1])
}

function onStrategyChange(container, event) {
  const value = event.target.value;
  const childrenArray = Array.from(container.children);
    const chipsToUpdate = childrenArray.slice(1); // skips the first child

  updateChipsStrategy(chipsToUpdate, value);
  updateMiddle(leftSide.children[1], rightSide.children[1])
}

function onBetChange(container, event) {
  const value = event.target.value;
  const childrenArray = Array.from(container.children);
    const chipsToUpdate = childrenArray.slice(1); // skips the first child
  updateChipsBetSize(chipsToUpdate, value);
  updateMiddle(leftSide.children[1], rightSide.children[1])
}

function createChip(result, chosenStrategy, betSize) {
const chipId = result.id;

  const chip = document.createElement('div');
  chip.classList.add('chip', 'casino-chip');
  chip.dataset.chipId = chipId;
  chip.dataset.betSize = betSize;
  chip.dataset.chosenStrategy = chosenStrategy;
  chip.result = result;
  const strategy = result.strategy?.[betSize]?.[chosenStrategy] || {};
  const fmt = num => typeof num === 'number' ? num.toFixed(2) : num ?? 'N/A';

  chip.dataset.mean = strategy.mean ?? 'N/A';
  chip.dataset.sd = strategy.stdDev ?? 'N/A';

  chip.innerHTML = `
    <div class="chip-left">
      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus})</div>
      <div class="chip-text mean">Average Profit: $${fmt(strategy.mean)}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${fmt(strategy.stdDev)}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${strategy.riskOfRuin ?? 'N/A'}</div>
      <div class="chip-text meanExcludingFirstLoss">Average Excluding First Loss: $${fmt(strategy.meanExcludingFirstLoss)}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn; $${fmt(strategy.stdDevExcludingFirstLoss)}</div>
      <div class="chip-text chanceToProfit">Chance To Profit: ${strategy.chanceToProfit ?? 'N/A'}</div>
    </div>
  `;
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

      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus})</div>
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
      <div class="chip-title">${result.casino}: $${result.deposit} ($${result.bonus})</div>
      <div class="chip-text mean">Average Profit: $${fmt(strategy.mean)}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${fmt(strategy.stdDev)}</div>
      <div class="chip-text riskOfRuin">Risk of Ruin: ${strategy.riskOfRuin ?? 'N/A'}</div>
      <div class="chip-text meanExcludingFirstLoss">Average Excluding First Loss: $${fmt(strategy.meanExcludingFirstLoss)}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn; $${fmt(strategy.stdDevExcludingFirstLoss)}</div>
      <div class="chip-text chanceToProfit">Chance To Profit: ${strategy.chanceToProfit ?? 'N/A'}</div>
    `;
  });
}

