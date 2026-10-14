# API de Utilidades

🔗 **Demo ao vivo:** https://api-utilidades-94h2.onrender.com
📘 **Documentação interativa (Swagger):** https://api-utilidades-94h2.onrender.com/api-docs
*(o plano gratuito "dorme" após um tempo sem uso — o primeiro acesso pode levar ~50s para carregar)*

Servidor em Node.js/Express com quatro funcionalidades:

- 🔗 **Encurtador de links** — `POST /api/encurtar`, redirecionamento em `GET /r/:codigo`
- 🔐 **Gerador de senhas seguras** — `POST /api/senha`
- 🔲 **Gerador de QR Code** — `POST /api/qrcode`
- 🧩 **Conversor de texto** (hash MD5/SHA1/SHA256, Base64) — `POST /api/hash` e `POST /api/base64`

Inclui uma interface web simples em `public/` para testar tudo pelo navegador.

## Como executar

```bash
npm install
npm start
```

Depois acesse **http://localhost:3001**.

## Testes automatizados

O projeto tem uma suíte de testes (Jest + Supertest) cobrindo as 4 funcionalidades, incluindo casos de erro (dados inválidos, campos obrigatórios faltando, etc).

```bash
npm test
```

## Observação

Os links encurtados ficam guardados em arquivo (`data/links.json`), sobrevivendo a reinícios do servidor. No plano gratuito do Render, porém, o disco é temporário: os links somem quando a plataforma reconstrói o serviço (a cada novo deploy, por exemplo). Rodando localmente, a persistência funciona normalmente entre reinícios.
