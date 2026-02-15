const https = require('https');
const fs = require('fs');
const { Client } = require('pg');

const PROJECT_REF = 'mzkrcbbatnzzfcbrtjot';
const ACCESS_TOKEN = 'sbp_68d2b096c4e8d482b5aee1b6b9a2317a3d9dcbbe';
const NEW_DB_PASSWORD = 'StrongPass_' + Math.random().toString(36).slice(-10) + '!';
const SQL_FILE_PATH = '/Users/zaki/.gemini/antigravity/brain/c37ef11b-dc37-4961-93b2-8ce2adb3bc73/enterprise_schema.sql';

// 1. Reset Password
function resetPassword() {
    console.log("Resetting Database Password...");
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database/password`;
    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode === 200) {
                console.log("Password Reset Successful.");
                resolve();
            } else {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => reject(new Error(`Password Reset Failed: ${res.statusCode} ${data}`)));
            }
        });
        req.write(JSON.stringify({ password: NEW_DB_PASSWORD }));
        req.end();
    });
}

// 2. Deploy Schema
async function deploySchema() {
    // Wait a bit for password propagation
    console.log("Waiting 5s for password propagation...");
    await new Promise(r => setTimeout(r, 5000));

    const client = new Client({
        host: `db.${PROJECT_REF}.supabase.co`,
        port: 5432,
        user: 'postgres',
        password: NEW_DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        console.log("Connecting to PostgreSQL...");
        await client.connect();

        const sql = fs.readFileSync(SQL_FILE_PATH, 'utf8');
        console.log("Executing Schema...");

        await client.query(sql);
        console.log("✅ Schema Deployed Successfully!");

        await client.end();
    } catch (e) {
        console.error("❌ Deployment Failed:", e);
        if (client) client.end();
    }
}

// Execute
resetPassword()
    .then(deploySchema)
    .catch(console.error);
