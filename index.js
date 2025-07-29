


const chipsData = [
  {
    title: "Horseshoe Casino",
    text: "Deposit: $50 <br>EV: $5 <br> SD: $30",
    link: "https://horseshoeonlinecasino.com/us/mi/mypromos",
    group: "daily risk"
  },
  {
    title: "Bet Rivers Casino",
    text: "Deposit: Free <br> EV: $2 <br> SD: $2",
    link: "https://mi.betrivers.com/?page=all-games",
    group: "weekly norisk"
  },
  {
    title: "Caesars Casino",
    text: "Deposit: $100 <br> EV: $10 <br> SD: $50",
    link: "https://caesarspalaceonline.com/us/mi/mypromos",
    group: "daily risk"
  }
];

// Get container
const chipContainer = document.querySelector('.chip-container');

// Function to create one chip element
function createChip({title, text, link, group}) {
  const chip = document.createElement('div');
  chip.classList.add('chip');
  chip.dataset.link = link;
  if (group) chip.dataset.group = group;

  chip.onclick = () => window.open(link, '_blank');

  // Inner structure
  chip.innerHTML = `
    <div class="chip-top">
      <div class="chip-title">${title}</div>
      <div class="chip-text">${text}</div>
    </div>
  `;

  return chip;
}

// Add chips dynamically
chipsData.forEach(chipInfo => {
  const chip = createChip(chipInfo);
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