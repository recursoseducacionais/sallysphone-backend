const express = require('express');
const axios = require('axios');
const cors = require('cors');
 
const app = express();
 
// CORS configurado
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false,
  optionsSuccessStatus: 200
}));
 
app.use(express.json());
 
// Configuração - CUIDADO COM EXPOSIÇÃO
const TELEGRAM_BOT_TOKEN = '8943155913:AAGCo2fDdBcZ1CH-cnb-gbYkuikb_1G5mCU';
const TELEGRAM_CHAT_ID = '-1004485941880';
 
console.log('=== BACKEND INICIADO ===');
console.log('Token:', TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');
console.log('Chat ID:', TELEGRAM_CHAT_ID);
console.log('======================');
 
// Função para enviar mensagem ao Telegram com logs
async function sendTelegramMessage(message) {
  try {
    console.log('\n📤 Tentando enviar mensagem...');
    console.log('Chat ID:', TELEGRAM_CHAT_ID);
    console.log('Mensagem:', message.substring(0, 50) + '...');
 
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    console.log('URL:', url.substring(0, 50) + '...');
 
    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    }, {
      timeout: 5000 // 5 segundos de timeout
    });
 
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('Telegram response:', response.data);
    return true;
 
  } catch (error) {
    console.error('❌ ERRO ao enviar para Telegram:');
    
    if (error.response) {
      // Erro da API do Telegram
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request foi feito mas sem resposta
      console.error('Nenhuma resposta do Telegram');
      console.error('Request:', error.request);
    } else {
      // Erro ao configurar a request
      console.error('Erro:', error.message);
    }
    
    return false;
  }
}
 
// Rota para receber aluno iniciando
app.post('/aluno-iniciou', async (req, res) => {
  try {
    console.log('\n📨 [POST /aluno-iniciou]');
    console.log('Body recebido:', req.body);
 
    const { nome, turma } = req.body;
    
    if (!nome || !turma) {
      console.error('❌ Nome ou turma ausentes');
      return res.status(400).json({ error: 'Nome ou turma ausentes' });
    }
 
    const message = 
      `🟢 <b>Aluno iniciou o trabalho</b>\n\n` +
      `👤 <b>Nome:</b> ${nome}\n` +
      `📚 <b>Turma:</b> ${turma}\n` +
      `⏰ <b>Hora:</b> ${new Date().toLocaleTimeString('pt-BR')}`;
 
    const success = await sendTelegramMessage(message);
    
    res.json({ 
      success: success,
      message: 'Notificação processada',
      telegramSent: success 
    });
  } catch (error) {
    console.error('❌ Erro em /aluno-iniciou:', error.message);
    res.status(500).json({ error: error.message });
  }
});
 
// Rota para receber tentativa de sair
app.post('/tentativa-sair', async (req, res) => {
  try {
    console.log('\n📨 [POST /tentativa-sair]');
    console.log('Body recebido:', req.body);
 
    const { nome, turma, tipo, numero } = req.body;
 
    let typeEmoji = '⚠️';
    let typeText = 'Desconhecido';
    
    if (tipo === 'beforeunload') {
      typeEmoji = '❌';
      typeText = 'Tentativa de sair (fechar aba)';
    } else if (tipo === 'tab-hidden') {
      typeEmoji = '👁️';
      typeText = 'Mudou de aba';
    } else if (tipo === 'back-button') {
      typeEmoji = '⬅️';
      typeText = 'Clicou botão voltar';
    }
 
    const message = 
      `${typeEmoji} <b>ALERTA: ${typeText}</b>\n\n` +
      `👤 <b>Aluno:</b> ${nome}\n` +
      `📚 <b>Turma:</b> ${turma}\n` +
      `🔢 <b>Tentativa:</b> ${numero}\n` +
      `⏰ <b>Hora:</b> ${new Date().toLocaleTimeString('pt-BR')}`;
 
    const success = await sendTelegramMessage(message);
    
    res.json({ 
      success: success,
      message: 'Alerta processado',
      telegramSent: success 
    });
  } catch (error) {
    console.error('❌ Erro em /tentativa-sair:', error.message);
    res.status(500).json({ error: error.message });
  }
});
 
// Rota para receber finalização
app.post('/trabalho-finalizado', async (req, res) => {
  try {
    console.log('\n📨 [POST /trabalho-finalizado]');
    console.log('Body recebido:', req.body);
 
    const { nome, turma, duracao, tentativas } = req.body;
 
    const message = 
      `✅ <b>TRABALHO FINALIZADO</b>\n\n` +
      `👤 <b>Aluno:</b> ${nome}\n` +
      `📚 <b>Turma:</b> ${turma}\n` +
      `⏱️ <b>Duração:</b> ${duracao} minutos\n` +
      `🚨 <b>Tentativas de sair:</b> ${tentativas}\n` +
      `⏰ <b>Terminou em:</b> ${new Date().toLocaleTimeString('pt-BR')}`;
 
    const success = await sendTelegramMessage(message);
    
    res.json({ 
      success: success,
      message: 'Finalização processada',
      telegramSent: success 
    });
  } catch (error) {
    console.error('❌ Erro em /trabalho-finalizado:', error.message);
    res.status(500).json({ error: error.message });
  }
});
 
// Rota de teste
app.get('/', (req, res) => {
  console.log('\n📨 [GET /]');
  res.json({ 
    status: 'Backend Sally\'s Phone está rodando!',
    endpoints: ['/aluno-iniciou', '/tentativa-sair', '/trabalho-finalizado'],
    timestamp: new Date().toISOString()
  });
});
 
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`\n=== PRONTO PARA RECEBER REQUISIÇÕES ===\n`);
});
