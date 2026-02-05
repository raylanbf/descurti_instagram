function addFloatingButton() {
  if (document.getElementById('ig-auto-selector-btn')) return;

  const button = document.createElement('button');
  button.id = 'ig-auto-selector-btn';
  button.innerHTML = '🤖 Selecionar';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `;

  button.onclick = async () => {
    button.disabled = true;
    button.innerHTML = '⏳ Processando...';
    try {
      await runAutoSelector();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      button.disabled = false;
      updateButtonText();
    }
  };

  document.body.appendChild(button);
  updateButtonText();
}

async function updateButtonText() {
  const button = document.getElementById('ig-auto-selector-btn');
  if (!button) return;
  const data = await chrome.storage.local.get(['isPro']);
  button.innerHTML = data.isPro ? '🤖 Selecionar 90' : '🤖 Selecionar 6';
}

async function runAutoSelector() {
  const data = await chrome.storage.local.get(['isPro']);
  const isPro = data.isPro || false;
  const LIMIT = isPro ? 90 : 6;

  const spans = Array.from(document.querySelectorAll('span[data-bloks-name="bk.components.Text"]'));
  const selectBtnSpan = spans.find(el => el.textContent.trim() === 'Selecionar');

  if (selectBtnSpan) {
    const parentBtn = selectBtnSpan.closest('div[role="button"]') || selectBtnSpan.parentElement;
    parentBtn.click();
    await new Promise(r => setTimeout(r, 1500)); 
  }

  let selectors = Array.from(document.querySelectorAll('div[role="button"][aria-label*="caixa"], div[role="button"][aria-label*="Alternar"]'));
  if (selectors.length === 0) {
    selectors = Array.from(document.querySelectorAll('div[data-bloks-name="ig.components.Icon"]'))
      .map(el => el.closest('div[role="button"]'))
      .filter(el => el !== null);
  }

  if (selectors.length === 0) {
    alert("Clique em 'Selecionar' manualmente e tente novamente.");
    return;
  }

  let selectedCount = 0;
  for (let i = 0; i < selectors.length; i++) {
    if (selectedCount >= LIMIT) {
      if (!isPro) alert("Limite gratuito atingido! Adquira a versão PRO para selecionar 90.");
      break;
    }
    const btn = selectors[i];
    const icon = btn.querySelector('div[data-bloks-name="ig.components.Icon"]');
    const bg = icon ? getComputedStyle(icon).backgroundColor : '';
    const isSelected = bg && (bg.includes('74, 93, 249') || bg.includes('rgb(74, 93, 249)'));

    if (!isSelected) {
      btn.scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 100));
      btn.click();
      selectedCount++;
      await new Promise(r => setTimeout(r, 400));
    }
  }
  alert(`Pronto! ${selectedCount} itens marcados.`);
}

const observer = new MutationObserver(() => {
  if (window.location.href.includes('/your_activity/')) addFloatingButton();
});
observer.observe(document.body, { childList: true, subtree: true });
if (window.location.href.includes('/your_activity/')) addFloatingButton();

// Escuta mensagens do popup para atualizar o botão
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'updateStatus') updateButtonText();
});