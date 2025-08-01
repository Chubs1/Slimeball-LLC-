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
    updateChips(document.querySelectorAll('.chip'), results, chosenStrategy);
  });

}


function createChip(results, chosenStrategy) {
  const chip = document.createElement('div');
  chip.classList.add('chip');
  chip.dataset.link = results.link;
  // get user strategy TK

  chip.onclick = () => window.open(results.link, '_blank');
  
  // Inner structure
  chip.innerHTML = `
    <div class="chip-top">
      <div class="chip-title">${results.casino}</div>
      <div class="chip-text">Deposit: $${results.deposit}</div>
      <div class="chip-text">Bonus: $${results.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${results.strategy[chosenStrategy].mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${results.strategy[chosenStrategy].stdDev}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${results.strategy[chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${results.strategy[chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${results.strategy[chosenStrategy].stdDevExcludingFirstLoss}</div>
    </div>
  `;

  return chip;
}

function updateChips(chips, results, chosenStrategy) {
  chips.forEach(chip => {
    
      chip.innerHTML = `
    <div class="chip-top">
      <div class="chip-title">${results.casino}</div>
      <div class="chip-text">Deposit: $${results.deposit}</div>
      <div class="chip-text">Bonus: $${results.bonus}</div>
      <div class="chip-text mean"> Average Profit: $${results.strategy[chosenStrategy].mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${results.strategy[chosenStrategy].stdDev}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${results.strategy[chosenStrategy].riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${results.strategy[chosenStrategy].meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${results.strategy[chosenStrategy].stdDevExcludingFirstLoss}</div>
    </div>
  `;
  });
}




