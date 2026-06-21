const login = async () => {
  try {
    const res = await fetch('https://nexushr-fxe4.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nexushr.com', password: 'Admin@123' })
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
  } catch (e) {
    console.error('Error:', e);
  }
};
login();
