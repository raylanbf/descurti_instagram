// Adiciona um botão flutuante na página do Instagram
function addFloatingButton() {
  // Verifica se já existe o botão
  if (document.getElementById('ig-auto-selector-btn')) return;

  const button = document.createElement('button');
  button.id = 'ig-auto-selector-btn';
  button.innerHTML = '🤖 Selecionar 90';
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

  button.onmouseover = () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
  };

  button.onmouseout = () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
  };

  button.onclick = async () => {
    button.disabled = true;
    button.innerHTML = '⏳ Processando...';
    
    try {
      await runAutoSelector();
    } catch (error) {
      console.error('Erro:', error);
      alert('Ocorreu um erro. Verifique o console para mais detalhes.');
    } finally {
      button.disabled = false;
      button.innerHTML = '🤖 Selecionar 90';
    }
  };

  document.body.appendChild(button);
}

// Função principal que executa a seleção automática
async function runAutoSelector() {
  /* 1. Procura o SPAN que contém o texto 'Selecionar' */
  const spans = Array.from(document.querySelectorAll('span[data-bloks-name="bk.components.Text"]'));
  const selectBtnSpan = spans.find(el => el.textContent.trim() === 'Selecionar');

  if (selectBtnSpan) {
    console.log("Botão 'Selecionar' encontrado. Ativando...");
    /* Clica no elemento pai (a div/botão que envolve o span) */
    const parentBtn = selectBtnSpan.closest('div[role="button"]') || selectBtnSpan.parentElement;
    parentBtn.click();
    
    /* Força eventos de mouse para garantir que o Bloks reconheça */
    ['mousedown', 'mouseup'].forEach(evt => 
      parentBtn.dispatchEvent(new MouseEvent(evt, {bubbles: true}))
    );

    /* Aguarda as caixinhas aparecerem */
    await new Promise(r => setTimeout(r, 1500)); 
  }

  /* 2. Busca as caixinhas de seleção nas fotos */
  let selectors = Array.from(document.querySelectorAll('div[role="button"][aria-label*="caixa"], div[role="button"][aria-label*="Alternar"]'));
  
  /* Se não achar pelo aria-label, busca pelo ícone interno das caixinhas */
  if (selectors.length === 0) {
    selectors = Array.from(document.querySelectorAll('div[data-bloks-name="ig.components.Icon"]'))
      .map(el => el.closest('div[role="button"]'))
      .filter(el => el !== null);
  }

  if (selectors.length === 0) {
    alert("Não consegui abrir as caixinhas. Clique em 'Selecionar' manualmente e clique no botão novamente.");
    return;
  }

  /* 3. Inicia a marcação automática */
  const LIMIT = 90;
  const DELAY_MS = 400;
  let selectedCount = 0;

  console.log(`Iniciando seleção de ${selectors.length} itens...`);

  for (let i = 0; i < selectors.length; i++) {
    if (selectedCount >= LIMIT) break;
    const btn = selectors[i];
    
    /* Verifica se já está azul (selecionado) */
    const icon = btn.querySelector('div[data-bloks-name="ig.components.Icon"]');
    const bg = icon ? getComputedStyle(icon).backgroundColor : '';
    const isSelected = bg && (bg.includes('74, 93, 249') || bg.includes('rgb(74, 93, 249)'));

    if (!isSelected) {
      try {
        btn.scrollIntoView({ block: 'center' });
        await new Promise(r => setTimeout(r, 100));
        btn.click();
        selectedCount++;
        console.log(`Marcado: ${selectedCount}`);
      } catch (err) {}
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }
  
  alert(`Pronto! ${selectedCount} itens marcados.`);
}

// Observa mudanças na página para adicionar o botão quando necessário
const observer = new MutationObserver(() => {
  if (window.location.href.includes('/your_activity/')) {
    addFloatingButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Adiciona o botão imediatamente se já estiver na página correta
if (window.location.href.includes('/your_activity/')) {
  addFloatingButton();
}