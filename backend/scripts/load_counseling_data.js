import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function loadData() {
  const client = await pool.connect();
  
  try {
    // Read and parse the CSV file
    const csvFilePath = path.join(__dirname, 'counseling_data.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Insert data into the table
    for (const record of records) {
      await client.query(
        `INSERT INTO counseling_responses 
         (prompt, hq1, hq2, mq1, lq1, lq2, lq3, lq4, lq5, is_depression)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          record.prompt,
          record.hq1,
          record.hq2,
          record.mq1,
          record.lq1,
          record.lq2,
          record.lq3,
          record.lq4,
          record.lq5,
          record.is_depression === '1' // Convert string '1' to boolean true
        ]
      );
    }

    console.log(`Successfully loaded ${records.length} records into counseling_responses table`);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

loadData(); 