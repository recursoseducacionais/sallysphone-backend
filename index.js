const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração segura (variáveis de ambiente)
const TELEGRAM_BOT_TOKEN = '8943155913:AAGCo2fDdBcZ1CH-cnb-gbYkuikb_1G5mCU';
const TELEGRAM_CHAT_ID = '-1004485941880';

// Função para enviar mensagem ao Telegram
async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('Mensagem enviada ao Telegram');
  } catch (error) {
    console.error('Erro ao enviar para Telegram:', error.message);
  }
}

// Rota para receber aluno iniciando
app.post('/aluno-iniciou', async (req, res) => {
  const { nome, turma } = req.body;
  
  const message = 
    `🟢 <b>Aluno iniciou o trabalho</b>\n\n` +
    `👤 <b>Nome:</b> ${nome}\n` +
    `📚 <b>Turma:</b> ${turma}\n` +
    `⏰ <b>Hora:</b> ${new Date().toLocaleTimeString('pt-BR')}`;
  
  await sendTelegramMessage(message);
  res.json({ success: true });
});

// Rota para receber tentativa de sair
app.post('/tentativa-sair', async (req, res) => {
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
  
  await sendTelegramMessage(message);
  res.json({ success: true });
});

// Rota para receber finalização
app.post('/trabalho-finalizado', async (req, res) => {
  const { nome, turma, duracao, tentativas } = req.body;
  
  const message = 
    `✅ <b>TRABALHO FINALIZADO</b>\n\n` +
    `👤 <b>Aluno:</b> ${nome}\n` +
    `📚 <b>Turma:</b> ${turma}\n` +
    `⏱️ <b>Duração:</b> ${duracao} minutos\n` +
    `🚨 <b>Tentativas de sair:</b> ${tentativas}\n` +
    `⏰ <b>Terminou em:</b> ${new Date().toLocaleTimeString('pt-BR')}`;
  
  await sendTelegramMessage(message);
  res.json({ success: true });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    status: 'Backend Sally\'s Phone está rodando!',
    endpoints: ['/aluno-iniciou', '/tentativa-sair', '/trabalho-finalizado']
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
