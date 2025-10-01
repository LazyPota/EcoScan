// beranda.js - Dashboard page functionality

// Load storage utilities
const script = document.createElement('script');
script.src = '/static/js/storage.js';
document.head.appendChild(script);

// Wait for storage to load
setTimeout(initDashboard, 100);

function initDashboard() {
    if (typeof getStats !== 'function') {
        setTimeout(initDashboard, 100);
        return;
    }
    
    loadStatistics();
    loadCategoryBreakdown();
    loadRecentActivity();
}

function loadStatistics() {
    const stats = getStats();
    
    // Update stat values
    document.getElementById('totalScans').textContent = stats.totalScans;
    document.getElementById('totalPoints').textContent = stats.totalPoints;
    document.getElementById('co2Saved').textContent = stats.co2Saved;
    document.getElementById('recycledItems').textContent = stats.recycledItems;
}

function loadCategoryBreakdown() {
    const categoryStats = getCategoryStats();
    const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return;
    
    // Update category bars
    const categories = [
        { name: 'Plastik', key: 'plastic', color: '#3B82F6' },
        { name: 'Kertas', key: 'paper', color: '#10B981' },
        { name: 'Logam', key: 'metal', color: '#6B7280' },
        { name: 'Kardus', key: 'cardboard', color: '#F59E0B' },
        { name: 'Kaca', key: 'glass', color: '#06B6D4' }
    ];
    
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    categories.forEach(cat => {
        const count = categoryStats[cat.key] || 0;
        const percentage = total > 0 ? (count / total * 100) : 0;
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-bar">
                <div class="category-label">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-count">${count}</span>
                </div>
                <div class="category-progress">
                    <div class="category-fill" style="width: ${percentage}%; background: ${cat.color};"></div>
                </div>
            </div>
        `;
        categoryList.appendChild(item);
    });
}

function loadRecentActivity() {
    const scans = getScans();
    const recentScans = scans.slice(0, 5); // Get last 5 scans
    
    const activityList = document.getElementById('recentActivityList');
    
    if (recentScans.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada aktivitas. Mulai scan sampah pertamamu!</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = '';
    
    recentScans.forEach(scan => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        const color = getCategoryColor(scan.label);
        const displayName = getLabelDisplayName(scan.label);
        
        item.innerHTML = `
            <div class="activity-icon" style="background: ${color};">
                <i class="fas fa-recycle"></i>
            </div>
            <div class="activity-info">
                <div class="activity-title">${displayName}</div>
                <div class="activity-time">${formatDate(scan.timestamp)}</div>
            </div>
            <div class="activity-points">+${scan.points}</div>
        `;
        activityList.appendChild(item);
    });
}

// Refresh data every 5 seconds if page is visible
setInterval(() => {
    if (!document.hidden) {
        loadStatistics();
        loadCategoryBreakdown();
        loadRecentActivity();
    }
}, 5000);

console.log('Beranda page initialized');
