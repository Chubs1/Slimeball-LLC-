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
    showChart();
};

request.onerror = function (event) {
    console.error('Database error:', event.target.errorCode);
};

function renderChart(data) {
    console.log(data)
    if (!data.length) {
        return;
    }

    // Sort by time ascending
    data.sort((a, b) => new Date(a.chipId) - new Date(b.chipId));

    // Extract labels (just day)
    const labels = data.map(d => {
        const dt = new Date(d.chipId);
        return dt.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    });
    const realProfit = data.map(d => parseFloat(d.profit))
    const summedProfit = runningSum(realProfit);
    const mean = data.map(d => parseFloat(d.mean));
    const summedMean = runningSum(mean);
    const sd = data.map(d => parseFloat(d.sd));
    const summedSD = runningSD(sd);
     const meanPlusSD = summedMean.map((m, i) => m + summedSD[i]);
     const meanMinusSD = summedMean.map((m, i) => m - summedSD[i]);
    const meanPlus2SD = summedMean.map((m, i) => m + (2 * summedSD[i]));
     const meanMinus2SD = summedMean.map((m, i) => m - (2* summedSD[i]));
     const meanPlus3SD = summedMean.map((m, i) => m + (3 * summedSD[i]));
     const meanMinus3SD = summedMean.map((m, i) => m - (3 * summedSD[i]));
    const canvas = document.getElementById('recordChart');
    canvas.style.display = 'block';

    if (window.recordChartInstance) {
        window.recordChartInstance.data.labels = labels;
        window.recordChartInstance.data.datasets[0].data = summedProfit;
        window.recordChartInstance.data.datasets[1].data = summedMean;
        window.recordChartInstance.data.datasets[2].data = meanPlusSD;
        window.recordChartInstance.data.datasets[3].data = meanMinusSD;
        window.recordChartInstance.data.datasets[4].data = meanPlus2SD;
        window.recordChartInstance.data.datasets[5].data = meanMinus2SD;
        window.recordChartInstance.data.datasets[6].data = meanPlus3SD;
        window.recordChartInstance.data.datasets[7].data = meanMinus3SD;
        window.recordChartInstance.update();
    } else {
        const ctx = canvas.getContext('2d');
        window.recordChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Real Profit',
                        data: summedProfit,
                        borderColor: 'green',
                        backgroundColor: 'rgba(0, 0, 112, 0.1)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2

                    },

                    {
                        label: 'Expected Value',
                        data: summedMean,
                        borderColor: 'blue',
                        backgroundColor: 'rgba(0, 0, 112, 0.1)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2

                    },
                    
                    {
                        label: '1 SD',
                        data: meanPlusSD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0

                    },
                    {
                        label: '', // minus - 1 SD
                        data: meanMinusSD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        datalabels: {
                            display: false
                        }
                    },

                                        {
                        label: '2 SD',
                        data: meanPlus2SD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0

                    },
                    {
                        label: '', // minus - 2 SD
                        data: meanMinus2SD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        datalabels: {
                            display: false
                        }
                    },
                    {
                        label: '3 SD',
                        data: meanPlus3SD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0

                    },
                    {
                        label: '', // minus - 3 SD
                        data: meanMinus3SD,
                        borderColor: 'rgba(0, 0, 255, 0.1)',
                        borderDash: [5, 5],  // dashed line
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        datalabels: {
                            display: false
                        }
                    }
                    
                ]
            },
            options: {
                plugins: {
                    legend: {
                        onClick: function (e, legendItem, legend) {
                const index = legendItem.datasetIndex;
                const ci = legend.chart;

                // Toggle +SD
                const meta = ci.getDatasetMeta(index);
                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

                // Also toggle -SD (assuming it's the next dataset)
                const label = legendItem.text
                if (label === '1 SD') {
                    const minusSDIndex = index + 1;
                    const minusMeta = ci.getDatasetMeta(minusSDIndex);
                    minusMeta.hidden = meta.hidden;
                }

                        if (label === '2 SD') {
            const minus2SDIndex = index + 1;
            const minus2Meta = ci.getDatasetMeta(minus2SDIndex);
            minus2Meta.hidden = meta.hidden;
                  }

                                          if (label === '3 SD') {
            const minus3SDIndex = index + 1;
            const minus3Meta = ci.getDatasetMeta(minus3SDIndex);
            minus3Meta.hidden = meta.hidden;
                  }

                

                ci.update();
                       },
                    labels: {
                        filter: function (legendItem, data) {
                            return legendItem.text !== '';
                        }
                   }
                }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Expected Value ($)' }
                    },
                    x: {
                        title: { display: true, text: 'Day' }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

canvas.addEventListener('click', function (event) {
  const chart = window.recordChartInstance;
  const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);

  if (points.length) {
    const firstPoint = points[0];
    const index = firstPoint.index; // The column index (shared by all datasets)
    const label = chart.data.labels[index];

    // Collect values from ALL datasets for that column
    const values = chart.data.datasets.map((dataset, datasetIndex) => ({
      datasetIndex,
      label: dataset.label, // "Real Profit", "Expected", "SD"
      value: dataset.data[index]
    }));
    console.log(values)

    // Open menu with all values
        event.stopPropagation();

    showContextMenu(event.clientX, event.clientY, {
      columnLabel: label,
      columnIndex: index,
      values
    });
  }
});





}

function exportData() {
  document.getElementById("dataBox").value = JSON.stringify(data, null, 2);
}

// Import → read from textarea
function importData() {
  try {
    const txt = document.getElementById("dataBox").value;
    const imported = JSON.parse(txt);
    if (Array.isArray(imported)) {
      data = imported;
      console.log("Imported:", data);
      alert("Data imported successfully!");
    } else {
      alert("Invalid format: must be an array");
    }
  } catch (e) {
    alert("Invalid JSON");
  }
}

let chartDataRaw = []; // global array to keep records with keys

function showChart() {
  const tx = db.transaction('transactions', 'readonly');
  const store = tx.objectStore('transactions');
  
  const getAllRequest = store.getAll();
  const getKeysRequest = store.getAllKeys();
  
  getAllRequest.onsuccess = function () {
    getKeysRequest.onsuccess = function () {
      const values = getAllRequest.result;
      const keys = getKeysRequest.result;
      
      // Combine values and keys into one array
      chartDataRaw = values.map((value, i) => {
        return { ...value, _id: keys[i] };
      });
      const exportButton = document.getElementById('exportButton');
      const statsButton = document.getElementById('statsButton');
      const chartDataBox = document.getElementById('chartDataBox');
      const totalDeals = chartDataRaw.length;
      const totalProfit = chartDataRaw.reduce((sum, record) => sum + parseFloat(record.profit || 0), 0);
      const averageProfit = (totalDeals > 0) ? (totalProfit / totalDeals).toFixed(2) : 0;
const bestDay = Object.entries(
  chartDataRaw.reduce((groups, record) => {
    // Convert "2025-08-08 19:36:12" → "2025-08-08"
    const date = record.chipId.split(" ")[0];
    const profit = parseFloat(record.profit || 0);

    // Add this record’s profit to that day’s total
    groups[date] = (groups[date] || 0) + profit;
    return groups;
  }, {})
).reduce(
  (min, [date, totalProfit]) =>
    totalProfit > min.profit
      ? { chipId: date, profit: totalProfit }
      : min,
  { chipId: null, profit: Infinity }
);


const worstDay = Object.entries(
  chartDataRaw.reduce((groups, record) => {
    // Convert "2025-08-08 19:36:12" → "2025-08-08"
    const date = record.chipId.split(" ")[0];
    const profit = parseFloat(record.profit || 0);

    // Add this record’s profit to that day’s total
    groups[date] = (groups[date] || 0) + profit;
    return groups;
  }, {})
).reduce(
  (min, [date, totalProfit]) =>
    totalProfit < min.profit
      ? { chipId: date, profit: totalProfit }
      : min,
  { chipId: null, profit: Infinity }
);



      const totalDealsp = document.getElementById('totalDeals');
      const totalProfitp = document.getElementById('totalProfit');
      const averageProfitp = document.getElementById('averageProfit');
      const bestDayp = document.getElementById('bestDay');
      const worstDayp = document.getElementById('worstDay');
      const maxProfitp = document.getElementById('maxProfit');
      const minProfitp = document.getElementById('minProfit');
      const maxProfit = chartDataRaw.length ? Math.max(...chartDataRaw.map(r => parseFloat(r.profit || 0))) : null;
      const minProfit = chartDataRaw.length ? Math.min(...chartDataRaw.map(r => parseFloat(r.profit || 0))) : null;

      totalDealsp.textContent = `You've done: ${totalDeals} deals`;
      totalProfitp.textContent = `Total profit: $${totalProfit.toFixed(2)}`;
      averageProfitp.textContent = `Average profit per deal: $${averageProfit}`;
      maxProfitp.textContent = maxProfit ? `Maximum profit: $${maxProfit.toFixed(2)}` : 'Maximum profit: N/A';
      minProfitp.textContent = minProfit ? `Minimum profit: $${minProfit.toFixed(2)}` : 'Minimum profit: N/A';
      bestDayp.textContent = bestDay.date ? `Best day: ${new Date(bestDay.date).toLocaleDateString()} ($${bestDay.profit.toFixed(2)})` : 'Best day: N/A';
      worstDayp.textContent = worstDay.date ? `Worst day: ${new Date(worstDay.date).toLocaleDateString()} ($${worstDay.profit.toFixed(2)})` : 'Worst day: N/A';

    chartDataBox.value = JSON.stringify(chartDataRaw, null, 2);
      exportButton.addEventListener('click', () => {
        chartDataBox.style.display = chartDataBox.style.display === 'none' ? 'block' : 'none'
      });
                  const statsDiv = document.getElementById('statsDiv');

            statsButton.addEventListener('click', () => {
        statsDiv.style.display = statsDiv.style.display === 'none' ? 'block' : 'none'
      });
      renderChart(chartDataRaw);
    }
  }
  
  getAllRequest.onerror = function () {
    console.error('Failed to retrieve transactions');
  }
}


function runningSum(arr) {
  const result = [];
  let total = 0;
  for (let num of arr) {
    total += num;
    result.push(total);
  }
  return result;
}

function runningSD(arr) {
  const result = [];
  let totalVariance = 0;
  for (let sd of arr) {
    totalVariance += sd**2;
    result.push(Math.sqrt(totalVariance));
  }
  return result;
}

function showContextMenu(x, y, pointInfo) {
    
  const menu = document.getElementById('chartMenu');

  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.style.display = 'block';

  menu.dataset.datasetIndex = pointInfo.datasetIndex;
  menu.dataset.index = pointInfo.columnIndex;
  menu.dataset.label = pointInfo.columnLabel;
  menu.dataset.value = pointInfo.value;
}

// Hide if clicking outside
document.addEventListener('click', function (event) {
  if (!event.target.closest('#chartMenu')) {
    document.getElementById('chartMenu').style.display = 'none';
  }
});


document.getElementById('deletePoint').addEventListener('click', function () {
  const menu = document.getElementById('chartMenu');
  const index = parseInt(menu.dataset.index);

  const record = chartDataRaw[index];
  if (!record) {
    console.error("Record not found for index", index);
    return;
  }

  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');

  store.delete(record._id);

  tx.oncomplete = () => {
    // Remove from local data array immediately
    chartDataRaw.splice(index, 1);

    // Re-render chart with updated data
    renderChart(chartDataRaw);

    // Hide the menu
    menu.style.display = 'none';
  };
});



const editForm = document.getElementById('editForm');
const inputProfit = document.getElementById('editProfit');
const inputMean = document.getElementById('editMean');
const inputSD = document.getElementById('editSD');

document.getElementById('editPoint').addEventListener('click', function () {
  const menu = document.getElementById('chartMenu');
  const index = parseInt(menu.dataset.index);

  const record = chartDataRaw[index];
  if (!record) {
    console.error("Record not found for index", index);
    return;
  }

  // Position the edit form near the menu
  editForm.style.left = menu.style.left;
  editForm.style.top = (parseInt(menu.style.top) + menu.offsetHeight) + 'px';
  editForm.style.display = 'block';

  // Hide the menu
  menu.style.display = 'none';

  // Fill inputs with current data
  inputProfit.value = record.profit || 0;
  inputMean.value = record.mean || 0;
  inputSD.value = record.sd || 0;

  // Store index in edit form dataset for save reference
  editForm.dataset.index = index;
});

// Save changes handler
document.getElementById('saveEdit').addEventListener('click', function () {
  const index = parseInt(editForm.dataset.index);
  const record = chartDataRaw[index];
  if (!record) {
    console.error("Record not found for index", index);
    return;
  }

  // Read inputs as strings
  const profitInput = inputProfit.value.trim();
  const meanInput = inputMean.value.trim();
  const sdInput = inputSD.value.trim();

  // Parse only if not empty, else keep original
  const newProfit = profitInput === "" ? record.profit : parseFloat(profitInput);
  const newMean = meanInput === "" ? record.mean : parseFloat(meanInput);
  const newSD = sdInput === "" ? record.sd : parseFloat(sdInput);

  // Validate sd is non-negative
  if (newSD < 0) {
    alert("Standard deviation (SD) cannot be negative.");
    return;
  }

  // Validate all numbers
  if (isNaN(newProfit) || isNaN(newMean) || isNaN(newSD)) {
    alert("Please enter valid numbers.");
    return;
  }

  // Update record locally
  record.profit = newProfit;
  record.mean = newMean;
  record.sd = newSD;

  // Save to IndexedDB
  const tx = db.transaction('transactions', 'readwrite');
  const store = tx.objectStore('transactions');
  store.put(record, record._id);

  tx.oncomplete = () => {
    renderChart(chartDataRaw);
    editForm.style.display = 'none';
  };

  tx.onerror = (event) => {
    console.error("Error saving edits:", event.target.error);
  };
});


// Cancel button hides form without saving
document.getElementById('cancelEdit').addEventListener('click', function () {
  editForm.style.display = 'none';
});
