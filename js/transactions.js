let allTransactions = [];
let filteredTransactions = [];

// Fetch transactions from JSON file
async function fetchTransactions() {
    try {
        const response = await fetch('data/transactions.json');
        allTransactions = (await response.json()).transactions;
        
        // Sort by date (newest first)
        allTransactions.sort((a, b) => {
            return new Date(b.transactionDate) - new Date(a.transactionDate);
        });
        
        filterAndRenderTransactions();
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noResults').textContent = 'Error loading transaction data. Please ensure transactions.json is in the data directory.';
    }
}

// Filter transactions based on checkboxes and search input
function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const proPlanChecked = document.getElementById('proPlan').checked;
    const maxPlanChecked = document.getElementById('maxPlan').checked;
    const statusSuccessChecked = document.getElementById('statusSuccess').checked;
    const statusPendingChecked = document.getElementById('statusPending').checked;

    filteredTransactions = allTransactions.filter(transaction => {
        // Filter by plan
        const planMatch = 
            (proPlanChecked && transaction.plan === 'Pro Plan') ||
            (maxPlanChecked && transaction.plan === 'Max Plan');

        if (!planMatch) return false;

        // Filter by status
        const statusMatch = 
            (statusSuccessChecked && transaction.status === 'Success') ||
            (statusPendingChecked && transaction.status === 'Pending');

        if (!statusMatch) return false;

        // Filter by search term (user name only)
        if (searchTerm) {
            const nameMatch = transaction.userName.toLowerCase().includes(searchTerm);
            return nameMatch;
        }

        return true;
    });
}

// Render transactions in the table
function renderTransactions() {
    const tbody = document.getElementById('transactionTableBody');
    const noResults = document.getElementById('noResults');

    if (filteredTransactions.length === 0) {
        tbody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    tbody.innerHTML = filteredTransactions.map(transaction => `
        <tr onclick="viewTransaction(${transaction.id})">
            <td><code style="font-size: 12px; color: #5b21b6;">${transaction.transactionCode}</code></td>
            <td>${transaction.userName}</td>
            <td><span class="plan-badge plan-${transaction.plan.toLowerCase().replace(' ', '-')}">${transaction.plan}</span></td>
            <td class="amount">${formatMoney(transaction.amount)} VND</td>
            <td><span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
            <td>${formatDate(transaction.transactionDate)}</td>
        </tr>
    `).join('');

    updateStats();
}

// Update statistics
function updateStats() {
    // Total counts from all transactions
    const totalTransactions = allTransactions.length;
    const successCount = allTransactions.filter(t => t.status === 'Success').length;
    const pendingCount = allTransactions.filter(t => t.status === 'Pending').length;
    
    // Total money (only from successful transactions)
    const totalMoney = allTransactions
        .filter(t => t.status === 'Success')
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('totalCount').textContent = totalTransactions;
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('filteredCount').textContent = filteredTransactions.length;
    document.getElementById('totalMoney').textContent = formatMoney(totalMoney) + ' VND';
}

// Format money with thousand separators
function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
    });
}

// Filter and render transactions
function filterAndRenderTransactions() {
    filterTransactions();
    renderTransactions();
}

// View transaction details
function viewTransaction(transactionId) {
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Transaction Information</div>
            <div class="detail-row">
                <div class="detail-label">Transaction Code:</div>
                <div class="detail-value">
                    <div class="transaction-code-display">${transaction.transactionCode}</div>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Transaction ID:</div>
                <div class="detail-value">#${transaction.id}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${formatDate(transaction.transactionDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Customer Information</div>
            <div class="detail-row">
                <div class="detail-label">User ID:</div>
                <div class="detail-value">${transaction.userId}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${transaction.userName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${transaction.userEmail}</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Payment Information</div>
            <div class="detail-row">
                <div class="detail-label">Plan:</div>
                <div class="detail-value">
                    <span class="plan-badge plan-${transaction.plan.toLowerCase().replace(' ', '-')}">${transaction.plan}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Amount:</div>
                <div class="detail-value" style="font-size: 18px; font-weight: 700; color: #059669;">
                    ${formatMoney(transaction.amount)} VND
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Payment Method:</div>
                <div class="detail-value">${transaction.paymentMethod}</div>
            </div>
        </div>
    `;

    document.getElementById('transactionModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    document.getElementById('transactionModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Event listeners
    document.getElementById('proPlan').addEventListener('change', filterAndRenderTransactions);
    document.getElementById('maxPlan').addEventListener('change', filterAndRenderTransactions);
    document.getElementById('statusSuccess').addEventListener('change', filterAndRenderTransactions);
    document.getElementById('statusPending').addEventListener('change', filterAndRenderTransactions);
    document.getElementById('searchInput').addEventListener('input', filterAndRenderTransactions);

    // Fetch transactions
    fetchTransactions();
});
