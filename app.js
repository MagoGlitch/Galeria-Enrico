/**
 * Clique & Poesia - Galeria Exclusiva de Fotos
 * Evento: Batizado do Enrico
 * Sistema Inteligente de Visualização, Seleção, Lightbox e Download
 */

(function () {
  'use strict';

  const data = window.GALLERY_DATA || {
    clientName: "Enrico",
    eventTitle: "Batizado do Enrico",
    photographerBrand: "Clique & Poesia",
    photographerWhatsapp: "553897569353",
    totalPhotos: 0,
    photos: []
  };

  const STORAGE_KEY = `clique_selection_${data.clientName.toLowerCase()}_batizado`;

  const state = {
    selectedIds: new Set(),
    activeFilter: 'all', // 'all' ou 'selected'
    searchQuery: '',
    lightboxIndex: -1,
    filteredPhotos: []
  };

  // Carregar seleções salvas no LocalStorage
  function loadSavedSelection() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          state.selectedIds = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar seleções salvas:', e);
    }
  }

  // Persistir seleções no LocalStorage
  function saveSelection() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selectedIds]));
    } catch (e) {
      console.warn('Erro ao salvar seleções:', e);
    }
  }

  // Elementos do DOM
  const elements = {
    photosGrid: document.getElementById('photosGrid'),
    totalPhotosCount: document.getElementById('totalPhotosCount'),
    allCountTab: document.getElementById('allCountTab'),
    selectedCountTab: document.getElementById('selectedCountTab'),
    selectedFloatingCount: document.getElementById('selectedFloatingCount'),
    floatingBar: document.getElementById('floatingBar'),
    searchInput: document.getElementById('searchInput'),
    tabAll: document.getElementById('tabAll'),
    tabSelected: document.getElementById('tabSelected'),
    btnSelectAll: document.getElementById('btnSelectAll'),
    btnClearSelection: document.getElementById('btnClearSelection'),
    btnDownloadSelected: document.getElementById('btnDownloadSelected'),
    btnSendWhatsapp: document.getElementById('btnSendWhatsapp'),
    btnCopyCodes: document.getElementById('btnCopyCodes'),
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxStage: document.getElementById('lightboxStage'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxOrientationTag: document.getElementById('lightboxOrientationTag'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxPrev: document.getElementById('lightboxPrev'),
    lightboxNext: document.getElementById('lightboxNext'),
    lightboxClose: document.getElementById('lightboxClose'),
    lightboxDownload: document.getElementById('lightboxDownload'),
    lightboxFavorite: document.getElementById('lightboxFavorite'),
    progressModal: document.getElementById('progressModal'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressStatusText: document.getElementById('progressStatusText'),
    toastContainer: document.getElementById('toastContainer')
  };

  // Exibir notificação Toast
  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Filtrar fotos com base na aba ativa e busca
  function computeFilteredPhotos() {
    return data.photos.filter(photo => {
      if (state.activeFilter === 'selected' && !state.selectedIds.has(photo.id)) {
        return false;
      }
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        return photo.fileName.toLowerCase().includes(query) || photo.title.toLowerCase().includes(query);
      }
      return true;
    });
  }

  // Atualizar contadores na tela
  function updateCounters() {
    const selectedCount = state.selectedIds.size;
    if (elements.totalPhotosCount) elements.totalPhotosCount.textContent = data.photos.length;
    if (elements.allCountTab) elements.allCountTab.textContent = data.photos.length;
    if (elements.selectedCountTab) elements.selectedCountTab.textContent = selectedCount;
    if (elements.selectedFloatingCount) elements.selectedFloatingCount.textContent = selectedCount;

    if (elements.floatingBar) {
      if (selectedCount > 0) {
        elements.floatingBar.classList.add('is-visible');
        elements.floatingBar.setAttribute('aria-hidden', 'false');
      } else {
        elements.floatingBar.classList.remove('is-visible');
        elements.floatingBar.setAttribute('aria-hidden', 'true');
      }
    }
  }

  // Alternar seleção de foto
  function togglePhotoSelection(photoId, event) {
    if (event) event.stopPropagation();

    const isSelected = state.selectedIds.has(photoId);
    if (isSelected) {
      state.selectedIds.delete(photoId);
    } else {
      state.selectedIds.add(photoId);
    }
    saveSelection();
    updateCounters();

    // Atualizar card na grade
    const card = document.querySelector(`.photo-card[data-id="${photoId}"]`);
    if (card) {
      card.classList.toggle('is-selected', !isSelected);
      const favBtn = card.querySelector('.btn-card-favorite svg');
      if (favBtn) {
        favBtn.setAttribute('fill', !isSelected ? 'currentColor' : 'none');
      }
    }

    // Se estiver na aba de selecionadas e desmarcou, re-renderizar
    if (state.activeFilter === 'selected') {
      renderGallery();
    }

    // Atualizar no lightbox se estiver aberto
    updateLightboxFavoriteState();
  }

  // Download direto de uma única foto
  function downloadSinglePhoto(photo, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const link = document.createElement('a');
    link.href = encodeURI(photo.url);
    link.download = photo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Download de ${photo.fileName} iniciado!`);
  }

  // Renderizar a Galeria de Fotos (Masonry fluida respeitando proporções originais)
  function renderGallery() {
    state.filteredPhotos = computeFilteredPhotos();
    elements.photosGrid.innerHTML = '';

    if (state.filteredPhotos.length === 0) {
      elements.photosGrid.innerHTML = `
        <div class="empty-gallery">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <h3>Nenhuma memória encontrada</h3>
          <p>${state.activeFilter === 'selected' 
            ? 'Você ainda não favoritou nenhuma foto. Clique no coração de cada foto para marcá-la!' 
            : 'Nenhuma foto corresponde à sua pesquisa.'}</p>
        </div>
      `;
      updateCounters();
      return;
    }

    const fragment = document.createDocumentFragment();

    state.filteredPhotos.forEach((photo, index) => {
      const isSelected = state.selectedIds.has(photo.id);

      const card = document.createElement('div');
      card.className = `photo-card ${isSelected ? 'is-selected' : ''}`;
      card.setAttribute('data-id', photo.id);
      card.setAttribute('data-index', index);

      card.innerHTML = `
        <div class="photo-card-media" role="button" tabindex="0" title="Clique para ver em tela cheia">
          <img 
            src="${encodeURI(photo.url)}" 
            alt="Foto ${photo.title} do Batizado do Enrico" 
            class="photo-img" 
            loading="lazy"
          />
          <div class="photo-hover-overlay"></div>
          
          <button type="button" class="btn-card-favorite" title="${isSelected ? 'Remover dos favoritos' : 'Favoritar foto'}" aria-label="Favoritar foto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSelected ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <a href="${encodeURI(photo.url)}" download="${photo.fileName}" class="btn-card-download" title="Baixar esta foto em alta qualidade" aria-label="Baixar foto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        </div>

        <div class="photo-card-footer">
          <span class="photo-name" title="${photo.fileName}">${photo.fileName}</span>
          <span class="photo-size-badge">${photo.sizeMb || 'HD'}</span>
        </div>
      `;

      // Eventos do card
      const mediaEl = card.querySelector('.photo-card-media');
      mediaEl.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-favorite') || e.target.closest('.btn-card-download')) return;
        openLightbox(index);
      });

      mediaEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });

      const favBtn = card.querySelector('.btn-card-favorite');
      favBtn.addEventListener('click', (e) => togglePhotoSelection(photo.id, e));

      const dlBtn = card.querySelector('.btn-card-download');
      dlBtn.addEventListener('click', (e) => downloadSinglePhoto(photo, e));

      fragment.appendChild(card);
    });

    elements.photosGrid.appendChild(fragment);
    updateCounters();
  }

  // =========================================================================
  // Lógica do Lightbox
  // =========================================================================
  function updateLightboxFavoriteState() {
    if (state.lightboxIndex === -1) return;
    const currentPhoto = state.filteredPhotos[state.lightboxIndex];
    if (!currentPhoto) return;

    const isFav = state.selectedIds.has(currentPhoto.id);
    elements.lightboxFavorite.classList.toggle('is-active', isFav);
    const svg = elements.lightboxFavorite.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
    }
  }

  function openLightbox(index) {
    if (index < 0 || index >= state.filteredPhotos.length) return;
    state.lightboxIndex = index;
    const photo = state.filteredPhotos[index];

    elements.lightboxTitle.textContent = photo.fileName;
    elements.lightboxOrientationTag.textContent = 'Batizado do Enrico • Clique & Poesia';
    elements.lightboxImg.src = encodeURI(photo.url);
    elements.lightboxImg.alt = photo.fileName;
    elements.lightboxDownload.href = encodeURI(photo.url);
    elements.lightboxDownload.setAttribute('download', photo.fileName);
    elements.lightboxCounter.textContent = `Foto ${index + 1} de ${state.filteredPhotos.length}`;

    updateLightboxFavoriteState();

    elements.lightboxModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    elements.lightboxModal.classList.remove('is-open');
    document.body.style.overflow = '';
    state.lightboxIndex = -1;
    elements.lightboxImg.src = '';
  }

  function nextLightbox() {
    if (state.filteredPhotos.length === 0) return;
    let nextIndex = state.lightboxIndex + 1;
    if (nextIndex >= state.filteredPhotos.length) nextIndex = 0;
    openLightbox(nextIndex);
  }

  function prevLightbox() {
    if (state.filteredPhotos.length === 0) return;
    let prevIndex = state.lightboxIndex - 1;
    if (prevIndex < 0) prevIndex = state.filteredPhotos.length - 1;
    openLightbox(prevIndex);
  }

  // Suporte a gestos Swipe no Lightbox para Celulares
  let touchStartX = 0;
  let touchEndX = 0;

  if (elements.lightboxStage) {
    elements.lightboxStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.lightboxStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) {
        nextLightbox(); // swipe para a esquerda -> próxima
      } else {
        prevLightbox(); // swipe para a direita -> anterior
      }
    }
  }

  // =========================================================================
  // Download em Lote (JSZip com fallback inteligente)
  // =========================================================================
  async function downloadSelectedPhotos() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Selecione pelo menos uma foto para baixar.');
      return;
    }

    elements.progressModal.classList.add('is-active');
    elements.progressBarFill.style.width = '0%';
    elements.progressStatusText.textContent = `Iniciando download de ${selectedPhotos.length} fotos...`;

    // Verifica se JSZip está disponível
    if (typeof JSZip !== 'undefined') {
      try {
        const zip = new JSZip();
        const folderName = `Batizado-Enrico-CliqueEPoesia`;
        const imgFolder = zip.folder(folderName);

        for (let i = 0; i < selectedPhotos.length; i++) {
          const photo = selectedPhotos[i];
          const pct = Math.round(((i) / selectedPhotos.length) * 100);
          elements.progressBarFill.style.width = `${pct}%`;
          elements.progressStatusText.textContent = `Processando foto ${i + 1} de ${selectedPhotos.length}: ${photo.fileName}...`;

          const response = await fetch(encodeURI(photo.url));
          if (!response.ok) throw new Error(`Falha ao obter ${photo.fileName}`);
          const blob = await response.blob();
          imgFolder.file(photo.fileName, blob);
        }

        elements.progressBarFill.style.width = '95%';
        elements.progressStatusText.textContent = 'Gerando arquivo compactado (.ZIP)...';

        const content = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        }, (metadata) => {
          elements.progressBarFill.style.width = `${Math.min(95 + Math.round(metadata.percent * 0.05), 100)}%`;
        });

        // Salvar com FileSaver ou link direto
        const zipName = `Batizado-Enrico-Clique-e-Poesia.zip`;
        if (typeof saveAs !== 'undefined') {
          saveAs(content, zipName);
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = zipName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        }

        elements.progressBarFill.style.width = '100%';
        elements.progressStatusText.textContent = 'Download do ZIP concluído!';
        setTimeout(() => {
          elements.progressModal.classList.remove('is-active');
          showToast(`Todas as ${selectedPhotos.length} fotos foram baixadas com sucesso!`);
        }, 1200);
        return;

      } catch (err) {
        console.warn('JSZip falhou ou bloqueio de rede, usando download sequencial como fallback:', err);
      }
    }

    // Fallback: Download sequencial individual direto no navegador
    for (let i = 0; i < selectedPhotos.length; i++) {
      const photo = selectedPhotos[i];
      const pct = Math.round(((i + 1) / selectedPhotos.length) * 100);
      elements.progressBarFill.style.width = `${pct}%`;
      elements.progressStatusText.textContent = `Baixando ${i + 1} de ${selectedPhotos.length}: ${photo.fileName}...`;

      const link = document.createElement('a');
      link.href = encodeURI(photo.url);
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await new Promise(r => setTimeout(r, 400));
    }

    elements.progressStatusText.textContent = 'Downloads concluídos!';
    setTimeout(() => {
      elements.progressModal.classList.remove('is-active');
      showToast('Todas as fotos foram baixadas!');
    }, 1200);
  }

  // =========================================================================
  // Envio via WhatsApp
  // =========================================================================
  function sendSelectionViaWhatsapp() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Selecione pelo menos uma foto para enviar.');
      return;
    }

    const fileNames = selectedPhotos.map(p => `• ${p.fileName}`).join('\n');
    const message = `🕊️ *Seleção de Fotos - Batizado do Enrico*\n` +
      `_Clique & Poesia - Galeria Exclusiva_\n\n` +
      `Olá! Aqui estão as *${selectedPhotos.length} fotos* que selecionamos com carinho do *Batizado do Enrico*:\n\n` +
      `${fileNames}\n\n` +
      `Total: ${selectedPhotos.length} memórias selecionadas. Aguardamos os próximos passos!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${data.photographerWhatsapp}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }

  // =========================================================================
  // Copiar Códigos / Nomes das Fotos
  // =========================================================================
  function copySelectedCodes() {
    const selectedPhotos = data.photos.filter(p => state.selectedIds.has(p.id));
    if (selectedPhotos.length === 0) {
      showToast('Nenhuma foto selecionada para copiar.');
      return;
    }

    const codes = selectedPhotos.map(p => p.fileName).join(', ');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codes).then(() => {
        showToast(`Códigos de ${selectedPhotos.length} fotos copiados!`);
      }).catch(() => fallbackCopy(codes, selectedPhotos.length));
    } else {
      fallbackCopy(codes, selectedPhotos.length);
    }
  }

  function fallbackCopy(text, count) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`Códigos de ${count} fotos copiados!`);
    } catch (e) {
      showToast('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(textarea);
  }

  // =========================================================================
  // Configuração dos Eventos e Abas
  // =========================================================================
  function setupEventListeners() {
    if (elements.tabAll) {
      elements.tabAll.addEventListener('click', () => {
        elements.tabAll.classList.add('active');
        if (elements.tabSelected) elements.tabSelected.classList.remove('active');
        state.activeFilter = 'all';
        renderGallery();
      });
    }

    if (elements.tabSelected) {
      elements.tabSelected.addEventListener('click', () => {
        elements.tabSelected.classList.add('active');
        if (elements.tabAll) elements.tabAll.classList.remove('active');
        state.activeFilter = 'selected';
        renderGallery();
      });
    }

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderGallery();
      });
    }

    if (elements.btnSelectAll) {
      elements.btnSelectAll.addEventListener('click', () => {
        const photosToSelect = state.searchQuery || state.activeFilter !== 'all' ? state.filteredPhotos : data.photos;
        photosToSelect.forEach(p => state.selectedIds.add(p.id));
        saveSelection();
        renderGallery();
        showToast(`Todas as ${photosToSelect.length} fotos foram selecionadas!`);
      });
    }

    if (elements.btnClearSelection) {
      elements.btnClearSelection.addEventListener('click', () => {
        if (state.selectedIds.size === 0) return;
        if (confirm('Deseja realmente limpar toda a sua seleção de fotos?')) {
          state.selectedIds.clear();
          saveSelection();
          renderGallery();
          showToast('Seleção limpa com sucesso.');
        }
      });
    }

    if (elements.btnDownloadSelected) {
      elements.btnDownloadSelected.addEventListener('click', downloadSelectedPhotos);
    }
    if (elements.btnSendWhatsapp) {
      elements.btnSendWhatsapp.addEventListener('click', sendSelectionViaWhatsapp);
    }
    if (elements.btnCopyCodes) {
      elements.btnCopyCodes.addEventListener('click', copySelectedCodes);
    }

    // Controles do Lightbox
    if (elements.lightboxClose) {
      elements.lightboxClose.addEventListener('click', closeLightbox);
    }
    if (elements.lightboxPrev) {
      elements.lightboxPrev.addEventListener('click', prevLightbox);
    }
    if (elements.lightboxNext) {
      elements.lightboxNext.addEventListener('click', nextLightbox);
    }

    if (elements.lightboxFavorite) {
      elements.lightboxFavorite.addEventListener('click', () => {
        if (state.lightboxIndex === -1) return;
        const photo = state.filteredPhotos[state.lightboxIndex];
        if (photo) {
          togglePhotoSelection(photo.id);
        }
      });
    }

    if (elements.lightboxModal) {
      elements.lightboxModal.addEventListener('click', (e) => {
        if (e.target === elements.lightboxModal || e.target === elements.lightboxStage) {
          closeLightbox();
        }
      });
    }

    // Teclas de atalho no teclado
    document.addEventListener('keydown', (e) => {
      if (!elements.lightboxModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    });
  }

  // Inicialização
  function init() {
    loadSavedSelection();
    setupEventListeners();
    renderGallery();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();