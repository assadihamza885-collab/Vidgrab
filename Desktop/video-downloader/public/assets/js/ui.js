const UI = (() => {
  const elements = {
    urlInput: document.getElementById('videoUrl'),
    pasteBtn: document.getElementById('pasteBtn'),
    analyzeForm: document.getElementById('analyzeForm'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analyzeBtnText: document.getElementById('analyzeBtnText'),
    analyzeSpinner: document.getElementById('analyzeSpinner'),
    alertBox: document.getElementById('alertBox'),
    previewContainer: document.getElementById('previewContainer'),
    mediaThumbnail: document.getElementById('mediaThumbnail'),
    mediaTitle: document.getElementById('mediaTitle'),
    mediaUploader: document.getElementById('mediaUploader'),
    mediaDuration: document.getElementById('mediaDuration'),
    formatSelect: document.getElementById('formatSelect'),
    qualitySelect: document.getElementById('qualitySelect'),
    qualityGroup: document.getElementById('qualityGroup'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadBtnText: document.getElementById('downloadBtnText'),
    downloadSpinner: document.getElementById('downloadSpinner'),
    progressBox: document.getElementById('progressContainer'),
    progressStatus: document.getElementById('progressStatus'),
    progressPercent: document.getElementById('progressPercent'),
    progressBarFill: document.getElementById('progressBarFill')
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const showAlert = (message, type = 'danger') => {
    elements.alertBox.className = `alert alert-${type} animate-fade-in`;
    elements.alertBox.textContent = message;
    elements.alertBox.style.display = 'block';
  };

  const hideAlert = () => {
    elements.alertBox.style.display = 'none';
  };

  const setAnalyzeLoading = (isLoading) => {
    if (isLoading) {
      elements.analyzeBtn.disabled = true;
      elements.analyzeBtnText.textContent = 'Analyzing';
      elements.analyzeSpinner.style.display = 'inline-block';
    } else {
      elements.analyzeBtn.disabled = false;
      elements.analyzeBtnText.textContent = 'Analyze';
      elements.analyzeSpinner.style.display = 'none';
    }
  };

  const setDownloadLoading = (isLoading) => {
    if (isLoading) {
      elements.downloadBtn.disabled = true;
      elements.downloadBtnText.textContent = 'Downloading...';
      elements.downloadSpinner.style.display = 'inline-block';
      elements.progressBox.style.display = 'block';
     
    } else {
      elements.downloadBtn.disabled = false;
      elements.downloadBtnText.textContent = 'Download Now';
      elements.downloadSpinner.style.display = 'none';
      elements.progressBarFill.style.width = '100%';
      elements.progressPercent.textContent = 'Complete!';
      setTimeout(() => {
        elements.progressBox.style.display = 'none';
        elements.progressBarFill.style.width = '0%';
      }, 3000);
    }
  };

  const renderPreview = (data) => {
    elements.mediaThumbnail.src = data.thumbnail || '';
    elements.mediaTitle.textContent = data.title;
    elements.mediaUploader.textContent = data.uploader;
    elements.mediaDuration.textContent = formatDuration(data.duration);

    elements.qualitySelect.innerHTML = '<option value="best">Best Quality</option>';
    if (data.qualities && data.qualities.length) {
      data.qualities.forEach((q) => {
        const opt = document.createElement('option');
        opt.value = q;
        opt.textContent = q;
        elements.qualitySelect.appendChild(opt);
      });
    }

    elements.previewContainer.style.display = 'block';
    elements.previewContainer.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    elements,
    showAlert,
    hideAlert,
    setAnalyzeLoading,
    setDownloadLoading,
    renderPreview
  };
})();