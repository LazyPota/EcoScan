// dompet.js - Wallet page functionality

// Load storage utilities
const script = document.createElement('script');
script.src = '/static/js/storage.js';
document.head.appendChild(script);

// Wait for storage to load
setTimeout(initWallet, 100);

function initWallet() {
    if (typeof getStats !== 'function') {
        setTimeout(initWallet, 100);
        return;
    }
    
    loadBalance();
    loadRedemptionHistory();
    updateRewardButtons();
}

function loadBalance() {
    const stats = getStats();
    
    document.getElementById('pointsBalance').textContent = stats.totalPoints;
    document.getElementById('monthlyPoints').textContent = stats.monthlyPoints;
    document.getElementById('totalRedeemed').textContent = stats.totalRedeemed;
}

function loadRedemptionHistory() {
    const redemptions = getRedemptions();
    const historyList = document.getElementById('redemptionHistory');
    
    if (redemptions.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada riwayat penukaran</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    redemptions.forEach(redemption => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        item.innerHTML = `
            <div class="history-icon">
                <i class="fas fa-gift"></i>
            </div>
            <div class="history-info">
                <div class="history-title">${redemption.reward}</div>
                <div class="history-time">${formatDate(redemption.timestamp)}</div>
            </div>
            <div class="history-points">-${redemption.points}</div>
        `;
        historyList.appendChild(item);
    });
}

function updateRewardButtons() {
    const currentPoints = getPoints();
    const rewardCards = document.querySelectorAll('.reward-card');
    
    rewardCards.forEach(card => {
        const requiredPoints = parseInt(card.getAttribute('data-points'));
        const button = card.querySelector('.reward-btn');
        
        if (currentPoints < requiredPoints) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-lock"></i> Poin Tidak Cukup';
            button.classList.add('disabled');
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-exchange-alt"></i> Tukar';
            button.classList.remove('disabled');
        }
    });
}

function redeemReward(rewardName, pointsCost) {
    const currentPoints = getPoints();
    
    if (currentPoints < pointsCost) {
        alert(`Poin tidak cukup! Anda memiliki ${currentPoints} poin, tetapi membutuhkan ${pointsCost} poin.`);
        return;
    }
    
    // Confirm redemption
    const confirmed = confirm(`Tukar ${pointsCost} poin untuk ${rewardName}?`);
    
    if (!confirmed) return;
    
    // Process redemption
    const newBalance = addRedemption(rewardName, pointsCost);
    
    if (newBalance !== null) {
        // Show success message
        showSuccessMessage(rewardName, pointsCost);
        
        // Reload data
        loadBalance();
        loadRedemptionHistory();
        updateRewardButtons();
    } else {
        alert('Terjadi kesalahan saat menukar poin. Silakan coba lagi.');
    }
}

function showSuccessMessage(rewardName, pointsCost) {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Penukaran Berhasil!</h2>
            <p>Anda telah menukar <strong>${pointsCost} poin</strong> untuk:</p>
            <p class="reward-name">${rewardName}</p>
            <p class="success-note">Kode voucher akan dikirim ke email Anda dalam 1x24 jam.</p>
            <button class="success-btn" onclick="closeSuccessModal()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Refresh data every 5 seconds if page is visible
setInterval(() => {
    if (!document.hidden) {
        loadBalance();
        updateRewardButtons();
    }
}, 5000);

console.log('Dompet page initialized');
