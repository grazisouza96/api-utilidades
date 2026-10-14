const request = require('supertest');
const app = require('../server');

describe('Encurtador de links', () => {
  test('encurta uma URL válida e retorna código + link curto', async () => {
    const resp = await request(app)
      .post('/api/encurtar')
      .send({ url: 'https://www.exemplo.com/pagina-longa' });

    expect(resp.status).toBe(200);
    expect(resp.body.codigo).toHaveLength(7);
    expect(resp.body.urlCurta).toContain(`/r/${resp.body.codigo}`);
  });

  test('rejeita quando a URL não é informada', async () => {
    const resp = await request(app).post('/api/encurtar').send({});
    expect(resp.status).toBe(400);
    expect(resp.body.error).toBeTruthy();
  });

  test('rejeita uma URL com formato inválido', async () => {
    const resp = await request(app).post('/api/encurtar').send({ url: 'nao-e-uma-url' });
    expect(resp.status).toBe(400);
  });

  test('redireciona para a URL original ao acessar o link curto', async () => {
    const criado = await request(app)
      .post('/api/encurtar')
      .send({ url: 'https://www.exemplo.com/outra-pagina' });

    const resp = await request(app).get(`/r/${criado.body.codigo}`);
    expect(resp.status).toBe(302);
    expect(resp.headers.location).toBe('https://www.exemplo.com/outra-pagina');
  });

  test('retorna 404 para um código que não existe', async () => {
    const resp = await request(app).get('/r/codigo-invalido');
    expect(resp.status).toBe(404);
  });
});

describe('Gerador de senhas', () => {
  test('gera uma senha com o tamanho padrão (16)', async () => {
    const resp = await request(app).post('/api/senha').send({});
    expect(resp.status).toBe(200);
    expect(resp.body.senha).toHaveLength(16);
  });

  test('gera uma senha com tamanho customizado', async () => {
    const resp = await request(app).post('/api/senha').send({ tamanho: 24 });
    expect(resp.status).toBe(200);
    expect(resp.body.senha).toHaveLength(24);
  });

  test('rejeita tamanho fora do intervalo permitido', async () => {
    const resp = await request(app).post('/api/senha').send({ tamanho: 2 });
    expect(resp.status).toBe(400);
  });

  test('rejeita quando nenhum tipo de caractere é selecionado', async () => {
    const resp = await request(app).post('/api/senha').send({
      maiusculas: false, minusculas: false, numeros: false, simbolos: false
    });
    expect(resp.status).toBe(400);
  });

  test('gera senha somente com números quando só esse tipo é selecionado', async () => {
    const resp = await request(app).post('/api/senha').send({
      tamanho: 10, maiusculas: false, minusculas: false, numeros: true, simbolos: false
    });
    expect(resp.status).toBe(200);
    expect(resp.body.senha).toMatch(/^[0-9]{10}$/);
  });
});

describe('Gerador de QR Code', () => {
  test('gera uma imagem base64 a partir de um texto', async () => {
    const resp = await request(app).post('/api/qrcode').send({ texto: 'https://www.exemplo.com' });
    expect(resp.status).toBe(200);
    expect(resp.body.imagem).toMatch(/^data:image\/png;base64,/);
  });

  test('rejeita quando o texto não é informado', async () => {
    const resp = await request(app).post('/api/qrcode').send({});
    expect(resp.status).toBe(400);
  });
});

describe('Conversor de texto', () => {
  test('calcula hash SHA256 por padrão', async () => {
    const resp = await request(app).post('/api/hash').send({ texto: 'ola mundo' });
    expect(resp.status).toBe(200);
    expect(resp.body.resultado).toBe('2220622b62ffa648847c91cd587a22769b087bbd5837529ad54aae4d6d0b879f');
  });

  test('calcula hash MD5 quando informado', async () => {
    const resp = await request(app).post('/api/hash').send({ texto: 'ola mundo', algoritmo: 'md5' });
    expect(resp.status).toBe(200);
    expect(resp.body.resultado).toHaveLength(32);
  });

  test('rejeita algoritmo de hash inválido', async () => {
    const resp = await request(app).post('/api/hash').send({ texto: 'ola', algoritmo: 'sha512' });
    expect(resp.status).toBe(400);
  });

  test('codifica texto em Base64', async () => {
    const resp = await request(app).post('/api/base64').send({ texto: 'ola mundo' });
    expect(resp.status).toBe(200);
    expect(resp.body.resultado).toBe(Buffer.from('ola mundo').toString('base64'));
  });

  test('decodifica texto em Base64', async () => {
    const codificado = Buffer.from('ola mundo').toString('base64');
    const resp = await request(app).post('/api/base64').send({ texto: codificado, modo: 'decodificar' });
    expect(resp.status).toBe(200);
    expect(resp.body.resultado).toBe('ola mundo');
  });

  test('rejeita quando o texto não é informado', async () => {
    const resp = await request(app).post('/api/hash').send({});
    expect(resp.status).toBe(400);
  });
});
