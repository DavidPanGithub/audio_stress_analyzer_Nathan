document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('id_file');
    const browseBtn = document.getElementById('browse-btn');
    const dropZone = document.getElementById('drop-zone');
    const selectedFile = document.getElementById('selected-file');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const scoreValue = document.getElementById('score-value');
    const scoreFill = document.getElementById('score-fill');
    const scoreInterpretation = document.getElementById('score-interpretation');
    const featuresContainer = document.getElementById('features-container');
    const uploadForm = document.getElementById('upload-form');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    let currentFile = null;
    
    // Browse button click handler
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = '#e3f2fd';
        dropZone.style.borderColor = '#2196f3';
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = '#f8f9fa';
        dropZone.style.borderColor = '#3498db';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = '#f8f9fa';
        dropZone.style.borderColor = '#3498db';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
    
    // Analyze button click handler
    analyzeBtn.addEventListener('click', () => {
        if (!currentFile) return;
        
        // Show loading, hide results
        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        analyzeBtn.disabled = true;
        
        // Create FormData object for AJAX upload
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('csrfmiddlewaretoken', csrfToken);
        
        // Send the file to the server
        fetch(uploadForm.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateResults(data.score, data.features);
            } else {
                alert('Error processing file: ' + (data.errors || data.error));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing the file.');
        })
        .finally(() => {
            loading.style.display = 'none';
            analyzeBtn.disabled = false;
        });
    });
    
    function handleFileSelection(file) {
        // Check if file is an audio file
        if (!file.type.startsWith('audio/')) {
            alert('Please upload an audio file');
            return;
        }
        
        currentFile = file;
        selectedFile.textContent = `Selected file: ${file.name}`;
        analyzeBtn.disabled = false;
    }
    
    function updateResults(score, features) {
        // Update score value
        scoreValue.textContent = score.toFixed(2);
        
        // Update score fill width
        scoreFill.style.width = `${score * 100}%`;
        
        // Update interpretation
        if (score < 0.3) {
            scoreInterpretation.textContent = 'Low Stress';
        } else if (score < 0.6) {
            scoreInterpretation.textContent = 'Moderate Stress';
        } else {
            scoreInterpretation.textContent = 'High Stress';
        }
        
        // Generate feature breakdown
        featuresContainer.innerHTML = '';
        
        for (const [feature, contribution] of Object.entries(features)) {
            const featureEl = document.createElement('div');
            featureEl.className = 'feature';
            
            // Format feature name for display
            const displayName = feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            featureEl.innerHTML = `
                <div class="feature-name">
                    <span>${displayName}</span>
                    <span>${(contribution * 100).toFixed(1)}%</span>
                </div>
                <div class="feature-bar">
                    <div class="feature-fill" style="width: ${contribution * 100}%"></div>
                </div>
            `;
            
            featuresContainer.appendChild(featureEl);
        }
        
        // Show results
        resultContainer.style.display = 'block';
        
        // Animate feature bars after a short delay
        setTimeout(() => {
            document.querySelectorAll('.feature-fill').forEach(fill => {
                fill.style.width = fill.style.width;
            });
        }, 100);
    }
});