async function testServerExtract() {
  const res = await fetch('http://localhost:3000/api/extract-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formType: 'Admission Registration',
      documentText: 'Greenfield Public School Admission Form - Student Name: Aarav Sharma, Father: Vikram Sharma, DOB: 14/02/2010',
    }),
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Returned Data:', JSON.stringify(data, null, 2));
}

testServerExtract();
