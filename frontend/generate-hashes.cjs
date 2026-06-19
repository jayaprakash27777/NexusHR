const bcrypt = require('bcryptjs');
console.log('Admin@123:', bcrypt.hashSync('Admin@123', 10));
console.log('Manager@123:', bcrypt.hashSync('Manager@123', 10));
console.log('Employee@123:', bcrypt.hashSync('Employee@123', 10));
