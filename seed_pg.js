const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
    connectionString: 'postgres://neondb_owner:npg_jrp3gwiEB9eY@ep-aged-brook-athg9sig.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const designations = ['Software Engineer', 'Senior Developer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Specialist', 'HR Coordinator', 'Sales Associate', 'Financial Analyst', 'QA Engineer'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[getRandomInt(0, arr.length - 1)];
}

async function run() {
    try {
        console.log('Connecting to Neon DB...');
        await client.connect();
        console.log('Connected!');

        console.log('Fetching departments...');
        const resDept = await client.query('SELECT id FROM departments');
        const deptIds = resDept.rows.map(r => r.id);
        console.log(`Found ${deptIds.length} departments.`);

        console.log('Fetching next sequence val...');
        const resSeq = await client.query("SELECT nextval('employee_id_seq')");
        let startSeq = parseInt(resSeq.rows[0].nextval);

        console.log('Inserting 100 employees...');
        let success = 0;
        let queryStr = 'INSERT INTO employees (id, employee_id, first_name, last_name, email, phone, date_of_birth, gender, address, department_id, designation, salary, joining_date, status) VALUES ';
        const values = [];
        let valIndex = 1;

        for (let i = 0; i < 100; i++) {
            const firstName = getRandomItem(firstNames);
            const lastName = getRandomItem(lastNames);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(100, 9999)}@nexushr.com`;
            const phone = `+1${getRandomInt(1000000000, 9999999999)}`;
            const joiningDate = new Date(Date.now() - getRandomInt(0, 730) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dob = new Date(new Date('1970-01-01').getTime() + getRandomInt(0, 11000) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const deptId = deptIds.length > 0 ? getRandomItem(deptIds) : null;
            const empIdStr = `NHR-${startSeq++}`;

            queryStr += `($${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++}, $${valIndex++})`;
            if (i < 99) queryStr += ', ';

            values.push(
                crypto.randomUUID(), // id
                empIdStr, // employee_id
                firstName,
                lastName,
                email,
                phone,
                dob,
                getRandomItem(['Male', 'Female', 'Non-binary']),
                `${getRandomInt(100, 9999)} Main St, City`,
                deptId, // department_id
                getRandomItem(designations),
                getRandomInt(50000, 150000), // salary
                joiningDate,
                'ACTIVE'
            );
        }

        await client.query(queryStr, values);
        
        // Update sequence
        await client.query(`SELECT setval('employee_id_seq', ${startSeq})`);
        
        console.log('Successfully inserted 100 employees!');

    } catch (e) {
        console.error('Error inserting employees:', e);
    } finally {
        await client.end();
    }
}

run();
