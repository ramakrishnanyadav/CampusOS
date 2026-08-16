const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

async function listModels() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  console.log('Groq Models:', data.data ? data.data.map(m => m.id) : data);
}

listModels();
