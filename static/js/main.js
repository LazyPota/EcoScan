// static/js/main.js

// Setup drag and drop
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
uploadArea.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    uploadArea.classList.add('dragover');
}

function unhighlight() {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

fileInput.addEventListener('change', function(e) {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            displayImagePreview(file);
        } else {
            alert('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP, WebP)');
        }
    }
}

function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'block';
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    };
    reader.readAsDataURL(file);
}

// Fungsi untuk mengkonversi label backend ke nama display yang lebih user-friendly
function getLabelDisplayName(label) {
    const labelMapping = {
        'plastic': 'Sampah Plastik',
        'metal': 'Sampah Logam/Kaleng', 
        'paper': 'Kertas',
        'cardboard': 'Kardus/Karton',
        'trash': 'Sampah Umum'
    };
    return labelMapping[label] || label;
}

// Fungsi untuk mendapatkan warna berdasarkan kategori
function getCategoryColor(label) {
    const colorMapping = {
        'plastic': '#3B82F6',  // Blue
        'metal': '#6B7280',    // Gray
        'paper': '#10B981',    // Green
        'cardboard': '#F59E0B', // Yellow
        'trash': '#EF4444'     // Red
    };
    return colorMapping[label] || '#6B7280';
}

// Main analysis function - Compatible with backend response
async function analyzeImage() {
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInput = document.getElementById('fileInput');
    
    // Validate input
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Pilih gambar terlebih dahulu!');
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis...';
    loading.style.display = 'block';
    
    // Hide previous result if any
    resultCard.style.display = 'none';
    
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    
    try {
        console.log('Sending request to /predict...');
        
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }
        
        // Check if response has the expected structure
        if (data.status === 'error') {
            throw new Error(data.error || 'Unknown error occurred');
        }
        
        if (data.status === 'success' && data.prediction) {
            // Backend returns structured response
            displayResult(data);
        } else {
            // Fallback for older response format
            const result = {
                label: data.label,
                category: data.category,
                fact: data.fact || 'Tidak ada informasi tambahan.',
                confidence: data.confidence || 0
            };
            displayResultLegacy(result);
        }
        
    } catch (error) {
        console.error('Error during analysis:', error);
        
        // Show user-friendly error
        const errorMessages = {
            'Failed to fetch': 'Tidak dapat terhubung ke server. Pastikan aplikasi backend berjalan.',
            'NetworkError': 'Masalah koneksi jaringan. Coba lagi dalam beberapa saat.',
            'TypeError': 'Terjadi kesalahan dalam memproses respon server.'
        };
        
        const userMessage = errorMessages[error.name] || error.message || 'Terjadi kesalahan tidak diketahui';
        alert('Error: ' + userMessage);
        
    } finally {
        // Hide loading and restore button
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisis Sampah';
    }
}

// Display result for new backend response format
function displayResult(data) {
    const resultCard = document.getElementById('resultCard');
    const itemName = document.getElementById('itemName');
    const categoryInstruction = document.getElementById('categoryInstruction');
    const factContent = document.getElementById('factContent');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const classificationResult = document.querySelector('.classification-result');
    
    const prediction = data.prediction;
    const displayName = getLabelDisplayName(prediction.label);
    const confidence = Math.round(prediction.confidence) || 0;
    
    // Update content
    itemName.textContent = displayName;
    categoryInstruction.innerHTML = `Masukkan ke kategori: <strong>${prediction.category || 'Tidak diketahui'}</strong>`;
    factContent.textContent = prediction.fact || 'Tidak ada informasi tambahan tersedia.';
    
    // Update colors based on category
    const categoryColor = getCategoryColor(prediction.label);
    if (classificationResult) {
        classificationResult.style.background = `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`;
    }
    
    // Animate confidence bar
    confidenceText.textContent = `Akurasi: ${confidence}%`;
    setTimeout(() => {
        confidenceFill.style.width = confidence + '%';
    }, 100);
    
    // Show result card
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
    
    // Log additional info if available
    if (data.all_predictions) {
        console.log('All predictions:', data.all_predictions);
    }
}

// Fallback function for legacy response format
function displayResultLegacy(result) {
    const resultCard = document.getElementById('resultCard');
    const itemName = document.getElementById('itemName');
    const categoryInstruction = document.getElementById('categoryInstruction');
    const factContent = document.getElementById('factContent');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    
    const displayName = getLabelDisplayName(result.label);
    const confidence = Math.round((result.confidence || 0) * 100);
    
    itemName.textContent = displayName;
    categoryInstruction.innerHTML = `Masukkan ke kategori: <strong>${result.category}</strong>`;
    factContent.textContent = result.fact;
    
    // Animate confidence bar
    setTimeout(() => {
        confidenceFill.style.width = confidence + '%';
    }, 100);
    confidenceText.textContent = `Akurasi: ${confidence}%`;
    
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
}

// Reset analysis function
function resetAnalysis() {
    const uploadCard = document.getElementById('uploadCard');
    const resultCard = document.getElementById('resultCard');
    const previewContainer = document.getElementById('previewContainer');
    const confidenceFill = document.getElementById('confidenceFill');
    
    // Reset form and UI
    fileInput.value = '';
    previewContainer.style.display = 'none';
    resultCard.style.display = 'none';
    confidenceFill.style.width = '0%';
    
    // Scroll back to upload area
    uploadCard.scrollIntoView({ behavior: 'smooth' });
}

// Bottom navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get navigation target
            const target = this.querySelector('span').textContent;
            console.log('Navigation clicked:', target);
            
            // Here you can add navigation logic for different sections
            // For now, only 'Beranda' is active
        });
    });
    
    // Add keyboard support for file input
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target;
            if (target.classList.contains('upload-area') || target.classList.contains('upload-btn')) {
                e.preventDefault();
                fileInput.click();
            }
        }
    });
    
    console.log('Pilah AI JavaScript initialized successfully');
});

// Health check function for debugging
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Health check:', data);
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// Auto health check on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkHealth, 1000);
});