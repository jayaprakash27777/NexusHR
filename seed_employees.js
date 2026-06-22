const https = require('https');
const crypto = require('crypto');

const API_BASE = 'https://nexushr-fxe4.onrender.com/api/v1';
const AUTH_URL = 'https://nexushr-fxe4.onrender.com/api/auth/login';

// Admin Credentials
const ADMIN_EMAIL = 'admin@nexushr.com';
const ADMIN_PASSWORD = 'Admin@123';

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const designations = ['Software Engineer', 'Senior Developer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Specialist', 'HR Coordinator', 'Sales Associate', 'Financial Analyst', 'QA Engineer', 'DevOps Engineer', 'System Administrator', 'Customer Success Manager', 'Operations Analyst', 'Business Analyst'];

const departments = [];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[getRandomInt(0, arr.length - 1)];
}

function request(url, options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        console.log('Logging in...');
        const authResponse = await request(AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        const token = authResponse.accessToken || authResponse.data?.accessToken;
        if (!token) {
            throw new Error('Failed to get token from login response');
        }
        console.log('Logged in successfully.');

        console.log('Fetching departments...');
        let deptList = [];
        try {
            const deptResponse = await request(`${API_BASE}/departments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            deptList = deptResponse.data || deptResponse.content || [];
        } catch (e) {
            console.log('Failed to fetch departments. Proceeding without departments. Error:', e.message);
        }

        if (deptList.length === 0) {
            console.log('No departments found. We will create employees without departments or you can create departments first.');
        } else {
            console.log(`Found ${deptList.length} departments.`);
        }

        console.log('Generating 100 employees...');
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < 100; i++) {
            const firstName = getRandomItem(firstNames);
            const lastName = getRandomItem(lastNames);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(100, 999)}@nexushr.com`;
            const phone = `+1${getRandomInt(1000000000, 9999999999)}`;
            
            // Random joining date between 2 years ago and today
            const joiningDate = new Date(Date.now() - getRandomInt(0, 730) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            // Random birth date between 1970 and 2000
            const dob = new Date(new Date('1970-01-01').getTime() + getRandomInt(0, 11000) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const dept = deptList.length > 0 ? getRandomItem(deptList) : null;

            const payload = {
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dob,
                gender: getRandomItem(['Male', 'Female', 'Non-binary']),
                address: `${getRandomInt(100, 9999)} Main St, City, Country`,
                designation: getRandomItem(designations),
                salary: getRandomInt(50000, 150000),
                joiningDate: joiningDate,
                createUserAccount: false
            };

            if (dept) {
                payload.departmentId = dept.id;
            }

            try {
                await request(`${API_BASE}/employees`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }, payload);
                successCount++;
                process.stdout.write('.');
                
                // Small delay to prevent rate limiting
                await new Promise(r => setTimeout(r, 100));
            } catch (err) {
                console.error(`\nFailed to create employee ${email}:`, err.message);
                failCount++;
            }
        }

        console.log(`\nFinished generating employees. Success: ${successCount}, Failed: ${failCount}`);
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
