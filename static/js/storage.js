// storage.js - LocalStorage management for EcoScan

const STORAGE_KEYS = {
    SCANS: 'ecoscan_scans',
    POINTS: 'ecoscan_points',
    REDEMPTIONS: 'ecoscan_redemptions'
};

// Initialize storage if not exists
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.SCANS)) {
        localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POINTS)) {
        localStorage.setItem(STORAGE_KEYS.POINTS, '0');
    }
    if (!localStorage.getItem(STORAGE_KEYS.REDEMPTIONS)) {
        localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify([]));
    }
}

// Scan History Management
function addScan(scanData) {
    const scans = getScans();
    const scan = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        label: scanData.label,
        category: scanData.category,
        confidence: scanData.confidence,
        points: scanData.points,
        fact: scanData.fact
    };
    scans.unshift(scan); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.SCANS, JSON.stringify(scans));
    
    // Add points
    addPoints(scanData.points);
    
    return scan;
}

function getScans() {
    const scans = localStorage.getItem(STORAGE_KEYS.SCANS);
    return scans ? JSON.parse(scans) : [];
}

function getScansByFilter(filter) {
    const scans = getScans();
    const now = new Date();
    
    switch(filter) {
        case 'today':
            return scans.filter(scan => {
                const scanDate = new Date(scan.timestamp);
                return scanDate.toDateString() === now.toDateString();
            });
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return scans.filter(scan => new Date(scan.timestamp) >= weekAgo);
        case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return scans.filter(scan => new Date(scan.timestamp) >= monthAgo);
        default:
            return scans;
    }
}

function getCategoryStats() {
    const scans = getScans();
    const stats = {};
    
    scans.forEach(scan => {
        const label = scan.label;
        if (!stats[label]) {
            stats[label] = 0;
        }
        stats[label]++;
    });
    
    return stats;
}

// Points Management
function getPoints() {
    const points = localStorage.getItem(STORAGE_KEYS.POINTS);
    return parseInt(points) || 0;
}

function addPoints(amount) {
    const currentPoints = getPoints();
    const newPoints = currentPoints + amount;
    localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
    return newPoints;
}

function deductPoints(amount) {
    const currentPoints = getPoints();
    if (currentPoints >= amount) {
        const newPoints = currentPoints - amount;
        localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
        return newPoints;
    }
    return null; // Insufficient points
}

// Redemption Management
function addRedemption(rewardName, pointsCost) {
    const redemptions = getRedemptions();
    const redemption = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        reward: rewardName,
        points: pointsCost
    };
    redemptions.unshift(redemption);
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
    
    // Deduct points
    return deductPoints(pointsCost);
}

function getRedemptions() {
    const redemptions = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
    return redemptions ? JSON.parse(redemptions) : [];
}

// Statistics
function getStats() {
    const scans = getScans();
    const points = getPoints();
    const redemptions = getRedemptions();
    
    const totalScans = scans.length;
    const totalPoints = points;
    const totalRedeemed = redemptions.reduce((sum, r) => sum + r.points, 0);
    
    // Calculate CO2 saved (rough estimate: 0.5kg per scan)
    const co2Saved = (totalScans * 0.5).toFixed(1);
    
    // Count recyclable items (exclude 'trash')
    const recycledItems = scans.filter(s => s.label !== 'trash').length;
    
    // Weekly stats
    const weekScans = getScansByFilter('week');
    const weeklyPoints = weekScans.reduce((sum, s) => sum + s.points, 0);
    
    // Monthly points
    const monthScans = getScansByFilter('month');
    const monthlyPoints = monthScans.reduce((sum, s) => sum + s.points, 0);
    
    return {
        totalScans,
        totalPoints,
        totalRedeemed,
        co2Saved,
        recycledItems,
        weeklyScans: weekScans.length,
        weeklyPoints,
        monthlyPoints
    };
}

// Utility functions
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function getLabelDisplayName(label) {
    const labelMapping = {
        'plastic': 'Plastik',
        'metal': 'Logam',
        'paper': 'Kertas',
        'cardboard': 'Kardus',
        'glass': 'Kaca',
        'trash': 'Sampah'
    };
    return labelMapping[label] || label;
}

function getCategoryColor(label) {
    const colorMapping = {
        'plastic': '#3B82F6',
        'metal': '#6B7280',
        'paper': '#10B981',
        'cardboard': '#F59E0B',
        'glass': '#06B6D4',
        'trash': '#EF4444'
    };
    return colorMapping[label] || '#6B7280';
}

// Initialize on load
initStorage();
