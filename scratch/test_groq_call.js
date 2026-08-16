const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
console.log('Using Groq API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NONE');

async function testGroq() {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an OCR document analysis engine. Respond strictly with raw JSON object containing keys: document_metadata, extracted_data, review_and_validation, voice_confirmation_script.'
        },
        {
          role: 'user',
          content: 'Analyze this sample admission form document. Extract student name, school name, DOB, father name, class into extracted_data.'
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  console.log('Status:', response.status);
  const json = await response.json();
  console.log('Response:', JSON.stringify(json, null, 2));
}

testGroq();
