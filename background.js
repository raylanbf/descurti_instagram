// Listener para mensagens (caso precise no futuro)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPro') {
    chrome.storage.local.get(['isPro'], (data) => {
      sendResponse({ isPro: data.isPro || false });
    });
    return true; // Mantém o canal aberto para resposta assíncrona
  }
});

console.log('Instagram Auto Selector - Background worker ativo');