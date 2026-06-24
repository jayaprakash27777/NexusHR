async function testLogin() {
  try {
    
    console.log("\nTesting remote backend login...");
    const res2 = await fetch('https://nexushr-fxe4.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nexushr.com', password: 'Admin@123' })
    });
    const text2 = await res2.text();
    console.log("Remote HTTP Status:", res2.status);
    console.log("Remote Response:", text2);
    
  } catch (err) {
    console.error(err);
  }
}

testLogin();
