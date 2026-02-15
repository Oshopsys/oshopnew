const https = require('https');
const fs = require('fs');

const PROJECT_REF = 'mzkrcbbatnzzfcbrtjot';
const ACCESS_TOKEN = 'sbp_68d2b096c4e8d482b5aee1b6b9a2317a3d9dcbbe';
const SQL_FILE_PATH = '/Users/zaki/.gemini/antigravity/brain/c37ef11b-dc37-4961-93b2-8ce2adb3bc73/enterprise_schema.sql';

function executeSql(query) {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/query`;

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log("SQL Execution Successful");
                    resolve(data);
                } else {
                    console.error(`Request Failed. Status: ${res.statusCode}`);
                    console.error("Response:", data);
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error("Request Error:", e);
            reject(e);
        });

        req.write(JSON.stringify({ query: query }));
        req.end();
    });
}

const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf8');
console.log(`Reading SQL file from ${SQL_FILE_PATH} (${sqlContent.length} bytes)...`);

executeSql(sqlContent)
    .then(result => console.log("Result:", result))
    .catch(err => console.error("Execution Failed"));
