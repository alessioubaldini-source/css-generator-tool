import { state } from './state.js';
import { switchTab, initializeEventListeners, populatePresetSelectors, initializeMobileFeatures, updateCurrentTab } from './ui.js';

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  try {
    let initialTab = 'button';
    if (window.location.hash === '#layout-tab') {
      initialTab = 'layout';
    }
    const initialButton = document.querySelector(`.tab-button[data-tab='${initialTab}']`);
    if (initialButton) {
      switchTab(initialTab, initialButton);
    } else {
      switchTab('button', document.querySelector(`.tab-button[data-tab='button']`));
    }

    initializeEventListeners();
    populatePresetSelectors();

    if (window.innerWidth <= 768) {
      initializeMobileFeatures();
    }

    updateCurrentTab();

    console.log('DOM content loaded and initialized.');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});
