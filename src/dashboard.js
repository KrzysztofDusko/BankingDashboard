async function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        
        const container = document.getElementById('dashboard-container');
        container.innerHTML = `
            <div class="grid-box mortgage-box">
                <i class="fas fa-home box-icon"></i>
                <h2>Mortgage</h2>
                <div class="mortgage-balance">${data.mortgage.balance.toLocaleString()} PLN</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${data.mortgage.paidPercentage}%"></div>
                </div>
                <p>Paid: ${data.mortgage.paidPercentage}%</p>
                <p>Recent payments:</p>
                <ul class="payment-list">
                    ${data.mortgage.recentPayments.map(payment => `
                        <li>
                            <span>Payment ${payment.number}</span>
                            <span class="payment-amount">-${payment.amount} PLN</span>
                            <span class="payment-date">${payment.date}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="grid-box">
                <i class="fas fa-wallet box-icon"></i>
                <h2>Current Balance</h2>
                <div class="stat-value">${data.currentBalance.amount.toLocaleString()} PLN</div>
                <p>+${data.currentBalance.change}% since last month</p>
                <div class="chart-wrapper balance-chart">
                    <canvas id="balanceChart"></canvas>
                </div>
            </div>

            <div class="grid-box">
                <i class="fas fa-chart-line box-icon"></i>
                <h2>Investments</h2>
                <div class="stat-value">${data.investments.amount.toLocaleString()} PLN</div>
                <p>Profit: +${data.investments.profit}%</p>
                <div class="chart-wrapper">
                    <canvas id="investmentsChart"></canvas>
                </div>
            </div>
            
            <div class="grid-box">
                <i class="fas fa-credit-card box-icon"></i>
                <h2>Credit Cards</h2>
                <div class="stat-value">${data.creditCards.active} active</div>
                <p>Limit: ${data.creditCards.limit.toLocaleString()} PLN</p>
                <div class="chart-wrapper credit-card-chart">
                    <canvas id="creditCardChart"></canvas>
                </div>
            </div>

            <div class="grid-box">
                <i class="fas fa-piggy-bank box-icon"></i>
                <h2>Savings</h2>
                <div class="stat-value">${data.savings.current.toLocaleString()} PLN</div>
                <p>Goal: ${data.savings.goal.toLocaleString()} PLN</p>
                <div class="progress-bar savings-progress">
                    <div class="progress-fill" style="width: ${(data.savings.current / data.savings.goal * 100)}%"></div>
                </div>
                <p class="progress-text">${Math.round(data.savings.current / data.savings.goal * 100)}% of goal</p>
            </div>

            <div class="grid-box" id="transactions-box">
                <i class="fas fa-money-bill-wave box-icon"></i>
                <h2>Recent Transactions</h2>
                <div class="stat-value">${data.transactions.count}</div>
                <p>${data.transactions.period}</p>
                <div class="transactions-preview">
                    ${data.transactions.history.slice(0, 2).map(transaction => `
                        <div class="preview-transaction">
                            <i class="fas ${
                                transaction.amount > 0 ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'
                            }"></i>
                            <span class="preview-title">${transaction.title}</span>
                            <span class="preview-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                                ${transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} PLN
                            </span>
                        </div>
                    `).join('')}
                    <div class="preview-more">Click to see more</div>
                </div>
            </div>

            <div class="grid-box">
                <i class="fas fa-shield-alt box-icon"></i>
                <h2>Insurance</h2>
                <div class="stat-value">${data.insurance.active} active</div>
                <p>Next payment: ${data.insurance.nextPayment}</p>
            </div>

            <div class="grid-box" id="notifications-box">
                <i class="fas fa-bell box-icon"></i>
                <h2>Notifications</h2>
                <div class="stat-value">${data.notifications.count} new</div>
                <p>Last: ${data.notifications.lastUpdate}</p>
            </div>

            <div class="grid-box">
                <i class="fas fa-tasks box-icon"></i>
                <h2>Tasks</h2>
                <div class="stat-value">${data.tasks.pending} pending</div>
                <p>${data.tasks.status}</p>
            </div>
        `;

        // Add top notifications
        const topNotifications = document.getElementById('topNotifications');
        const recentNotifications = data.notifications.messages.slice(0, 3);
        
        topNotifications.innerHTML = recentNotifications.map(notification => `
            <div class="top-notification">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
                <div class="top-notification-content">
                    <div class="top-notification-title">${notification.title}</div>
                    <div class="top-notification-message">${notification.message}</div>
                </div>
            </div>
        `).join('');

        // Remove notifications after animation
        setTimeout(() => {
            topNotifications.innerHTML = '';
        }, 5000);

        // Add click handlers
        document.getElementById('notifications-box').addEventListener('click', () => {
            showNotificationsModal(data.notifications.messages);
        });

        document.getElementById('transactions-box').addEventListener('click', () => {
            showTransactionsModal(data.transactions.history);
        });

        // Create pie chart for balance
        new Chart(document.getElementById('balanceChart'), {
            type: 'pie',
            data: {
                labels: data.currentBalance.pieChart.labels,
                datasets: [{
                    data: data.currentBalance.pieChart.data,
                    backgroundColor: ['#00843d', '#3cb878', '#7dcfa7']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 9 },
                            boxWidth: 10,
                            padding: 5
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });

        // Create line chart for investments
        new Chart(document.getElementById('investmentsChart'), {
            type: 'line',
            data: {
                labels: data.investments.lineChart.labels,
                datasets: [{
                    label: 'Investment Value',
                    data: data.investments.lineChart.data,
                    borderColor: '#00843d',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: (value) => value.toLocaleString() + ' PLN'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    },
                    point: {
                        borderWidth: 0,
                        radius: 3
                    }
                }
            }
        });

        // Create credit card usage chart
        new Chart(document.getElementById('creditCardChart'), {
            type: 'bar',
            data: {
                labels: ['Credit Limit Usage'],
                datasets: [{
                    label: 'Available',
                    data: [data.creditCards.limit],
                    backgroundColor: '#e2e8f0'
                },
                {
                    label: 'Used',
                    data: [data.creditCards.limit * 0.4], // Example usage - you might want to add this to your data.json
                    backgroundColor: '#00843d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: (value) => value.toLocaleString() + ' PLN'
                        }
                    },
                    y: {
                        stacked: true,
                        display: false
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 0
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        window.location.href = 'login.html';
    }
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'danger': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function getTransactionIcon(type) {
    switch(type.toLowerCase()) {
        case 'deposit': return 'fa-arrow-down';
        case 'withdrawal': return 'fa-arrow-up';
        case 'transfer': return 'fa-exchange-alt';
        case 'payment': return 'fa-credit-card';
        default: return 'fa-circle';
    }
}

function createTransactionHTML(transaction) {
    return `
        <div class="transaction-item">
            <div class="transaction-icon">
                <i class="fas ${getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.description}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)} zł
            </div>
        </div>
    `;
}

function showNotificationsModal(notifications) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <i class="fas fa-times modal-close"></i>
            <h2>Notifications</h2>
            ${notifications.map(notification => `
                <div class="notification-item notification-${notification.type}">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            `).join('')}
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}

function showTransactionsModal(transactions) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <i class="fas fa-times modal-close"></i>
            <h2>Recent Transactions</h2>
            ${transactions.map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-title">${transaction.title}</div>
                        <div class="transaction-date">${transaction.date}</div>
                    </div>
                    <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                        ${transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} PLN
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close') || e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }
});
