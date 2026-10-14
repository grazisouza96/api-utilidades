const path = require('path');
const crypto = require('crypto');
const express = require('express');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================== ENCURTADOR DE LINKS =====================
// Guardado em memória: os links somem quando o servidor reinicia.
const links = new Map();

app.post('/api/encurtar', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Informe uma URL.' });
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida. Inclua o http:// ou https://' });
  }

  const codigo = nanoid(7);
  links.set(codigo, { url, criadoEm: new Date().toISOString(), acessos: 0 });
  res.json({ codigo, urlCurta: `${req.protocol}://${req.get('host')}/r/${codigo}` });
});

app.get('/api/links', (req, res) => {
  const lista = [...links.entries()].map(([codigo, dados]) => ({ codigo, ...dados }));
  res.json(lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)));
});

app.get('/r/:codigo', (req, res) => {
  const link = links.get(req.params.codigo);
  if (!link) return res.status(404).send('Link não encontrado.');
  link.acessos += 1;
  res.redirect(link.url);
});

// ===================== GERADOR DE SENHAS =====================
app.post('/api/senha', (req, res) => {
  const {
    tamanho = 16,
    maiusculas = true,
    minusculas = true,
    numeros = true,
    simbolos = true
  } = req.body;

  const n = Number(tamanho);
  if (!Number.isInteger(n) || n < 4 || n > 128) {
    return res.status(400).json({ error: 'Escolha um tamanho entre 4 e 128.' });
  }

  const conjuntos = [];
  if (maiusculas) conjuntos.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (minusculas) conjuntos.push('abcdefghijklmnopqrstuvwxyz');
  if (numeros) conjuntos.push('0123456789');
  if (simbolos) conjuntos.push('!@#$%^&*()_-+=?');

  if (conjuntos.length === 0) {
    return res.status(400).json({ error: 'Selecione ao menos um tipo de caractere.' });
  }

  const alfabeto = conjuntos.join('');
  const bytes = crypto.randomBytes(n);
  let senha = '';
  for (let i = 0; i < n; i++) {
    senha += alfabeto[bytes[i] % alfabeto.length];
  }

  res.json({ senha });
});

// ===================== GERADOR DE QR CODE =====================
app.post('/api/qrcode', async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'Informe o texto ou link para gerar o QR Code.' });
  try {
    const dataUrl = await QRCode.toDataURL(texto, { width: 320, margin: 1 });
    res.json({ imagem: dataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Não foi possível gerar o QR Code.' });
  }
});

// ===================== CONVERSOR DE TEXTO =====================
app.post('/api/hash', (req, res) => {
  const { texto, algoritmo = 'sha256' } = req.body;
  if (!texto) return res.status(400).json({ error: 'Informe o texto.' });
  if (!['md5', 'sha1', 'sha256'].includes(algoritmo)) {
    return res.status(400).json({ error: 'Algoritmo inválido.' });
  }
  const resultado = crypto.createHash(algoritmo).update(texto).digest('hex');
  res.json({ resultado });
});

app.post('/api/base64', (req, res) => {
  const { texto, modo = 'codificar' } = req.body;
  if (!texto) return res.status(400).json({ error: 'Informe o texto.' });
  try {
    const resultado = modo === 'decodificar'
      ? Buffer.from(texto, 'base64').toString('utf8')
      : Buffer.from(texto, 'utf8').toString('base64');
    res.json({ resultado });
  } catch {
    res.status(400).json({ error: 'Não foi possível processar o texto informado.' });
  }
});

app.listen(PORT, () => {
  console.log(`API de Utilidades rodando em http://localhost:${PORT}`);
});
