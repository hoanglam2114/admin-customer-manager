let allUsers = [];
let filteredUsers = [];
let currentSort = { column: null, direction: 'asc' };

// Fetch users from JSON file
async function fetchUsers() {
    try {
        const response = await fetch('data/users.json');
        allUsers = (await response.json()).users;
        filterAndRenderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noResults').textContent = 'Error loading user data. Please ensure users.json is in the data directory.';
    }
}

// Filter users based on checkboxes and search input
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const freePlanChecked = document.getElementById('freePlan').checked;
    const proPlanChecked = document.getElementById('proPlan').checked;
    const maxPlanChecked = document.getElementById('maxPlan').checked;

    filteredUsers = allUsers.filter(user => {
        // Filter by plan
        const planMatch =
            (freePlanChecked && user.plan === 'Free Plan') ||
            (proPlanChecked && user.plan === 'Pro Plan') ||
            (maxPlanChecked && user.plan === 'Max Plan');

        if (!planMatch) return false;

        // Filter by search term
        if (searchTerm) {
            const nameMatch = user.name.toLowerCase().includes(searchTerm);
            const emailMatch = user.email.toLowerCase().includes(searchTerm);
            return nameMatch || emailMatch;
        }

        return true;
    });

    // Apply current sort if any
    if (currentSort.column) {
        sortUsers(currentSort.column, false);
    }
}

// Sort users by column
function sortUsers(column, toggleDirection = true) {
    if (toggleDirection) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
    }

    filteredUsers.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        // Handle numbers
        if (column === 'id') {
            valueA = parseInt(valueA);
            valueB = parseInt(valueB);
        }

        // Handle dates
        if (column === 'registrationDate') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        // Handle strings
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    updateSortIndicators();
}

// Update sort indicators in table headers
function updateSortIndicators() {
    document.querySelectorAll('thead th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.column === currentSort.column) {
            th.classList.add(`sort-${currentSort.direction}`);
        }
    });
}

// Render users in the table
function renderUsers() {
    const tbody = document.getElementById('userTableBody');
    const noResults = document.getElementById('noResults');

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="plan-badge plan-${user.plan.toLowerCase().replace(' ', '-')}">${user.plan}</span></td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
            <td>${formatDate(user.registrationDate)}</td>
            <td>
                <div class="actions">
                    <button class="btn-view" onclick="viewUser(${user.id})">View</button>
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalCount').textContent = allUsers.length;
    document.getElementById('freeCount').textContent = allUsers.filter(u => u.plan === 'Free Plan').length;
    document.getElementById('proCount').textContent = allUsers.filter(u => u.plan === 'Pro Plan').length;
    document.getElementById('maxCount').textContent = allUsers.filter(u => u.plan === 'Max Plan').length;
    document.getElementById('filteredCount').textContent = filteredUsers.length;
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Filter and render users
function filterAndRenderUsers() {
    filterUsers();
    renderUsers();
}

// View user details
function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">ID:</div>
            <div class="detail-value">${user.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${user.name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${user.email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Plan:</div>
            <div class="detail-value"><span class="plan-badge plan-${user.plan.toLowerCase().replace(' ', '-')}">${user.plan}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Registration Date:</div>
            <div class="detail-value">${formatDate(user.registrationDate)}</div>
        </div>
    `;

    document.getElementById('userModal').classList.add('active');
}

// Edit user (placeholder)
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    alert(`Edit functionality for ${user.name} (ID: ${userId})\n\nThis is a placeholder. You can implement edit functionality here.`);
}

// Delete user (placeholder)
function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
        alert(`Delete functionality for ${user.name} (ID: ${userId})\n\nThis is a placeholder. You can implement delete functionality here.`);
    }
}

// Close modal
function closeModal() {
    document.getElementById('userModal').classList.remove('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    document.getElementById('userModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Event listeners
    document.getElementById('freePlan').addEventListener('change', filterAndRenderUsers);
    document.getElementById('proPlan').addEventListener('change', filterAndRenderUsers);
    document.getElementById('maxPlan').addEventListener('change', filterAndRenderUsers);
    document.getElementById('searchInput').addEventListener('input', filterAndRenderUsers);

    // Add click handlers to table headers for sorting
    document.querySelectorAll('thead th[data-column]').forEach(th => {
        th.addEventListener('click', () => {
            sortUsers(th.dataset.column);
            renderUsers();
        });
    });

    // Fetch users
    fetchUsers();
});
