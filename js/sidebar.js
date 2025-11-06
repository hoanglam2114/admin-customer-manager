// Shared Sidebar Component
function createSidebar(currentPage) {
    const sidebarHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">EduScan Pro</div>
                <div class="sidebar-subtitle">Admin Dashboard</div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section-title">Main</div>
                <a href="index.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Dashboard</span>
                </a>
                
                <div class="nav-section-title">Management</div>
                <a href="customers.html" class="nav-item ${currentPage === 'customers' ? 'active' : ''}">
                    <span class="nav-icon">👥</span>
                    <span class="nav-text">Customers</span>
                </a>
                <a href="transactions.html" class="nav-item ${currentPage === 'transactions' ? 'active' : ''}">
                    <span class="nav-icon">💳</span>
                    <span class="nav-text">Transactions</span>
                </a>
                <a href="payment.html" class="nav-item ${currentPage === 'payment' ? 'active' : ''}">
                    <span class="nav-icon">💰</span>
                    <span class="nav-text">Payment</span>
                </a>
                
                <div class="nav-section-title">Analytics</div>
                <a href="analytics.html" class="nav-item ${currentPage === 'analytics' ? 'active' : ''}">
                    <span class="nav-icon">📈</span>
                    <span class="nav-text">Visit Analytics</span>
                </a>
                
                <div class="nav-section-title">Settings</div>
                <a href="#" class="nav-item">
                    <span class="nav-icon">⚙️</span>
                    <span class="nav-text">Settings</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">🔔</span>
                    <span class="nav-text">Notifications</span>
                </a>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">AD</div>
                    <div class="user-details">
                        <div class="user-name">Admin User</div>
                        <div class="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return sidebarHTML;
}

// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const currentPage = body.getAttribute('data-page');
    
    // Create layout structure
    const layoutDiv = document.createElement('div');
    layoutDiv.className = 'dashboard-layout';
    layoutDiv.innerHTML = createSidebar(currentPage);
    
    // Move existing content to main-content
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    
    while (body.firstChild) {
        mainContent.appendChild(body.firstChild);
    }
    
    layoutDiv.appendChild(mainContent);
    body.appendChild(layoutDiv);
});
