const { Pool } = require('pg');
const { pipeline } = require('@xenova/transformers');
require('dotenv').config();

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

async function generateEmbeddings() {
    try {
        // Initialize the model
        const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        // Get all records that need embeddings
        const { rows } = await pool.query(`
            SELECT id, search_text 
            FROM predictions 
            WHERE embeddings IS NULL 
            AND search_text IS NOT NULL
        `);

        console.log(`Found ${rows.length} records to process`);

        // Process each record
        for (const row of rows) {
            try {
                // Generate embedding
                const output = await model(row.search_text, { pooling: 'mean', normalize: true });
                const embedding = Array.from(output.data);

                // Update the record with the embedding
                await pool.query(
                    'UPDATE predictions SET embeddings = $1 WHERE id = $2',
                    [embedding, row.id]
                );

                console.log(`Processed record ${row.id}`);
            } catch (error) {
                console.error(`Error processing record ${row.id}:`, error);
            }
        }

        console.log('Embedding generation complete');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

generateEmbeddings(); 