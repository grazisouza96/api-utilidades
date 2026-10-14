async function api(caminho, body) {
  const resp = await fetch(caminho, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const dados = await resp.json();
  if (!resp.ok) throw new Error(dados.error || 'Ocorreu um erro.');
  return dados;
}

function mostrarResultado(elId, conteudoHtml, erro = false) {
  const el = document.getElementById(elId);
  el.classList.toggle('erro', erro);
  el.innerHTML = conteudoHtml;
}

// ===================== ENCURTADOR =====================
async function carregarLinks() {
  const resp = await fetch('/api/links');
  const links = await resp.json();
  const lista = document.getElementById('lista-links');
  lista.innerHTML = links.map((l) => `
    <li><a href="/r/${l.codigo}" target="_blank">/r/${l.codigo}</a> → ${l.url} (${l.acessos} acesso${l.acessos === 1 ? '' : 's'})</li>
  `).join('') || '<li>Nenhum link ainda.</li>';
}

document.getElementById('form-encurtar').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('encurtar-url').value.trim();
  try {
    const { urlCurta } = await api('/api/encurtar', { url });
    mostrarResultado('encurtar-resultado', `Link criado: <a href="${urlCurta}" target="_blank">${urlCurta}</a>`);
    document.getElementById('encurtar-url').value = '';
    await carregarLinks();
  } catch (err) {
    mostrarResultado('encurtar-resultado', err.message, true);
  }
});
carregarLinks();

// ===================== SENHAS =====================
document.getElementById('form-senha').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    tamanho: Number(document.getElementById('senha-tamanho').value),
    maiusculas: document.getElementById('senha-maiusculas').checked,
    minusculas: document.getElementById('senha-minusculas').checked,
    numeros: document.getElementById('senha-numeros').checked,
    simbolos: document.getElementById('senha-simbolos').checked
  };
  try {
    const { senha } = await api('/api/senha', payload);
    mostrarResultado('senha-resultado', senha);
  } catch (err) {
    mostrarResultado('senha-resultado', err.message, true);
  }
});

// ===================== QR CODE =====================
document.getElementById('form-qrcode').addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = document.getElementById('qrcode-texto').value.trim();
  try {
    const { imagem } = await api('/api/qrcode', { texto });
    mostrarResultado('qrcode-resultado', `<img src="${imagem}" alt="QR Code" width="200" />`);
  } catch (err) {
    mostrarResultado('qrcode-resultado', err.message, true);
  }
});

// ===================== CONVERSOR =====================
document.querySelectorAll('#form-conversor [data-acao]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const texto = document.getElementById('conversor-texto').value;
    if (!texto) {
      mostrarResultado('conversor-resultado', 'Digite um texto primeiro.', true);
      return;
    }
    const acao = btn.getAttribute('data-acao');
    try {
      let resultado;
      if (acao.startsWith('hash-')) {
        ({ resultado } = await api('/api/hash', { texto, algoritmo: acao.replace('hash-', '') }));
      } else {
        ({ resultado } = await api('/api/base64', { texto, modo: acao.replace('base64-', '') }));
      }
      mostrarResultado('conversor-resultado', resultado);
    } catch (err) {
      mostrarResultado('conversor-resultado', err.message, true);
    }
  });
});
