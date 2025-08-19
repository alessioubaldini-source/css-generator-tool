import { state } from './state.js';
import { getContrast, hexToRgba, darkenColor } from './utils.js';

// --- Funzioni di Utilità ---

function getFormValues(ids) {
  const values = {};
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) {
      values[id] = element.type === 'checkbox' ? element.checked : element.value;
    } else {
      console.warn(`Element with id "${id}" not found.`);
      values[id] = undefined;
    }
  }
  return values;
}

function showVisualizer(targetElement, property) {
  if (!state.tutorialMode || !targetElement) return;

  const visualizer = document.createElement('div');
  visualizer.className = `visualizer ${property}`;

  const rect = targetElement.getBoundingClientRect();
  const previewAreaRect = targetElement.closest('.preview-area').getBoundingClientRect();

  visualizer.style.top = `${rect.top - previewAreaRect.top}px`;
  visualizer.style.left = `${rect.left - previewAreaRect.left}px`;
  visualizer.style.width = `${rect.width}px`;
  visualizer.style.height = `${rect.height}px`;

  targetElement.closest('.preview-area').appendChild(visualizer);

  requestAnimationFrame(() => {
    visualizer.style.opacity = '0.7';
    setTimeout(() => {
      visualizer.style.opacity = '0';
      setTimeout(() => visualizer.remove(), 500);
    }, 1000);
  });
}

function updateContrastDisplay(elementId, contrast) {
  const displayElement = document.getElementById(elementId);
  if (!displayElement) return;
  const contrastValue = contrast.toFixed(1);
  if (contrast >= 4.5) {
    displayElement.innerHTML = `✅ ${contrastValue}:1`;
    displayElement.style.color = '#2f855a';
    displayElement.title = 'Contrasto accessibile (WCAG AA)';
  } else {
    displayElement.innerHTML = `❌ ${contrastValue}:1`;
    displayElement.style.color = '#c53030';
    displayElement.title = 'Contrasto insufficiente (WCAG Fail)';
  }
}

// --- Generatori di Stili ---

export function updateButton(event) {
  const button = document.getElementById('preview-button');
  if (!button) return;

  if (event && event.target) {
    const id = event.target.id;
    if (id.includes('padding')) showVisualizer(button, 'padding');
    if (id.includes('margin')) showVisualizer(button, 'margin');
  }

  const controlIds = [
    'btn-padding-horizontal',
    'btn-padding-vertical',
    'btn-font-size',
    'btn-bg-color',
    'btn-text-color',
    'btn-border-radius',
    'btn-border-width',
    'btn-border-style',
    'btn-border-color',
    'btn-box-shadow',
    'btn-shadow-color',
    'btn-shadow-inset',
    'btn-font-weight',
    'btn-text-align',
    'btn-text-decoration',
    'btn-text-transform',
    'btn-line-height',
    'btn-letter-spacing',
    'btn-opacity',
    'btn-cursor',
    'btn-transition-duration',
    'btn-transition-timing',
    'btn-hover-effect',
    'btn-outline-width',
    'btn-outline-style',
    'btn-outline-color',
    'btn-outline-offset',
    'btn-text-input',
  ];
  const v = getFormValues(controlIds);

  document.getElementById('btn-padding-horizontal-val').textContent = v['btn-padding-horizontal'] + 'px';
  document.getElementById('btn-padding-vertical-val').textContent = v['btn-padding-vertical'] + 'px';
  document.getElementById('btn-font-size-val').textContent = v['btn-font-size'] + 'px';
  document.getElementById('btn-border-radius-val').textContent = v['btn-border-radius'] + 'px';
  document.getElementById('btn-border-width-val').textContent = v['btn-border-width'] + 'px';
  document.getElementById('btn-box-shadow-val').textContent = v['btn-box-shadow'] + 'px';
  document.getElementById('btn-line-height-val').textContent = v['btn-line-height'];
  document.getElementById('btn-letter-spacing-val').textContent = v['btn-letter-spacing'] + 'px';
  document.getElementById('btn-opacity-val').textContent = v['btn-opacity'];
  document.getElementById('btn-transition-duration-val').textContent = v['btn-transition-duration'] + 's';
  document.getElementById('btn-outline-width-val').textContent = v['btn-outline-width'] + 'px';
  document.getElementById('btn-outline-offset-val').textContent = v['btn-outline-offset'] + 'px';

  const contrast = getContrast(v['btn-bg-color'], v['btn-text-color']);
  updateContrastDisplay('btn-contrast-display', contrast);

  const rgbaShadowColor = hexToRgba(v['btn-shadow-color'], 0.2 * (v['btn-box-shadow'] / 20));

  let normalStyles = `
        padding: ${v['btn-padding-vertical']}px ${v['btn-padding-horizontal']}px;
        font-size: ${v['btn-font-size']}px;
        background-color: ${v['btn-bg-color']};
        color: ${v['btn-text-color']};
        border-radius: ${v['btn-border-radius']}px;
        border: ${v['btn-border-width']}px ${v['btn-border-style']} ${v['btn-border-color']};
        font-weight: ${v['btn-font-weight']};
        text-align: ${v['btn-text-align']};
        text-decoration: ${v['btn-text-decoration']};
        text-transform: ${v['btn-text-transform']};
        line-height: ${v['btn-line-height']};
        letter-spacing: ${v['btn-letter-spacing']}px;
        opacity: ${v['btn-opacity']};
        cursor: ${v['btn-cursor']};
        transition: all ${v['btn-transition-duration']}s ${v['btn-transition-timing']};
        display: inline-block;
    `;
  if (v['btn-border-style'] === 'none') {
    normalStyles += `border: none;`;
  }

  if (v['btn-box-shadow'] > 0) {
    normalStyles += `box-shadow: ${v['btn-shadow-inset'] ? 'inset ' : ''}0 ${v['btn-box-shadow']}px ${v['btn-box-shadow'] * 2}px ${rgbaShadowColor};`;
  } else {
    normalStyles += `box-shadow: none;`;
  }
  button.style.cssText = normalStyles;
  button.textContent = v['btn-text-input'];

  let previewStyleBlock = document.getElementById('preview-style-block');
  if (!previewStyleBlock) {
    previewStyleBlock = document.createElement('style');
    previewStyleBlock.id = 'preview-style-block';
    document.head.appendChild(previewStyleBlock);
  }

  let previewCss = '';

  if (v['btn-hover-effect'] !== 'none') {
    previewCss += `#preview-button:hover {\n`;
    switch (v['btn-hover-effect']) {
      case 'scale':
        previewCss += `    transform: scale(1.05);\n`;
        break;
      case 'lift':
        const newShadowStrength = parseInt(v['btn-box-shadow']) + 5;
        const newShadowRgba = hexToRgba(v['btn-shadow-color'], 0.3);
        previewCss += `    transform: translateY(-2px);\n`;
        previewCss += `    box-shadow: ${v['btn-shadow-inset'] ? 'inset ' : ''}0 ${newShadowStrength}px ${newShadowStrength * 2}px ${newShadowRgba};\n`;
        break;
      case 'darken':
        previewCss += `    filter: brightness(0.9);\n`;
        break;
    }
    previewCss += `}\n`;
  }

  if (v['btn-outline-width'] > 0 && v['btn-outline-style'] !== 'none') {
    previewCss += `\n#preview-button:focus {\n`;
    previewCss += `    outline: ${v['btn-outline-width']}px ${v['btn-outline-style']} ${v['btn-outline-color']};\n`;
    previewCss += `    outline-offset: ${v['btn-outline-offset']}px;\n`;
    previewCss += `}\n`;
  }

  previewStyleBlock.innerHTML = previewCss;

  const cssLines = [];
  let className = 'button';
  cssLines.push(`.${className} {`);
  cssLines.push(`    padding: ${v['btn-padding-vertical']}px ${v['btn-padding-horizontal']}px;`);
  cssLines.push(`    font-size: ${v['btn-font-size']}px;`);
  cssLines.push(`    background-color: ${v['btn-bg-color']};`);
  cssLines.push(`    color: ${v['btn-text-color']};`);
  cssLines.push(`    border-radius: ${v['btn-border-radius']}px;`);
  if (v['btn-border-style'] !== 'none') {
    cssLines.push(`    border: ${v['btn-border-width']}px ${v['btn-border-style']} ${v['btn-border-color']};`);
  } else {
    cssLines.push(`    border: none;`);
  }
  cssLines.push(`    font-weight: ${v['btn-font-weight']};`);
  cssLines.push(`    text-align: ${v['btn-text-align']};`);
  cssLines.push(`    text-decoration: ${v['btn-text-decoration']};`);
  cssLines.push(`    text-transform: ${v['btn-text-transform']};`);
  cssLines.push(`    line-height: ${v['btn-line-height']};`);
  cssLines.push(`    letter-spacing: ${v['btn-letter-spacing']}px;`);
  cssLines.push(`    opacity: ${v['btn-opacity']};`);
  cssLines.push(`    cursor: ${v['btn-cursor']};`);
  cssLines.push(`    transition: all ${v['btn-transition-duration']}s ${v['btn-transition-timing']};`);

  if (v['btn-box-shadow'] > 0) {
    cssLines.push(`    box-shadow: ${v['btn-shadow-inset'] ? 'inset ' : ''}0 ${v['btn-box-shadow']}px ${v['btn-box-shadow'] * 2}px ${rgbaShadowColor};`);
  }
  cssLines.push(`}`);

  if (v['btn-hover-effect'] !== 'none') {
    cssLines.push(`\n.${className}:hover {`);
    switch (v['btn-hover-effect']) {
      case 'scale':
        cssLines.push(`    transform: scale(1.05);`);
        break;
      case 'lift':
        cssLines.push(`    transform: translateY(-2px);`);
        cssLines.push(`    box-shadow: ${v['btn-shadow-inset'] ? 'inset ' : ''}0 ${parseInt(v['btn-box-shadow']) + 5}px ${parseInt(v['btn-box-shadow']) * 2 + 10}px ${hexToRgba(v['btn-shadow-color'], 0.3)};`);
        break;
      case 'darken':
        cssLines.push(`    filter: brightness(0.9);`);
        break;
    }
    cssLines.push(`}`);
  }

  if (v['btn-outline-width'] > 0 && v['btn-outline-style'] !== 'none') {
    cssLines.push(`\n.${className}:focus {`);
    cssLines.push(`    outline: ${v['btn-outline-width']}px ${v['btn-outline-style']} ${v['btn-outline-color']};`);
    cssLines.push(`    outline-offset: ${v['btn-outline-offset']}px;`);
    cssLines.push(`}`);
  }

  state.currentCss = cssLines.join('\n');
  if (state.tutorialMode) {
    state.currentHtml = `<!-- Il tag <button> è l'elemento HTML corretto per i pulsanti interattivi. -->
<!-- La classe "${className}" collega questo elemento alle regole CSS che hai definito. -->
<button class="${className}">${v['btn-text-input']}</button>`;
  } else {
    state.currentHtml = `<button class="${className}">${v['btn-text-input']}</button>`;
  }

  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.innerHTML = '';
  const mainRuleSpan = document.createElement('span');
  mainRuleSpan.id = 'css-block-button';
  mainRuleSpan.textContent = state.currentCss;
  cssCodeContainer.appendChild(mainRuleSpan);

  document.getElementById('html-code').textContent = state.currentHtml;
}

export function updateLayout(event) {
  const layoutContainer = document.getElementById('preview-layout');
  if (!layoutContainer) return;

  const layoutType = document.getElementById('layout-type-selector').value;
  state.currentLayoutType = layoutType;

  document.querySelectorAll('.layout-mode-controls').forEach((controlDiv) => {
    controlDiv.style.display = 'none';
  });
  document.getElementById('layout-item-common-controls').style.display = 'block';

  const containerCssLines = [];
  const itemCssLines = [];
  let htmlContent = '';
  let containerClassName = 'layout-container';
  let itemClassName = 'layout-item';

  if (event && event.target) {
    const id = event.target.id;
    if (id.includes('layout-item-padding')) {
      document.querySelectorAll('#preview-layout .layout-item').forEach((item) => showVisualizer(item, 'padding'));
    }
    if (id.includes('layout-item-margin')) {
      document.querySelectorAll('#preview-layout .layout-item').forEach((item) => showVisualizer(item, 'margin'));
    }
  }

  const itemControlIds = [
    'layout-item-bg-color',
    'layout-item-text-color',
    'layout-item-width',
    'layout-item-height',
    'layout-item-padding-top',
    'layout-item-padding-right',
    'layout-item-padding-bottom',
    'layout-item-padding-left',
    'layout-item-margin-top',
    'layout-item-margin-right',
    'layout-item-margin-bottom',
    'layout-item-margin-left',
    'layout-item-border-radius',
    'layout-item-box-shadow',
    'layout-item-shadow-color',
    'layout-item-opacity',
  ];
  const itemValues = getFormValues(itemControlIds);

  document.getElementById('layout-item-width-val').textContent = itemValues['layout-item-width'] + 'px';
  document.getElementById('layout-item-height-val').textContent = itemValues['layout-item-height'] + 'px';
  document.getElementById('layout-item-padding-top-val').textContent = itemValues['layout-item-padding-top'] + 'px';
  document.getElementById('layout-item-padding-right-val').textContent = itemValues['layout-item-padding-right'] + 'px';
  document.getElementById('layout-item-padding-bottom-val').textContent = itemValues['layout-item-padding-bottom'] + 'px';
  document.getElementById('layout-item-padding-left-val').textContent = itemValues['layout-item-padding-left'] + 'px';
  document.getElementById('layout-item-margin-top-val').textContent = itemValues['layout-item-margin-top'] + 'px';
  document.getElementById('layout-item-margin-right-val').textContent = itemValues['layout-item-margin-right'] + 'px';
  document.getElementById('layout-item-margin-bottom-val').textContent = itemValues['layout-item-margin-bottom'] + 'px';
  document.getElementById('layout-item-margin-left-val').textContent = itemValues['layout-item-margin-left'] + 'px';
  document.getElementById('layout-item-border-radius-val').textContent = itemValues['layout-item-border-radius'] + 'px';
  document.getElementById('layout-item-box-shadow-val').textContent = itemValues['layout-item-box-shadow'] + 'px';
  document.getElementById('layout-item-opacity-val').textContent = itemValues['layout-item-opacity'];

  const itemContrast = getContrast(itemValues['layout-item-bg-color'], itemValues['layout-item-text-color']);
  updateContrastDisplay('layout-item-contrast-display', itemContrast);

  const itemRgbaShadowColor = hexToRgba(itemValues['layout-item-shadow-color'], 0.2 * (itemValues['layout-item-box-shadow'] / 15));

  itemCssLines.push(`.${itemClassName} {`);
  itemCssLines.push(`    background-color: ${itemValues['layout-item-bg-color']};`);
  itemCssLines.push(`    color: ${itemValues['layout-item-text-color']};`);
  itemCssLines.push(`    width: ${itemValues['layout-item-width']}px;`);
  itemCssLines.push(`    height: ${itemValues['layout-item-height']}px;`);
  itemCssLines.push(`    padding: ${itemValues['layout-item-padding-top']}px ${itemValues['layout-item-padding-right']}px ${itemValues['layout-item-padding-bottom']}px ${itemValues['layout-item-padding-left']}px;`);
  itemCssLines.push(`    margin: ${itemValues['layout-item-margin-top']}px ${itemValues['layout-item-margin-right']}px ${itemValues['layout-item-margin-bottom']}px ${itemValues['layout-item-margin-left']}px;`);
  itemCssLines.push(`    border-radius: ${itemValues['layout-item-border-radius']}px;`);
  itemCssLines.push(`    opacity: ${itemValues['layout-item-opacity']};`);
  itemCssLines.push(`    transition: all 0.3s ease;`);
  itemCssLines.push(`    display: flex;`);
  itemCssLines.push(`    align-items: center;`);
  itemCssLines.push(`    justify-content: center;`);
  itemCssLines.push(`    font-size: 12px;`);
  if (itemValues['layout-item-box-shadow'] > 0) {
    itemCssLines.push(`    box-shadow: 0 ${itemValues['layout-item-box-shadow'] / 2}px ${itemValues['layout-item-box-shadow']}px ${itemRgbaShadowColor};`);
  } else {
    itemCssLines.push(`    box-shadow: none;`);
  }
  itemCssLines.push(`}`);
  itemCssLines.push(`.${itemClassName}:hover {`);
  itemCssLines.push(`    transform: scale(1.05);`);
  itemCssLines.push(`    filter: brightness(0.9);`);
  if (itemValues['layout-item-box-shadow'] > 0) {
    itemCssLines.push(`    box-shadow: 0 ${itemValues['layout-item-box-shadow']}px ${itemValues['layout-item-box-shadow'] * 1.5}px ${hexToRgba(itemValues['layout-item-shadow-color'], 0.3)};`);
  }
  itemCssLines.push(`}`);

  if (layoutType === 'div') {
    document.getElementById('div-mode-controls').style.display = 'block';
    const divControlIds = [
      'div-width',
      'div-height',
      'div-margin',
      'div-position',
      'div-top',
      'div-left',
      'div-z-index',
      'div-bg-color',
      'div-border-width',
      'div-border-style',
      'div-border-color',
      'div-border-radius',
      'div-shadow',
      'div-shadow-color',
      'div-shadow-inset',
      'div-opacity',
    ];
    const divValues = getFormValues(divControlIds);

    document.getElementById('div-width-val').textContent = divValues['div-width'] + 'px';
    document.getElementById('div-height-val').textContent = divValues['div-height'] + 'px';
    document.getElementById('div-margin-val').textContent = divValues['div-margin'] + 'px';
    document.getElementById('div-top-val').textContent = divValues['div-top'] + 'px';
    document.getElementById('div-left-val').textContent = divValues['div-left'] + 'px';
    document.getElementById('div-z-index-val').textContent = divValues['div-z-index'];
    document.getElementById('div-border-width-val').textContent = divValues['div-border-width'] + 'px';
    document.getElementById('div-border-radius-val').textContent = divValues['div-border-radius'] + 'px';
    document.getElementById('div-shadow-val').textContent = divValues['div-shadow'] + 'px';
    document.getElementById('div-opacity-val').textContent = divValues['div-opacity'];

    const rgbaShadowColor = hexToRgba(divValues['div-shadow-color'], 0.2 * (divValues['div-shadow'] / 30));

    containerCssLines.push(`.${containerClassName} {`);
    containerCssLines.push(`    width: ${divValues['div-width']}px;`);
    containerCssLines.push(`    height: ${divValues['div-height']}px;`);
    containerCssLines.push(`    background-color: ${divValues['div-bg-color']};`);
    containerCssLines.push(`    border-radius: ${divValues['div-border-radius']}px;`);
    containerCssLines.push(`    opacity: ${divValues['div-opacity']};`);
    containerCssLines.push(`    position: ${divValues['div-position']};`);
    if (divValues['div-position'] !== 'static') {
      containerCssLines.push(`    top: ${divValues['div-top']}px;`);
      containerCssLines.push(`    left: ${divValues['div-left']}px;`);
    }
    containerCssLines.push(`    z-index: ${divValues['div-z-index']};`);
    containerCssLines.push(`    transition: all 0.3s ease;`);
    containerCssLines.push(`    display: block;`);
    if (divValues['div-border-width'] > 0 && divValues['div-border-style'] !== 'none') {
      containerCssLines.push(`    border: ${divValues['div-border-width']}px ${divValues['div-border-style']} ${divValues['div-border-color']};`);
    } else {
      containerCssLines.push(`    border: none;`);
    }
    if (divValues['div-shadow'] > 0) {
      containerCssLines.push(`    box-shadow: ${divValues['div-shadow-inset'] ? 'inset ' : ''}0 ${divValues['div-shadow']}px ${divValues['div-shadow'] * 2}px ${rgbaShadowColor};`);
    } else {
      containerCssLines.push(`    box-shadow: none;`);
    }
    containerCssLines.push(`}`);
    containerCssLines.push(`.${containerClassName}:hover {`, `    filter: brightness(0.95);`, `    transform: scale(1.01);`, `}`);

    const previewContainerStyles = containerCssLines
      .join('\n')
      .replace(/.\w+ {/g, '')
      .replace(/}/g, '')
      .replace(/\n\s*\n/g, '\n');
    layoutContainer.style.cssText = previewContainerStyles;
    if (divValues['div-position'] === 'static') {
      layoutContainer.style.margin = `${divValues['div-margin']}px auto`;
      layoutContainer.style.top = '';
      layoutContainer.style.left = '';
    } else {
      layoutContainer.style.margin = `${divValues['div-margin']}px`;
    }
    layoutContainer.style.display = 'block';
    layoutContainer.style.backgroundImage = 'none';
    layoutContainer.style.background = divValues['div-bg-color'];
    layoutContainer.style.overflow = 'auto';

    htmlContent = `<div class="${containerClassName}">\n`;
    for (let i = 1; i <= state.layoutItemCount; i++) {
      htmlContent += `    <div class="${itemClassName}">${i}</div>\n`;
    }
    htmlContent += `</div>\n`;
  } else if (layoutType === 'flexbox') {
    document.getElementById('flexbox-mode-controls').style.display = 'block';
    const flexControlIds = ['flex-direction', 'justify-content', 'align-items', 'flex-gap', 'flex-wrap', 'align-content'];
    const flexValues = getFormValues(flexControlIds);

    document.getElementById('flex-gap-val').textContent = flexValues['flex-gap'] + 'px';

    containerCssLines.push(`.${containerClassName} {`);
    containerCssLines.push(`    display: flex;`);
    containerCssLines.push(`    flex-direction: ${flexValues['flex-direction']};`);
    containerCssLines.push(`    justify-content: ${flexValues['justify-content']};`);
    containerCssLines.push(`    align-items: ${flexValues['align-items']};`);
    containerCssLines.push(`    gap: ${flexValues['flex-gap']}px;`);
    containerCssLines.push(`    flex-wrap: ${flexValues['flex-wrap']};`);
    containerCssLines.push(`    align-content: ${flexValues['align-content']};`);
    containerCssLines.push(`    padding: 20px;`);
    containerCssLines.push(`    background: #f8f9fa;`);
    containerCssLines.push(`    border-radius: 8px;`);
    containerCssLines.push(`    transition: all 0.3s ease;`);
    containerCssLines.push(`    overflow: auto;`);
    containerCssLines.push(`}`);
    containerCssLines.push(`.${containerClassName}:hover {`, `    box-shadow: 0 4px 10px rgba(0,0,0,0.1);`, `}`);
    layoutContainer.style.cssText = containerCssLines
      .join('\n')
      .replace(/.\w+ {/g, '')
      .replace(/}/g, '')
      .replace(/\n\s*\n/g, '\n');
    layoutContainer.style.display = 'flex';
    layoutContainer.style.backgroundImage =
      'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)';
    layoutContainer.style.backgroundSize = '20px 20px';
    layoutContainer.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    layoutContainer.style.backgroundColor = '';

    htmlContent = `<div class="${containerClassName}">\n`;
    for (let i = 1; i <= state.layoutItemCount; i++) {
      htmlContent += `    <div class="${itemClassName}">${i}</div>\n`;
    }
    htmlContent += `</div>\n`;
  } else if (layoutType === 'grid') {
    document.getElementById('grid-mode-controls').style.display = 'block';
    const gridControlIds = ['grid-columns', 'grid-rows', 'grid-gap', 'grid-auto-fit', 'grid-auto-flow', 'grid-auto-columns', 'grid-auto-rows'];
    const gridValues = getFormValues(gridControlIds);

    document.getElementById('grid-columns-val').textContent = gridValues['grid-columns'];
    document.getElementById('grid-rows-val').textContent = gridValues['grid-rows'];
    document.getElementById('grid-gap-val').textContent = gridValues['grid-gap'] + 'px';

    let gridTemplateColumns = '';
    if (gridValues['grid-auto-fit'] === 'auto-fit') {
      gridTemplateColumns = `repeat(auto-fit, minmax(100px, 1fr))`;
    } else if (gridValues['grid-auto-fit'] === 'auto-fill') {
      gridTemplateColumns = `repeat(auto-fill, minmax(100px, 1fr))`;
    } else {
      gridTemplateColumns = `repeat(${gridValues['grid-columns']}, 1fr)`;
    }

    containerCssLines.push(`.${containerClassName} {`);
    containerCssLines.push(`    display: grid;`);
    containerCssLines.push(`    grid-template-columns: ${gridTemplateColumns};`);
    containerCssLines.push(`    grid-template-rows: repeat(${gridValues['grid-rows']}, 1fr);`);
    containerCssLines.push(`    gap: ${gridValues['grid-gap']}px;`);
    containerCssLines.push(`    grid-auto-flow: ${gridValues['grid-auto-flow']};`);
    containerCssLines.push(`    grid-auto-columns: ${gridValues['grid-auto-columns']};`);
    containerCssLines.push(`    grid-auto-rows: ${gridValues['grid-auto-rows']};`);
    containerCssLines.push(`    padding: 20px;`);
    containerCssLines.push(`    background: #f8f9fa;`);
    containerCssLines.push(`    border-radius: 8px;`);
    containerCssLines.push(`    transition: all 0.3s ease;`);
    containerCssLines.push(`    overflow: auto;`);
    containerCssLines.push(`}`);
    containerCssLines.push(`.${containerClassName}:hover {`, `    box-shadow: 0 4px 10px rgba(0,0,0,0.1);`, `}`);
    layoutContainer.style.cssText = containerCssLines
      .join('\n')
      .replace(/.\w+ {/g, '')
      .replace(/}/g, '')
      .replace(/\n\s*\n/g, '\n');
    layoutContainer.style.display = 'grid';
    layoutContainer.style.backgroundImage =
      'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)';
    layoutContainer.style.backgroundSize = '20px 20px';
    layoutContainer.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    layoutContainer.style.backgroundColor = '';

    htmlContent = `<div class="${containerClassName}">\n`;
    for (let i = 1; i <= state.layoutItemCount; i++) {
      htmlContent += `    <div class="${itemClassName}">${i}</div>\n`;
    }
    htmlContent += `</div>\n`;
  }

  const itemCssString = itemCssLines.join('\n');
  const containerCssString = containerCssLines.join('\n');
  state.currentCss = containerCssString + '\n' + itemCssString;

  if (state.tutorialMode) {
    htmlContent = `<!-- Questo <div> agisce come contenitore per i tuoi elementi. -->
<!-- La sua classe "${containerClassName}" è definita nel blocco CSS corrispondente. -->
<div class="${containerClassName}">\n`;
    for (let i = 1; i <= state.layoutItemCount; i++) {
      htmlContent += `    <!-- Questo è un elemento figlio. La classe "${itemClassName}" applica lo stile a tutti gli elementi uguali. -->\n    <div class="${itemClassName}">${i}</div>\n`;
    }
    htmlContent += `</div>`;
  }

  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.innerHTML = '';
  const containerSpan = document.createElement('span');
  containerSpan.id = 'css-block-layout-container';
  containerSpan.textContent = containerCssString;
  cssCodeContainer.appendChild(containerSpan);
  const itemSpan = document.createElement('span');
  itemSpan.id = 'css-block-layout-item';
  itemSpan.textContent = '\n' + itemCssString;
  cssCodeContainer.appendChild(itemSpan);

  layoutContainer.innerHTML = '';
  for (let i = 1; i <= state.layoutItemCount; i++) {
    const item = document.createElement('div');
    item.className = itemClassName;
    item.textContent = i;
    layoutContainer.appendChild(item);
  }

  const currentLayoutItems = document.querySelectorAll(`#preview-layout .${itemClassName}`);
  const itemRgbaShadowColorPreview = hexToRgba(itemValues['layout-item-shadow-color'], 0.2 * (itemValues['layout-item-box-shadow'] / 15));
  currentLayoutItems.forEach((itemEl) => {
    let itemElStyle = `
            background-color: ${itemValues['layout-item-bg-color']};
            color: ${itemValues['layout-item-text-color']};
            width: ${itemValues['layout-item-width']}px;
            height: ${itemValues['layout-item-height']}px;
            padding: ${itemValues['layout-item-padding-top']}px ${itemValues['layout-item-padding-right']}px ${itemValues['layout-item-padding-bottom']}px ${itemValues['layout-item-padding-left']}px;
            margin: ${itemValues['layout-item-margin-top']}px ${itemValues['layout-item-margin-right']}px ${itemValues['layout-item-margin-bottom']}px ${itemValues['layout-item-margin-left']}px;
            border-radius: ${itemValues['layout-item-border-radius']}px;
            opacity: ${itemValues['layout-item-opacity']};
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        `;
    if (itemValues['layout-item-box-shadow'] > 0) {
      itemElStyle += `box-shadow: 0 ${itemValues['layout-item-box-shadow'] / 2}px ${itemValues['layout-item-box-shadow']}px ${itemRgbaShadowColorPreview};`;
    } else {
      itemElStyle += `box-shadow: none;`;
    }
    itemEl.style.cssText = itemElStyle;
  });

  document.getElementById('html-code').textContent = state.currentHtml;
  layoutContainer.classList.remove('preview-div', 'preview-flexbox', 'preview-grid');
  layoutContainer.classList.add('preview-layout');
}

export function addLayoutItem() {
  state.layoutItemCount++;
  updateLayout();
}

export function removeLayoutItem() {
  if (state.layoutItemCount > 1) {
    state.layoutItemCount--;
    updateLayout();
  } else {
    // This function needs to be in ui.js to be called.
    // For now, we'll just log it. A better refactor would move showTutorialTip to a shared utils file.
    console.log('Non puoi rimuovere tutti gli elementi, ne serve almeno uno!');
  }
}

export function updateText(event) {
  const text = document.getElementById('preview-text');
  if (!text) return;

  const controlIds = ['text-font-size', 'text-font-weight', 'text-align', 'text-color', 'text-line-height', 'text-letter-spacing', 'text-shadow', 'text-shadow-color', 'text-content-input', 'text-white-space', 'text-overflow', 'text-word-break'];
  const v = getFormValues(controlIds);

  document.getElementById('text-font-size-val').textContent = v['text-font-size'] + 'px';
  document.getElementById('text-line-height-val').textContent = v['text-line-height'];
  document.getElementById('text-letter-spacing-val').textContent = v['text-letter-spacing'] + 'px';
  document.getElementById('text-shadow-val').textContent = v['text-shadow'] + 'px';

  const contrast = getContrast('#f8f9fa', v['text-color']);
  updateContrastDisplay('text-contrast-display', contrast);

  const rgbaShadowColor = hexToRgba(v['text-shadow-color'], 0.4 * (v['text-shadow'] / 10));

  let normalStyles = `
        font-size: ${v['text-font-size']}px;
        font-weight: ${v['text-font-weight']};
        text-align: ${v['text-align']};
        color: ${v['text-color']};
        line-height: ${v['text-line-height']};
        letter-spacing: ${v['text-letter-spacing']}px;
        max-width: 300px;
        transition: all 0.3s ease;
        word-break: ${v['text-word-break']};
    `;

  if (v['text-overflow'] === 'ellipsis') {
    normalStyles += `white-space: nowrap; overflow: hidden;`;
  } else {
    normalStyles += `white-space: ${v['text-white-space']};`;
  }
  normalStyles += `text-overflow: ${v['text-overflow']};\n`;
  if (v['text-shadow'] > 0) {
    normalStyles += `text-shadow: ${v['text-shadow']}px ${v['text-shadow']}px ${v['text-shadow'] * 2}px ${rgbaShadowColor};`;
  } else {
    normalStyles += `text-shadow: none;`;
  }
  text.style.cssText = normalStyles;
  text.textContent = v['text-content-input'];

  text.classList.remove('force-hover', 'force-focus');
  text.classList.add('force-hover');

  const cssLines = [];
  let className = 'text-element';
  cssLines.push(`.${className} {`);
  cssLines.push(`    font-size: ${v['text-font-size']}px;`);
  cssLines.push(`    font-weight: ${v['text-font-weight']};`);
  cssLines.push(`    text-align: ${v['text-align']};`);
  cssLines.push(`    color: ${v['text-color']};`);
  cssLines.push(`    line-height: ${v['text-line-height']};`);
  cssLines.push(`    letter-spacing: ${v['text-letter-spacing']}px;`);
  cssLines.push(`    word-break: ${v['text-word-break']};`);

  if (v['text-overflow'] === 'ellipsis') {
    cssLines.push(`    white-space: nowrap;`);
    cssLines.push(`    overflow: hidden;`);
    cssLines.push(`    text-overflow: ${v['text-overflow']};`);
  } else {
    cssLines.push(`    white-space: ${v['text-white-space']};`);
    cssLines.push(`    text-overflow: ${v['text-overflow']};`);
  }

  if (v['text-shadow'] > 0) {
    cssLines.push(`    text-shadow: ${v['text-shadow']}px ${v['text-shadow']}px ${v['text-shadow'] * 2}px ${rgbaShadowColor};`);
  }
  cssLines.push(`}`);

  cssLines.push(`\n.${className}:hover {`);
  cssLines.push(`    text-decoration: underline;`);
  cssLines.push(`    color: ${darkenColor(v['text-color'], 20)};`);
  cssLines.push(`}`);

  state.currentCss = cssLines.join('\n');
  if (state.tutorialMode) {
    state.currentHtml = `<!-- Il tag <p> è usato per i paragrafi di testo. -->
<!-- La classe "${className}" lo collega al CSS. -->
<p class="${className}">${v['text-content-input']}</p>`;
  } else {
    state.currentHtml = `<p class="${className}">${v['text-content-input']}</p>`;
  }

  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.innerHTML = '';
  const span = document.createElement('span');
  span.id = 'css-block-text';
  span.textContent = state.currentCss;
  cssCodeContainer.appendChild(span);

  document.getElementById('html-code').textContent = state.currentHtml;
}

export function updateCard(event) {
  const card = document.getElementById('preview-card');
  if (!card) return;

  if (event && event.target && event.target.id.includes('padding')) {
    showVisualizer(card, 'padding');
  }

  const controlIds = ['card-padding', 'card-max-width', 'card-bg-color', 'card-text-color', 'card-border-width', 'card-border-style', 'card-border-color', 'card-border-radius', 'card-box-shadow', 'card-shadow-color', 'card-shadow-inset'];
  const v = getFormValues(controlIds);

  document.getElementById('card-padding-val').textContent = v['card-padding'] + 'px';
  document.getElementById('card-max-width-val').textContent = v['card-max-width'] + 'px';
  document.getElementById('card-border-width-val').textContent = v['card-border-width'] + 'px';
  document.getElementById('card-border-radius-val').textContent = v['card-border-radius'] + 'px';
  document.getElementById('card-box-shadow-val').textContent = v['card-box-shadow'] + 'px';

  const contrast = getContrast(v['card-bg-color'], v['card-text-color']);
  updateContrastDisplay('card-contrast-display', contrast);

  const rgbaShadowColor = hexToRgba(v['card-shadow-color'], 0.15 * (v['card-box-shadow'] / 25));

  let normalStyles = `
        padding: ${v['card-padding']}px;
        max-width: ${v['card-max-width']}px;
        background-color: ${v['card-bg-color']};
        color: ${v['card-text-color']};
        border-radius: ${v['card-border-radius']}px;
        transition: all 0.3s ease;
    `;

  if (v['card-border-width'] > 0 && v['card-border-style'] !== 'none') {
    normalStyles += `border: ${v['card-border-width']}px ${v['card-border-style']} ${v['card-border-color']};`;
  } else {
    normalStyles += `border: none;`;
  }

  if (v['card-box-shadow'] > 0) {
    normalStyles += `box-shadow: ${v['card-shadow-inset'] ? 'inset ' : ''}0 ${Math.floor(v['card-box-shadow'] / 3)}px ${v['card-box-shadow']}px ${rgbaShadowColor};`;
  } else {
    normalStyles += `box-shadow: none;`;
  }
  card.style.cssText = normalStyles;
  card.querySelectorAll('h3, p').forEach((el) => {
    el.style.color = v['card-text-color'];
  });

  card.classList.remove('force-hover');
  card.classList.add('force-hover');

  const cssLines = [];
  let className = 'card';
  cssLines.push(`.${className} {`);
  cssLines.push(`    padding: ${v['card-padding']}px;`);
  cssLines.push(`    max-width: ${v['card-max-width']}px;`);
  cssLines.push(`    background-color: ${v['card-bg-color']};`);
  cssLines.push(`    color: ${v['card-text-color']};`);
  cssLines.push(`    border-radius: ${v['card-border-radius']}px;`);

  if (v['card-border-width'] > 0 && v['card-border-style'] !== 'none') {
    cssLines.push(`    border: ${v['card-border-width']}px ${v['card-border-style']} ${v['card-border-color']};`);
  }

  if (v['card-box-shadow'] > 0) {
    cssLines.push(`    box-shadow: ${v['card-shadow-inset'] ? 'inset ' : ''}0 ${Math.floor(v['card-box-shadow'] / 3)}px ${v['card-box-shadow']}px ${rgbaShadowColor};`);
  }
  cssLines.push(`}`);
  cssLines.push(`\n.${className}:hover {`);
  cssLines.push(`    transform: translateY(-3px);`);
  if (v['card-box-shadow'] > 0) {
    cssLines.push(`    box-shadow: ${v['card-shadow-inset'] ? 'inset ' : ''}0 ${Math.floor(v['card-box-shadow'] / 2)}px ${v['card-box-shadow'] * 1.5}px ${hexToRgba(v['card-shadow-color'], 0.25)};`);
  }
  cssLines.push(`}`);

  state.currentCss = cssLines.join('\n');
  if (state.tutorialMode) {
    state.currentHtml = `<!-- Un <div> è spesso usato per creare "card" o contenitori di contenuto. -->
<div class="${className}">
    <h3>Card Title</h3>
    <p>This is a sample card with some content inside.</p>
</div>`;
  } else {
    state.currentHtml = `
<div class="${className}">
    <h3>Card Title</h3>
    <p>This is a sample card with some content inside.</p>
</div>`;
  }
  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.innerHTML = '';
  const span = document.createElement('span');
  span.id = 'css-block-card';
  span.textContent = state.currentCss;
  cssCodeContainer.appendChild(span);
  document.getElementById('html-code').textContent = state.currentHtml;
}

export function renderPlayground() {
  const htmlCode = document.getElementById('playground-html').value;
  const cssCode = document.getElementById('playground-css').value;
  const iframe = document.getElementById('preview-playground');

  if (!iframe) {
    console.error('Playground iframe not found!');
    return;
  }

  const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                /* Reset di base per l'iframe */
                body { 
                    margin: 0; 
                    padding: 15px; 
                    font-family: sans-serif; 
                    background-color: white; /* Assicura uno sfondo pulito */
                }
                /* CSS dell'utente */
                ${cssCode}
            </style>
        </head>
        <body>
            <!-- HTML dell'utente -->
            ${htmlCode}
        </body>
        </html>
    `;

  iframe.srcdoc = iframeContent;
  state.currentCss = cssCode;
  state.currentHtml = htmlCode;
  document.getElementById('css-code').textContent = state.currentCss;
  document.getElementById('html-code').textContent = state.currentHtml;
}

export function updateGradient() {
  const gradientDiv = document.getElementById('preview-gradient');
  if (!gradientDiv) return;

  const controlIds = ['gradient-type', 'gradient-direction', 'gradient-color-1', 'gradient-color-2', 'gradient-stop-1', 'gradient-stop-2'];
  const v = getFormValues(controlIds);

  document.getElementById('gradient-direction-val').textContent = v['gradient-direction'] + '°';
  document.getElementById('gradient-stop-1-val').textContent = v['gradient-stop-1'] + '%';
  document.getElementById('gradient-stop-2-val').textContent = v['gradient-stop-2'] + '%';

  let gradient = '';
  if (v['gradient-type'] === 'linear') {
    gradient = `linear-gradient(${v['gradient-direction']}deg, ${v['gradient-color-1']} ${v['gradient-stop-1']}%, ${v['gradient-color-2']} ${v['gradient-stop-2']}%)`;
  } else {
    gradient = `radial-gradient(circle, ${v['gradient-color-1']} ${v['gradient-stop-1']}%, ${v['gradient-color-2']} ${v['gradient-stop-2']}%)`;
  }

  let normalStyles = `
        width: 200px;
        height: 150px;
        background: ${gradient};
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        transition: all 0.3s ease;
    `;
  gradientDiv.style.cssText = normalStyles;

  gradientDiv.classList.remove('force-hover');
  gradientDiv.classList.add('force-hover');

  const cssLines = [];
  let className = 'gradient-element';
  cssLines.push(`.${className} {`);
  cssLines.push(`    background: ${gradient};`);
  cssLines.push(`    width: 200px;`);
  cssLines.push(`    height: 150px;`);
  cssLines.push(`    border-radius: 8px;`);
  cssLines.push(`}`);

  cssLines.push(`\n.${className}:hover {`);
  cssLines.push(`    filter: saturate(1.5);`);
  cssLines.push(`}`);

  state.currentCss = cssLines.join('\n');
  if (state.tutorialMode) {
    state.currentHtml = `<!-- Questo <div> mostra solo il gradiente come sfondo. -->
<div class="${className}"></div>`;
  } else {
    state.currentHtml = `<div class="${className}"></div>`;
  }

  const cssCodeContainer = document.getElementById('css-code');
  cssCodeContainer.innerHTML = '';
  const span = document.createElement('span');
  span.id = 'css-block-gradient';
  span.textContent = state.currentCss;
  cssCodeContainer.appendChild(span);
  document.getElementById('html-code').textContent = state.currentHtml;
}
