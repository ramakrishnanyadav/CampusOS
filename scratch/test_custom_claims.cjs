async function testCustomClaimsEndpoint() {
  // First obtain an ADMIN elevation token
  const elevateRes = await fetch('http://localhost:3000/api/auth/elevate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_ELEVATION_PASSWORD || 'admin123' }),
  });
  const elevateData = await elevateRes.json();
  console.log('Elevate Status:', elevateRes.status);
  console.log('Elevate Response:', elevateData);

  if (!elevateData.elevationToken) {
    console.error('Failed to obtain elevation token');
    return;
  }

  // Now test custom claims assignment
  const claimRes = await fetch('http://localhost:3000/api/admin/users/user-123/role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${elevateData.elevationToken}`,
    },
    body: JSON.stringify({ role: 'ADMIN', orgId: 'org-campusos-2026' }),
  });
  console.log('Claims Endpoint Status:', claimRes.status);
  console.log('Claims Endpoint Body:', await claimRes.json());
}

testCustomClaimsEndpoint();
