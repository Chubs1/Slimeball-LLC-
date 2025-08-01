const jsonUrl = './results.json?v=' + new Date().getTime();

fetch(jsonUrl)
  .then(response => response.json())
  .then(results => {
    console.log(results);
    startSite(results);
  })
  .catch(error => console.error('Error loading JSON:', error));





function startSite(results) {
const chipContainer = document.querySelector('.chip-container');



results.forEach(result => {
  // on creation get user strategy from top drop down, but if user saved other as default you can get from cookie of same name as casino? TK
  // and when they switch it themselves update cookie if applicable and just update the chip there. TK
const chosenStrategy = "normal";
  const chip = createChip(result, chosenStrategy);
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


function createChip(result, chosenStrategy) {
  const chip = document.createElement('div');
  chip.classList.add('chip');
  chip.classList.add('casino-chip');
  chip.dataset.link = result.link;
  chip.result = result

  // get user strategy TK

  chip.onclick = () => window.open(result.link, '_blank');
  
  // Inner structure
  chip.innerHTML = `
    <div class="chip-top">
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
console.log(chip.result);
  return chip;
}

function updateChips(chips, chosenStrategy) {
  
  chips.forEach(chip => {
    console.log(chip);
  const result = chip.result;
  console.log(result)
      chip.innerHTML = `
    <div class="chip-top">
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




