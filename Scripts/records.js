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
    data.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Extract labels (just day)
    const labels = data.map(d => {
        const dt = new Date(d.time);
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
    const canvas = document.getElementById('recordChart');
    canvas.style.display = 'block';

    if (window.recordChartInstance) {
        window.recordChartInstance.data.labels = labels;
        window.recordChartInstance.data.datasets[0].data = realProfit;
        window.recordChartInstance.data.datasets[1].data = summedMean;
        window.recordChartInstance.data.datasets[2].data = meanPlusSD;
        window.recordChartInstance.data.datasets[3].data = meanMinusSD;
        window.recordChartInstance.data.datasets[4].data = meanPlus2SD;
        window.recordChartInstance.data.datasets[5].data = meanMinus2SD;
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
}



function showChart() {
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const request = store.getAll();

    request.onsuccess = function () {
        console.log('All transactions:', request.result);
        renderChart(request.result);  // <-- render the chart here
    };

    request.onerror = function () {
        console.error('Failed to retrieve transactions');
    };
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