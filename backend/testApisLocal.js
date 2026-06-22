const run = async () => {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nexushr.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.data) {
      console.log('Login failed', loginData);
      return;
  }
  const token = loginData.data.accessToken;

  const apis = ['/api/employees', '/api/departments', '/api/users'];
  
  for (const api of apis) {
    const res = await fetch(`http://localhost:8080${api}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`${api} - Status: ${res.status}`);
    if (res.status !== 200) {
      const text = await res.text();
      console.log(`Error body: ${text}`);
    } else {
        const body = await res.json();
        console.log(`Success length: ${body.data ? (Array.isArray(body.data) ? body.data.length : 'Object') : 'No Data'}`);
    }
  }
};
run();
