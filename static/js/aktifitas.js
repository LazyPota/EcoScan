// aktifitas.js - Activity page functionality

// Load storage utilities
const script = document.createElement('script');
script.src = '/static/js/storage.js';
document.head.appendChild(script);

let currentFilter = 'all';

// Wait for storage to load
setTimeout(initActivity, 100);

function initActivity() {
    if (typeof getStats !== 'function') {
        setTimeout(initActivity, 100);
        return;
    }
    
    loadStatsSummary();
    loadActivityTimeline();
    loadCategoryStatistics();
    checkAchievements();
    setupFilterButtons();
}

function loadStatsSummary() {
    const stats = getStats();
    
    document.getElementById('weeklyScans').textContent = stats.weeklyScans;
    document.getElementById('weeklyPoints').textContent = stats.weeklyPoints;
}

function loadActivityTimeline(filter = 'all') {
    const scans = getScansByFilter(filter);
    const timeline = document.getElementById('activityTimeline');
    
    if (scans.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada riwayat scan. Mulai scan sampah pertamamu!</p>
            </div>
        `;
        return;
    }
    
    timeline.innerHTML = '';
    
    scans.forEach(scan => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        const color = getCategoryColor(scan.label);
        const displayName = getLabelDisplayName(scan.label);
        
        item.innerHTML = `
            <div class="timeline-marker" style="background: ${color};"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div class="timeline-title">${displayName}</div>
                    <div class="timeline-points">+${scan.points} poin</div>
                </div>
                <div class="timeline-category">${scan.category}</div>
                <div class="timeline-time">
                    <i class="fas fa-clock"></i> ${formatDate(scan.timestamp)}
                </div>
                <div class="timeline-confidence">
                    <i class="fas fa-chart-line"></i> Akurasi: ${Math.round(scan.confidence)}%
                </div>
            </div>
        `;
        timeline.appendChild(item);
    });
}

function loadCategoryStatistics() {
    const categoryStats = getCategoryStats();
    const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    
    const categories = ['plastic', 'paper', 'metal', 'cardboard', 'glass', 'trash'];
    
    categories.forEach(category => {
        const count = categoryStats[category] || 0;
        const percentage = total > 0 ? (count / total * 100) : 0;
        
        const fillElement = document.querySelector(`[data-category="${category}"]`);
        const valueElement = fillElement?.parentElement.nextElementSibling;
        
        if (fillElement) {
            fillElement.style.width = percentage + '%';
        }
        if (valueElement) {
            valueElement.textContent = count;
        }
    });
}

function checkAchievements() {
    const stats = getStats();
    const scans = getScans();
    
    // First scan achievement
    if (scans.length >= 1) {
        unlockAchievement('first-scan');
    }
    
    // 10 scans achievement
    if (scans.length >= 10) {
        unlockAchievement('ten-scans');
    }
    
    // 100 points achievement
    if (stats.totalPoints >= 100) {
        unlockAchievement('hundred-points');
    }
    
    // 50 scans achievement
    if (scans.length >= 50) {
        unlockAchievement('eco-warrior');
    }
}

function unlockAchievement(achievementId) {
    const achievement = document.querySelector(`[data-achievement="${achievementId}"]`);
    if (achievement) {
        achievement.classList.remove('locked');
        achievement.classList.add('unlocked');
    }
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            
            // Reload timeline with filter
            loadActivityTimeline(filter);
        });
    });
}

// Refresh data every 5 seconds if page is visible
setInterval(() => {
    if (!document.hidden) {
        loadStatsSummary();
        loadActivityTimeline(currentFilter);
        loadCategoryStatistics();
        checkAchievements();
    }
}, 5000);

console.log('Aktifitas page initialized');
