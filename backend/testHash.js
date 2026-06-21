const bcrypt = require('bcryptjs');

const raw = 'Admin@123';
const hash = '$2b$10$ZOzD4VQPsuPbcjCVNETtaunmw4/VcgCsOPtEL.aEq0pdr9O.T/lRi';

console.log('Matches:', bcrypt.compareSync(raw, hash));
