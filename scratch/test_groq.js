import dotenv from 'dotenv';
dotenv.config();

const GROQ_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

async function listGroqModels() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
  });

  const data = await res.json();
  console.log('AVAILABLE GROQ MODELS:', data.data ? data.data.map(m => m.id) : data);
}

listGroqModels();
