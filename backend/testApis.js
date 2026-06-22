const run = async () => {
  const loginRes = await fetch('https://nexushr-fxe4.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nexushr.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;

  const apis = ['/api/employees', '/api/departments', '/api/users'];
  
  for (const api of apis) {
    const res = await fetch(`https://nexushr-fxe4.onrender.com${api}`, {
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
