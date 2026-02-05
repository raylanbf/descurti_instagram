// Configurações
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/00w5kCbcQ7Zg2q9go4dAk01'; // SUBSTITUA PELO SEU LINK DO STRIPE
const ACTIVATION_CODES = [
  'PRO2024-ABCD',
  'PRO2024-EFGH',
  'PRO2024-IJKL'
];

// Elementos
const statusBox = document.getElementById('statusBox');
const statusText = document.getElementById('statusText');
const limitText = document.getElementById('limitText');
const upgradeSection = document.getElementById('upgradeSection');
const proSection = document.getElementById('proSection');
const btnUpgrade = document.getElementById('btnUpgrade');
const btnActivate = document.getElementById('btnActivate');
const activationCode = document.getElementById('activationCode');

// Verifica o status ao abrir o popup
chrome.storage.local.get(['isPro', 'activationCode'], (data) => {
  if (data.isPro) {
    showProStatus(data.activationCode);
  } else {
    showFreeStatus();
  }
});

function showFreeStatus() {
  statusBox.classList.remove('pro');
  statusText.textContent = 'Gratuito';
  limitText.textContent = '6 itens';
  upgradeSection.classList.remove('hidden');
  proSection.classList.add('hidden');
}

function showProStatus(code) {
  statusBox.classList.add('pro');
  statusText.textContent = 'PRO ✅';
  limitText.textContent = '90 itens';
  upgradeSection.classList.add('hidden');
  proSection.classList.remove('hidden');
}

btnUpgrade.addEventListener('click', () => {
  chrome.tabs.create({ url: STRIPE_PAYMENT_LINK });
});

btnActivate.addEventListener('click', () => {
  const code = activationCode.value.trim().toUpperCase();
  
  if (!code) {
    alert('❌ Por favor, insira um código de ativação.');
    return;
  }
  
  if (ACTIVATION_CODES.includes(code)) {
    chrome.storage.local.set({ isPro: true, activationCode: code }, () => {
      alert('🎉 Código ativado com sucesso!\n\nVocê agora pode selecionar até 90 itens.');
      showProStatus(code);
      
      // Notifica a aba do Instagram para atualizar o botão
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'updateStatus'});
        }
      });
    });
  } else {
    alert('❌ Código inválido.');
  }
});