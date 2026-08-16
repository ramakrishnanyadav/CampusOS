const { createWorker } = require('tesseract.js');

async function testTesseract() {
  console.log('Initializing Tesseract OCR worker...');
  try {
    const worker = await createWorker('eng');
    console.log('Worker initialized successfully!');
    await worker.terminate();
  } catch (e) {
    console.error('Tesseract error:', e);
  }
}

testTesseract();
