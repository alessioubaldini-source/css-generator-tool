import { state } from './state.js';
import { presets } from './presets.js';
import * as generators from './generators.js';
import { debounce, getContrast, colorToRgb, rgbToHex } from './utils.js';

function toggleFullWidthMode() {
  console.log('toggleFullWidthMode called!'); // Debug: Conferma che la funzione è stata chiamata
  const container = document.querySelector('.container');
  const button = document.querySelector('.full-width-toggle');

  if (container && button) {
    const isFullWidth = container.classList.toggle('full-width-mode');
    if (isFullWidth) {
      button.textContent = 'Full-Width Mode: ON';
      button.classList.add('active');
    } else {
      button.textContent = 'Full-Width Mode: OFF';
      button.classList.remove('active');
    }
  } else {
    console.error('Container or full-width button not found inside toggleFullWidthMode!'); // Debug: Se gli elementi non sono presenti
  }
}

export function initializeEventListeners() {
  try {
    console.log('initializeEventListeners called'); // Debug: Conferma l'avvio dell'inizializzazione
    document.querySelectorAll('.tab-button').forEach((btn) => {
      btn.addEventListener('click', function () {
        const tabName = this.dataset.tab;
        if (tabName) switchTab(tabName, this);
      });
    });

    const debouncedUpdateButton = debounce((e) => generators.updateButton(e));
    const debouncedUpdateLayout = debounce((e) => generators.updateLayout(e));
    const debouncedUpdateText = debounce((e) => generators.updateText(e));
    const debouncedUpdateCard = debounce((e) => generators.updateCard(e));
    const debouncedUpdateGradient = debounce((e) => generators.updateGradient(e));

    document.querySelectorAll('#button-tab input, #button-tab select').forEach((el) => el.addEventListener('input', (e) => debouncedUpdateButton(e)));
    document.querySelectorAll('#layout-tab input, #layout-tab select, #layout-tab textarea').forEach((el) => el.addEventListener('input', (e) => debouncedUpdateLayout(e)));
    document.querySelectorAll('#text-tab input, #text-tab select').forEach((el) => el.addEventListener('input', (e) => debouncedUpdateText(e)));
    document.querySelectorAll('#card-tab input, #card-tab select').forEach((el) => el.addEventListener('input', (e) => debouncedUpdateCard(e)));
    document.querySelectorAll('#gradient-tab input, #gradient-tab select').forEach((el) => el.addEventListener('input', (e) => debouncedUpdateGradient(e)));

    document.querySelector('.tutorial-toggle').addEventListener('click', toggleTutorial);
    document.querySelector('.preset-btn').addEventListener('click', generateRandomPreset);

    document.querySelector('.preset-selector').addEventListener('change', function (e) {
      if (state.currentTab && this.value) {
        applyPreset(state.currentTab, this.value);
      }
    });

    const layoutTypeSelector = document.getElementById('layout-type-selector');
    if (layoutTypeSelector) {
      layoutTypeSelector.addEventListener('change', function () {
        state.currentLayoutType = this.value;
        generators.updateLayout();
        populatePresetSelectors();
      });
    }
    document.getElementById('add-layout-item-btn').addEventListener('click', generators.addLayoutItem);
    document.getElementById('remove-layout-item-btn').addEventListener('click', generators.removeLayoutItem);
    const renderPlaygroundBtn = document.getElementById('render-playground-btn');
    if (renderPlaygroundBtn) {
      renderPlaygroundBtn.addEventListener('click', () => {
        generators.renderPlayground();
        showOutput('css');
      });
    }

    document.querySelectorAll('.output-tab-button').forEach((btn) => {
      btn.addEventListener('click', function () {
        showOutput(this.dataset.output);
      });
    });
    document.querySelector('.copy-button').addEventListener('click', copyCode);

    initializeInspectorMode();

    if (window.innerWidth <= 768) {
      document.body.style.overflowX = 'hidden';
    }

    document.addEventListener('input', function (e) {
      if (e.target.type === 'color' || e.target.type === 'range' || e.target.tagName === 'SELECT' || e.target.type === 'checkbox' || e.target.type === 'text') {
        setTimeout(() => {
          checkAccessibility();
          checkPerformance();
        }, 100);
      }
    });

    const fullWidthButton = document.querySelector('.full-width-toggle');
    if (fullWidthButton) {
      fullWidthButton.addEventListener('click', toggleFullWidthMode);
      console.log('Full-width toggle button found and event listener attached.'); // Debug: Conferma l'attacco dell'event listener
    } else {
      console.error('Full-width toggle button not found during initialization!'); // Debug: Se il pulsante non viene trovato
    }
  } catch (error) {
    console.error('Error initializing event listeners:', error);
  }
}

export function initializeMobileFeatures() {
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    document.querySelectorAll('button, select, input').forEach((element) => {
      element.style.touchAction = 'manipulation';
    });
  }

  const inputs = document.querySelectorAll('input[type="text"], select, input[type="range"]');
  inputs.forEach((input) => {
    input.addEventListener('focus', function () {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    });

    input.addEventListener('blur', function () {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    });
  });
}

export function switchTab(tabName, buttonElement) {
  try {
    console.log('Switching to tab:', tabName);
    state.currentTab = tabName;

    document.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
    if (buttonElement) {
      buttonElement.classList.add('active');
    }

    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
      content.style.display = 'none';
    });

    const activeTab = document.getElementById(tabName + '-tab');
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.style.display = 'block';
    }

    if (tabName === 'playground') {
      document.getElementById('css-code').textContent = '/* Clicca su "Renderizza Anteprima" per vedere il codice qui. */';
      document.getElementById('html-code').textContent = '<!-- Clicca su "Renderizza Anteprima" per vedere il codice qui. -->';
      state.currentCss = '';
      state.currentHtml = '';
    }

    const previewSection = document.querySelector('.preview-section');
    if (previewSection) {
      if (tabName === 'playground') {
        previewSection.classList.add('playground-active');
      } else {
        previewSection.classList.remove('playground-active');
      }
    }

    showOnlyActiveElement();
    updateBoxModelVisualizer(null);
    updateCurrentTab();
    populatePresetSelectors();

    console.log('Tab switch completed for:', tabName);
  } catch (error) {
    console.error('Error switching tab:', error);
  }
}

export function updateCurrentTab() {
  switch (state.currentTab) {
    case 'button':
      generators.updateButton();
      break;
    case 'layout':
      generators.updateLayout();
      break;
    case 'text':
      generators.updateText();
      break;
    case 'card':
      generators.updateCard();
      break;
    case 'gradient':
      generators.updateGradient();
      break;
    case 'playground':
      // Nessun aggiornamento automatico, l'utente deve cliccare il pulsante "Renderizza"
      break;
    default:
      console.warn('Unknown tab:', state.currentTab);
  }
}

function showOnlyActiveElement() {
  const elements = ['preview-button', 'preview-layout', 'preview-text', 'preview-card', 'preview-gradient', 'preview-playground'];
  elements.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
    }
  });

  const activeElementId = 'preview-' + state.currentTab;
  const activeElement = document.getElementById(activeElementId);
  if (activeElement) {
    if (state.currentTab === 'button') {
      activeElement.style.display = 'inline-block';
    } else if (state.currentTab === 'layout' || state.currentTab === 'gradient') {
      activeElement.style.display = 'flex';
    } else if (state.currentTab === 'playground') {
      activeElement.style.display = 'block';
    } else {
      activeElement.style.display = 'block';
    }
  }
}

export function populatePresetSelectors() {
  const selector = document.querySelector(`.preset-generator .preset-selector`);
  if (selector) {
    selector.innerHTML = '<option value="">Scegli un Preset...</option>';
    let currentPresets = [];
    if (state.currentTab === 'layout') {
      currentPresets = presets.layout[state.currentLayoutType] || [];
    } else {
      currentPresets = presets[state.currentTab] || [];
    }

    currentPresets.forEach((preset, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = preset.name;
      selector.appendChild(option);
    });
    selector.value = '';
  }
}

function generateRandomPreset() {
  let tabPresets;
  if (state.currentTab === 'layout') {
    tabPresets = presets.layout[state.currentLayoutType];
  } else {
    tabPresets = presets[state.currentTab];
  }

  if (!tabPresets || tabPresets.length === 0) return;

  const randomIndex = Math.floor(Math.random() * tabPresets.length);
  applyPreset(state.currentTab, randomIndex);

  const selector = document.querySelector(`.preset-generator .preset-selector`);
  if (selector) {
    selector.value = randomIndex;
  }
}

function applyPreset(tabName, presetIndex) {
  let preset;
  if (tabName === 'layout') {
    preset = presets.layout[state.currentLayoutType][presetIndex];
  } else {
    preset = presets[tabName][presetIndex];
  }

  if (!preset) return;

  try {
    switch (tabName) {
      case 'button':
        applyButtonPreset(preset);
        break;
      case 'layout':
        applyLayoutPreset(preset);
        break;
      case 'text':
        applyTextPreset(preset);
        break;
      case 'card':
        applyCardPreset(preset);
        break;
      case 'gradient':
        applyGradientPreset(preset);
        break;
    }
    showPresetAppliedMessage(preset.name);
  } catch (error) {
    console.error('Error applying preset:', error);
    showPresetAppliedMessage('Error applying preset');
  }
}

function applyButtonPreset(preset) {
  const elements = {
    'btn-padding-horizontal': preset.paddingHorizontal,
    'btn-padding-vertical': preset.paddingVertical,
    'btn-font-size': preset.fontSize,
    'btn-bg-color': preset.bgColor,
    'btn-text-color': preset.textColor,
    'btn-border-radius': preset.borderRadius,
    'btn-border-width': preset.borderWidth,
    'btn-border-style': preset.borderStyle,
    'btn-border-color': preset.borderColor,
    'btn-box-shadow': preset.boxShadow,
    'btn-shadow-color': preset.shadowColor,
    'btn-shadow-inset': preset.inset,
    'btn-font-weight': preset.fontWeight,
    'btn-text-align': preset.textAlign,
    'btn-text-decoration': preset.textDecoration,
    'btn-text-transform': preset.textTransform,
    'btn-line-height': preset.lineHeight,
    'btn-letter-spacing': preset.letterSpacing,
    'btn-opacity': preset.opacity,
    'btn-cursor': preset.cursor,
    'btn-transition-duration': preset.transitionDuration,
    'btn-transition-timing': preset.transitionTiming,
    'btn-hover-effect': preset.hoverEffect,
    'btn-outline-width': preset.outlineWidth,
    'btn-outline-style': preset.outlineStyle,
    'btn-outline-color': preset.outlineColor,
    'btn-outline-offset': preset.outlineOffset,
    'btn-text-input': preset.textContent,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element !== null && value !== undefined) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  });
  generators.updateButton();
}

function applyLayoutPreset(preset) {
  document.getElementById('layout-item-bg-color').value = preset.itemBgColor;
  document.getElementById('layout-item-text-color').value = preset.itemTextColor;
  document.getElementById('layout-item-width').value = preset.itemWidth;
  document.getElementById('layout-item-height').value = preset.itemHeight;
  document.getElementById('layout-item-padding-top').value = preset.itemPaddingTop;
  document.getElementById('layout-item-padding-right').value = preset.itemPaddingRight;
  document.getElementById('layout-item-padding-bottom').value = preset.itemPaddingBottom;
  document.getElementById('layout-item-padding-left').value = preset.itemPaddingLeft;
  document.getElementById('layout-item-margin-top').value = preset.itemMarginTop;
  document.getElementById('layout-item-margin-right').value = preset.itemMarginRight;
  document.getElementById('layout-item-margin-bottom').value = preset.itemMarginBottom;
  document.getElementById('layout-item-margin-left').value = preset.itemMarginLeft;
  document.getElementById('layout-item-border-radius').value = preset.itemBorderRadius;
  document.getElementById('layout-item-box-shadow').value = preset.itemBoxShadow;
  document.getElementById('layout-item-shadow-color').value = preset.itemShadowColor;
  document.getElementById('layout-item-opacity').value = preset.itemOpacity;

  if (state.currentLayoutType === 'div') {
    document.getElementById('div-width').value = preset.width;
    document.getElementById('div-height').value = preset.height;
    document.getElementById('div-margin').value = preset.margin;
    document.getElementById('div-position').value = preset.position;
    document.getElementById('div-top').value = preset.top;
    document.getElementById('div-left').value = preset.left;
    document.getElementById('div-z-index').value = preset.zIndex;
    document.getElementById('div-bg-color').value = preset.bgColor;
    document.getElementById('div-border-width').value = preset.borderWidth;
    document.getElementById('div-border-style').value = preset.borderStyle;
    document.getElementById('div-border-color').value = preset.borderColor;
    document.getElementById('div-border-radius').value = preset.borderRadius;
    document.getElementById('div-shadow').value = preset.shadow;
    document.getElementById('div-shadow-color').value = preset.shadowColor;
    document.getElementById('div-shadow-inset').checked = preset.inset;
    document.getElementById('div-opacity').value = preset.opacity;
  } else if (state.currentLayoutType === 'flexbox') {
    document.getElementById('flex-direction').value = preset.direction || 'row';
    document.getElementById('justify-content').value = preset.justifyContent || 'flex-start';
    document.getElementById('align-items').value = preset.alignItems || 'stretch';
    document.getElementById('flex-gap').value = preset.gap || 10;
    document.getElementById('flex-wrap').value = preset.flexWrap || 'wrap';
    document.getElementById('align-content').value = preset.alignContent || 'stretch';
  } else if (state.currentLayoutType === 'grid') {
    document.getElementById('grid-columns').value = preset.columns || 3;
    document.getElementById('grid-rows').value = preset.rows || 2;
    document.getElementById('grid-gap').value = preset.gap || 10;
    document.getElementById('grid-auto-fit').value = preset.autoFit || 'none';
    document.getElementById('grid-auto-flow').value = preset.gridAutoFlow || 'row';
    document.getElementById('grid-auto-columns').value = preset.gridAutoColumns || '1fr';
    document.getElementById('grid-auto-rows').value = preset.gridAutoRows || 'auto';
  }
  generators.updateLayout();
}

function applyTextPreset(preset) {
  const elements = {
    'text-font-size': preset.fontSize,
    'text-font-weight': preset.fontWeight,
    'text-align': preset.textAlign,
    'text-color': preset.color,
    'text-line-height': preset.lineHeight,
    'text-letter-spacing': preset.letterSpacing,
    'text-shadow': preset.textShadow,
    'text-shadow-color': preset.shadowColor,
    'text-content-input': preset.textContent,
    'text-white-space': preset.whiteSpace || 'normal',
    'text-overflow': preset.textOverflow || 'clip',
    'text-word-break': preset.wordBreak || 'normal',
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element !== null && value !== undefined) {
      element.value = value;
    }
  });
  generators.updateText();
}

function applyCardPreset(preset) {
  const elements = {
    'card-padding': preset.padding,
    'card-max-width': preset.maxWidth,
    'card-bg-color': preset.bgColor,
    'card-text-color': preset.textColor,
    'card-border-width': preset.borderWidth,
    'card-border-style': preset.borderStyle,
    'card-border-color': preset.borderColor,
    'card-border-radius': preset.borderRadius,
    'card-box-shadow': preset.boxShadow,
    'card-shadow-color': preset.shadowColor,
    'card-shadow-inset': preset.inset,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element !== null && value !== undefined) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  });
  generators.updateCard();
}

function applyGradientPreset(preset) {
  const elements = {
    'gradient-type': preset.type,
    'gradient-direction': preset.direction,
    'gradient-color-1': preset.color1,
    'gradient-color-2': preset.color2,
    'gradient-stop-1': preset.stop1,
    'gradient-stop-2': preset.stop2,
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element !== null && value !== undefined) {
      element.value = value;
    }
  });
  generators.updateGradient();
}

function showPresetAppliedMessage(presetName) {
  const message = document.createElement('div');
  message.className = 'preset-applied';
  message.innerHTML = `✨ ${presetName} Applied!`;
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 2000);
}

function copyCode() {
  const copyButton = document.querySelector('.copy-button');
  const cssOutput = document.getElementById('css-code');
  const htmlOutput = document.getElementById('html-code');
  let textToCopy = '';

  if (cssOutput.classList.contains('active')) {
    textToCopy = state.currentCss;
  } else if (htmlOutput.classList.contains('active')) {
    textToCopy = state.currentHtml;
  } else {
    return;
  }

  navigator.clipboard.writeText(textToCopy).then(
    function () {
      copyButton.textContent = 'Copiato!';
      copyButton.classList.add('copy-success');
      setTimeout(function () {
        copyButton.textContent = 'Copia Codice';
        copyButton.classList.remove('copy-success');
      }, 2000);
    },
    function (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  );
}

function showOutput(outputType) {
  const cssOutput = document.getElementById('css-code');
  const htmlOutput = document.getElementById('html-code');
  const boxModelOutput = document.getElementById('box-model-visualizer');
  const copyButton = document.querySelector('.copy-button');

  [cssOutput, htmlOutput, boxModelOutput].forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.output-tab-button').forEach((btn) => btn.classList.remove('active'));

  const panelMap = {
    css: cssOutput,
    html: htmlOutput,
    'box-model': boxModelOutput,
  };

  if (panelMap[outputType]) {
    panelMap[outputType].classList.add('active');
    const activeButton = document.querySelector(`.output-tab-button[data-output="${outputType}"]`);
    if (activeButton) activeButton.classList.add('active');
  }

  copyButton.disabled = outputType === 'box-model';
}

function initializeInspectorMode() {
  const previewArea = document.querySelector('.preview-area');
  if (!previewArea) return;

  previewArea.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    let elementKey = null;

    if (target.matches('#preview-button')) elementKey = 'button';
    else if (target.matches('#preview-card') || target.closest('#preview-card')) elementKey = 'card';
    else if (target.matches('#preview-text')) elementKey = 'text';
    else if (target.matches('#preview-gradient')) elementKey = 'gradient';
    else if (target.matches('.layout-item')) elementKey = 'layout-item';
    else if (target.matches('#preview-layout')) elementKey = 'layout-container';

    if (elementKey) {
      highlightCssBlock(elementKey);
      updateBoxModelVisualizer(target.closest('.preview-button, .preview-card, .preview-text, .preview-gradient, .layout-item, .preview-layout'));
      if (state.tutorialMode) {
        showTutorialTip(`Hai selezionato: ${elementKey}. Il suo CSS è ora evidenziato.`);
      }
    } else {
      updateBoxModelVisualizer(null);
      highlightCssBlock(null);
    }
  });
}

function updateBoxModelVisualizer(element) {
  if (!element) {
    ['margin', 'border', 'padding'].forEach((prop) => {
      ['top', 'right', 'bottom', 'left'].forEach((side) => {
        const el = document.getElementById(`bm-${prop}-${side}`);
        if (el) el.textContent = '-';
      });
    });
    const contentEl = document.getElementById('bm-content');
    if (contentEl) contentEl.textContent = 'Select an element';
    return;
  }

  const styles = getComputedStyle(element);
  const getPixelValue = (value) => parseFloat(value) || 0;

  document.getElementById('bm-margin-top').textContent = getPixelValue(styles.marginTop);
  document.getElementById('bm-margin-right').textContent = getPixelValue(styles.marginRight);
  document.getElementById('bm-margin-bottom').textContent = getPixelValue(styles.marginBottom);
  document.getElementById('bm-margin-left').textContent = getPixelValue(styles.marginLeft);

  document.getElementById('bm-border-top').textContent = getPixelValue(styles.borderTopWidth);
  document.getElementById('bm-border-right').textContent = getPixelValue(styles.borderRightWidth);
  document.getElementById('bm-border-bottom').textContent = getPixelValue(styles.borderBottomWidth);
  document.getElementById('bm-border-left').textContent = getPixelValue(styles.borderLeftWidth);

  document.getElementById('bm-padding-top').textContent = getPixelValue(styles.paddingTop);
  document.getElementById('bm-padding-right').textContent = getPixelValue(styles.paddingRight);
  document.getElementById('bm-padding-bottom').textContent = getPixelValue(styles.paddingBottom);
  document.getElementById('bm-padding-left').textContent = getPixelValue(styles.paddingLeft);

  const width = getPixelValue(styles.width);
  const height = getPixelValue(styles.height);
  document.getElementById('bm-content').textContent = `${Math.round(width)} × ${Math.round(height)}`;
}

function highlightCssBlock(key) {
  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.querySelectorAll('span.highlight').forEach((el) => el.classList.remove('highlight'));

  const targetSpan = document.getElementById(`css-block-${key}`);
  if (targetSpan) {
    targetSpan.classList.add('highlight');
    targetSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function toggleTutorial() {
  state.tutorialMode = !state.tutorialMode;
  const button = document.querySelector('.tutorial-toggle');
  const body = document.body;

  if (state.tutorialMode) {
    button.textContent = 'Tutorial Mode: ON';
    button.classList.add('tutorial-mode');
    body.classList.add('tutorial-mode');
    showTutorialTip('🎓 Benvenuto nel Tutorial Mode! Riceverai consigli mentre usi il tool');
  } else {
    button.textContent = 'Tutorial Mode: OFF';
    button.classList.remove('tutorial-mode');
    body.classList.remove('tutorial-mode');
  }
  updateCurrentTab();
}

function showTutorialTip(message) {
  if (state.tutorialMode) {
    const tip = document.createElement('div');
    tip.className = 'tutorial-tip';
    tip.textContent = message;
    tip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffd700;
            color: #333;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
        `;
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 3000);
  }
}

function checkAccessibility() {
  if (state.tutorialMode) {
    // Implement accessibility checks based on state.currentTab
  }
}

function checkPerformance() {
  if (state.tutorialMode) {
    // Implement performance checks based on state.currentTab
  }
}
