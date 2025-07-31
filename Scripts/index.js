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
  const chip = createChip(result);
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

const checkboxes = document.querySelectorAll('.filter-chip input[type="checkbox"]');
const chips = document.querySelectorAll('.chip[data-group]');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const activeGroups = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    chips.forEach(chip => {
      // get groups array from attribute
      const group = chip.dataset.group ? chip.dataset.group.split(' ') : [];

      // show chip if ANY active group matches chip groups
      const show = group.some(g => activeGroups.includes(g));

      chip.style.display = show ? 'block' : 'none';
    });
  });
});

}


function createChip(results) {
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
      <div class="chip-text mean"> Average Profit: $${results.strategy.normal.mean}</div>
      <div class="chip-text stdDev">Standard Deviation: &plusmn; $${results.strategy.normal.stdDev}</div>
      <div class="chip-text riskOfRuin"> Risk of Ruin: ${results.strategy.normal.riskOfRuin}</div>
      <div class="chip-text meanExcludingFirstLoss"> Average Excluding First Loss: $${results.strategy.normal.meanExcludingFirstLoss}</div>
      <div class="chip-text stdDevExcludingFirstLoss">Standard Deviation Excluding First Loss: &plusmn;$${results.strategy.normal.stdDevExcludingFirstLoss}</div>
    </div>
  `;

  return chip;
}








