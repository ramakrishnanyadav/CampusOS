async function testHealth() {
  const res = await fetch('http://localhost:3000/api/health');
  console.log('Status:', res.status);
  console.log('Body:', await res.json());
}
testHealth();
