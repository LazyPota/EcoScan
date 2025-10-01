// scan.js - Scan page functionality

// Load storage utilities
const script = document.createElement('script');
script.src = '/static/js/storage.js';
document.head.appendChild(script);

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
            alert('Pilih file gambar yang valid (PNG, JPG, JPEG, GIF, BMP, WebP)');
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

// Main analysis function
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
        
        if (data.status === 'error') {
            throw new Error(data.error || 'Unknown error occurred');
        }
        
        if (data.status === 'success' && data.prediction) {
            displayResult(data);
            
            // Save to localStorage
            setTimeout(() => {
                if (typeof addScan === 'function') {
                    addScan(data.prediction);
                    console.log('Scan saved to localStorage');
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('Error during analysis:', error);
        
        const errorMessages = {
            'Failed to fetch': 'Tidak dapat terhubung ke server. Pastikan aplikasi backend berjalan.',
            'NetworkError': 'Masalah koneksi jaringan. Coba lagi dalam beberapa saat.',
            'TypeError': 'Terjadi kesalahan dalam memproses respon server.'
        };
        
        const userMessage = errorMessages[error.name] || error.message || 'Terjadi kesalahan tidak diketahui';
        alert('Error: ' + userMessage);
        
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisis Sampah';
    }
}

// Display result
function displayResult(data) {
    const resultCard = document.getElementById('resultCard');
    const itemName = document.getElementById('itemName');
    const categoryInstruction = document.getElementById('categoryInstruction');
    const factContent = document.getElementById('factContent');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const pointsEarned = document.getElementById('pointsEarned');
    const classificationResult = document.querySelector('.classification-result');
    
    const prediction = data.prediction;
    const displayName = getLabelDisplayName(prediction.label);
    const confidence = Math.round(prediction.confidence) || 0;
    const points = prediction.points || 0;
    
    // Update content
    itemName.textContent = displayName;
    categoryInstruction.innerHTML = `Masukkan ke kategori: <strong>${prediction.category || 'Tidak diketahui'}</strong>`;
    factContent.textContent = prediction.fact || 'Tidak ada informasi tambahan tersedia.';
    pointsEarned.innerHTML = `<i class="fas fa-coins"></i> +${points} Poin`;
    
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
    
    // Log additional info
    if (data.all_predictions) {
        console.log('All predictions:', data.all_predictions);
    }
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

console.log('Scan page initialized');
