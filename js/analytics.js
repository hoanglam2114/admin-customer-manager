let chart = null;

// Load analytics data
async function loadAnalytics() {
    try {
        const response = await fetch('data/visitors.json');
        const data = await response.json();
        const visitors = data.visitors;

        // Process data by day
        const dailyData = processDailyData(visitors);

        // Update statistics
        updateStatistics(visitors, dailyData);

        // Create chart
        createChart(dailyData);

    } catch (error) {
        console.error('Error loading analytics:', error);
        document.querySelector('.chart-wrapper').innerHTML = '<div class="loading">Error loading analytics data. Please ensure visitors.json is in the data directory.</div>';
    }
}

// Process visitors into daily data
function processDailyData(visitors) {
    // Group visitors by day
    const dayMap = new Map();

    visitors.forEach(visitor => {
        const date = new Date(visitor.registrationDate);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, {
                date: new Date(dayKey),
                count: 0,
                label: formatDayLabel(new Date(dayKey))
            });
        }

        dayMap.get(dayKey).count++;
    });

    // Convert to array and sort by date
    const dailyData = Array.from(dayMap.values())
        .sort((a, b) => a.date - b.date);

    return dailyData;
}

// Format day label
function formatDayLabel(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Update statistics cards
function updateStatistics(visitors, dailyData) {
    // Total visits
    const totalVisits = visitors.length;
    document.getElementById('totalVisits').textContent = totalVisits;

    // Average per day
    const avgPerDay = dailyData.length > 0
        ? Math.round(totalVisits / dailyData.length)
        : 0;
    document.getElementById('avgPerDay').textContent = avgPerDay;
    document.getElementById('avgTrend').textContent = `Across ${dailyData.length} days`;

    // Growth trend (comparing last 7 days vs previous 7 days)
    if (dailyData.length >= 14) {
        const recentDays = dailyData.slice(-7);
        const previousDays = dailyData.slice(-14, -7);

        const recentTotal = recentDays.reduce((sum, day) => sum + day.count, 0);
        const previousTotal = previousDays.reduce((sum, day) => sum + day.count, 0);

        const growthPercent = previousTotal > 0
            ? Math.round(((recentTotal - previousTotal) / previousTotal) * 100)
            : 0;

        document.getElementById('growthRate').textContent =
            (growthPercent > 0 ? '+' : '') + growthPercent + '%';

        const trendElement = document.getElementById('growthTrendText');
        if (growthPercent > 0) {
            trendElement.className = 'stat-trend trend-positive';
            trendElement.innerHTML = '<span class="trend-icon">↑</span><span>Growing compared to previous period</span>';
        } else if (growthPercent < 0) {
            trendElement.className = 'stat-trend trend-negative';
            trendElement.innerHTML = '<span class="trend-icon">↓</span><span>Declining compared to previous period</span>';
        } else {
            trendElement.className = 'stat-trend trend-neutral';
            trendElement.innerHTML = '<span class="trend-icon">→</span><span>Stable compared to previous period</span>';
        }
    } else {
        document.getElementById('growthRate').textContent = 'N/A';
        const trendElement = document.getElementById('growthTrendText');
        trendElement.className = 'stat-trend trend-neutral';
        trendElement.innerHTML = '<span class="trend-icon">●</span><span>Not enough data for comparison</span>';
    }

    // Peak day
    const peakDay = dailyData.reduce((max, day) =>
        day.count > max.count ? day : max, dailyData[0] || { count: 0 });

    document.getElementById('peakDay').textContent = peakDay.count;
    document.getElementById('peakDayDate').textContent = `on ${peakDay.label}`;
}

// Create the line chart
function createChart(dailyData) {
    const ctx = document.getElementById('visitsChart').getContext('2d');

    // Prepare data
    const labels = dailyData.map(day => day.label);
    const data = dailyData.map(day => day.count);

    // Destroy existing chart if any
    if (chart) {
        chart.destroy();
    }

    // Create new chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visits per Day',
                data: data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#7c3aed',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(76, 29, 149, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return 'Visits: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#6d28d9',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Number of Visits',
                        color: '#4c1d95',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#6d28d9',
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#4c1d95',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAnalytics();
});
