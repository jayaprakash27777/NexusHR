const bcrypt = require('bcryptjs');

const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const pw = 'Admin@123';

console.log('Matches:', bcrypt.compareSync(pw, hash));
console.log('New Hash:', bcrypt.hashSync(pw, 10));
