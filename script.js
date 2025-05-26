// Penguin data with randomized statistics
const penguinTypes = [
    { id: 1, name: "Emperor", minWeight: 22, maxWeight: 45, minBeak: 8, maxBeak: 12 },
    { id: 2, name: "King", minWeight: 11, maxWeight: 16, minBeak: 5, maxBeak: 7 },
    { id: 3, name: "Adelie", minWeight: 3.5, maxWeight: 5.5, minBeak: 3, maxBeak: 4.5 },
    { id: 4, name: "Gentoo", minWeight: 5, maxWeight: 8, minBeak: 4, maxBeak: 5.5 },
    { id: 5, name: "Rockhopper", minWeight: 2, maxWeight: 3.5, minBeak: 2, maxBeak: 3 }
];

// Chart instance
let statsChart = null;

// Measurement data
let measurements = [];
let selectedPenguin = null;

// DOM elements
const penguinsContainer = document.getElementById('penguins-container');
const dataTableBody = document.getElementById('data-table-body');
const measureBtn = document.getElementById('measure-btn');
const generateGraphBtn = document.getElementById('generate-graph-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const measurementCount = document.getElementById('measurement-count');
const averageWeight = document.getElementById('average-weight');
const averageBeak = document.getElementById('average-beak');

// Create penguins on the island
function createPenguins() {
    // Define positions for penguins on the island
    const positions = [
        { left: '10%', top: '60%' },
        { left: '30%', top: '70%' },
        { left: '50%', top: '65%' },
        { left: '70%', top: '75%' },
        { left: '85%', top: '60%' }
    ];

    penguinTypes.forEach((penguin, index) => {
        const penguinElement = document.createElement('div');
        penguinElement.className = 'penguin';
        penguinElement.dataset.id = penguin.id;
        penguinElement.dataset.name = penguin.name;
        penguinElement.style.left = positions[index].left;
        penguinElement.style.top = positions[index].top;
        
        // Create penguin appearance
        penguinElement.innerHTML = `
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <ellipse cx="50" cy="70" rx="25" ry="30" fill="black" />
                <ellipse cx="50" cy="45" rx="20" ry="25" fill="white" />
                <circle cx="50" cy="30" r="15" fill="black" />
                <ellipse cx="50" cy="40" rx="12" ry="8" fill="white" />
                <ellipse cx="45" cy="25" rx="3" ry="3" fill="white" />
                <ellipse cx="55" cy="25" rx="3" ry="3" fill="white" />
                <polygon points="45,35 55,35 50,45" fill="orange" />
                <rect x="38" y="85" width="10" height="5" fill="orange" />
                <rect x="52" y="85" width="10" height="5" fill="orange" />
            </svg>`;
        
        penguinElement.addEventListener('click', () => selectPenguin(penguinElement));
        penguinsContainer.appendChild(penguinElement);
    });
}

// Select a penguin
function selectPenguin(penguinElement) {
    // Deselect any previously selected penguin
    const previousSelection = document.querySelector('.penguin.selected');
    if (previousSelection) {
        previousSelection.classList.remove('selected');
    }
    
    // Select the clicked penguin
    penguinElement.classList.add('selected');
    selectedPenguin = {
        id: penguinElement.dataset.id,
        name: penguinElement.dataset.name
    };
}

// Measure the selected penguin
function measurePenguin() {
    if (!selectedPenguin) {
        alert('Please select a penguin first!');
        return;
    }
    
    const penguinType = penguinTypes.find(p => p.id == selectedPenguin.id);
    
    // Generate random measurements within the range for this penguin type
    const weight = randomBetween(penguinType.minWeight, penguinType.maxWeight).toFixed(1);
    const beakLength = randomBetween(penguinType.minBeak, penguinType.maxBeak).toFixed(1);
    
    // Add to measurements array
    const measurement = {
        id: measurements.length + 1,
        name: penguinType.name,
        weight: parseFloat(weight),
        beakLength: parseFloat(beakLength)
    };
    
    measurements.push(measurement);
    
    // Update the table
    addMeasurementToTable(measurement);
    
    // Update stats
    updateStats();
    
    // Deselect the penguin
    const selectedElement = document.querySelector('.penguin.selected');
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedPenguin = null;
}

// Add a measurement to the data table
function addMeasurementToTable(measurement) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${measurement.name}</td>
        <td>${measurement.weight} kg</td>
        <td>${measurement.beakLength} cm</td>
    `;
    dataTableBody.appendChild(row);
}

// Update statistics
function updateStats() {
    measurementCount.textContent = measurements.length;
    
    if (measurements.length > 0) {
        const totalWeight = measurements.reduce((sum, m) => sum + m.weight, 0);
        const totalBeakLength = measurements.reduce((sum, m) => sum + m.beakLength, 0);
        
        averageWeight.textContent = (totalWeight / measurements.length).toFixed(1);
        averageBeak.textContent = (totalBeakLength / measurements.length).toFixed(1);
    }
}

// Generate graph based on current active tab
function generateGraph() {
    if (measurements.length < 3) {
        alert('Please collect at least 3 measurements to generate meaningful graphs.');
        return;
    }
    
    const activeTab = document.querySelector('.tab-btn.active');
    const graphType = activeTab.dataset.graph;
    
    switch(graphType) {
        case 'weight':
            generateWeightGraph();
            break;
        case 'beak':
            generateBeakGraph();
            break;
        case 'correlation':
            generateCorrelationGraph();
            break;
    }
}

// Generate weight distribution graph
function generateWeightGraph() {
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Group measurements by penguin type
    const penguinTypes = [...new Set(measurements.map(m => m.name))];
    const dataByType = penguinTypes.map(type => {
        const typeData = measurements.filter(m => m.name === type);
        return {
            type: type,
            weights: typeData.map(m => m.weight),
            avgWeight: typeData.reduce((sum, m) => sum + m.weight, 0) / typeData.length
        };
    });
    
    // Create data for the chart
    const data = {
        labels: dataByType.map(d => d.type),
        datasets: [{
            label: 'Average Weight (kg)',
            data: dataByType.map(d => d.avgWeight),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };
    
    // Destroy previous chart if it exists
    if (statsChart) {
        statsChart.destroy();
    }
    
    // Create new chart
    statsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Penguin Type'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Weight by Penguin Type'
                }
            }
        }
    });
}

// Generate beak length distribution graph
function generateBeakGraph() {
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Group measurements by penguin type
    const penguinTypes = [...new Set(measurements.map(m => m.name))];
    const dataByType = penguinTypes.map(type => {
        const typeData = measurements.filter(m => m.name === type);
        return {
            type: type,
            avgBeakLength: typeData.reduce((sum, m) => sum + m.beakLength, 0) / typeData.length
        };
    });
    
    // Create data for the chart
    const data = {
        labels: dataByType.map(d => d.type),
        datasets: [{
            label: 'Average Beak Length (cm)',
            data: dataByType.map(d => d.avgBeakLength),
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
        }]
    };
    
    // Destroy previous chart if it exists
    if (statsChart) {
        statsChart.destroy();
    }
    
    // Create new chart
    statsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Beak Length (cm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Penguin Type'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Average Beak Length by Penguin Type'
                }
            }
        }
    });
}

// Generate correlation graph
function generateCorrelationGraph() {
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Create datasets for each penguin type
    const penguinTypes = [...new Set(measurements.map(m => m.name))];
    const datasets = penguinTypes.map((type, index) => {
        const typeData = measurements.filter(m => m.name === type);
        const colors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];
        
        return {
            label: type,
            data: typeData.map(m => ({
                x: m.weight,
                y: m.beakLength
            })),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.7', '1'),
            borderWidth: 1
        };
    });
    
    // Destroy previous chart if it exists
    if (statsChart) {
        statsChart.destroy();
    }
    
    // Create new chart
    statsChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Beak Length (cm)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Correlation between Weight and Beak Length'
                }
            }
        }
    });
}

// Helper function for random numbers
function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (measurements.length >= 3) {
            generateGraph();
        }
    });
});

// Event listeners
measureBtn.addEventListener('click', measurePenguin);
generateGraphBtn.addEventListener('click', generateGraph);

// Initialize the game
createPenguins();

