import express from 'express';
import pkg from 'pg';
import { pipeline } from '@xenova/transformers';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

// Initialize the model
let model = null;
async function initializeModel() {
    if (!model) {
        model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return model;
}

// Function to get embeddings using the local model
async function getEmbeddings(text) {
    const model = await initializeModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

// Function to calculate cosine similarity
function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Search endpoint
router.post('/', async (req, res) => {
    const { query } = req.body;
    
    try {
        // Get embeddings for the search query
        const queryEmbedding = await getEmbeddings(query);
        
        // Perform combined search
        const searchQuery = `
            WITH semantic_search AS (
                SELECT 
                    id,
                    patient_name,
                    age,
                    gender,
                    risk_level,
                    confidence,
                    key_findings,
                    recommendations,
                    created_at,
                    embeddings <=> $1::vector AS similarity
                FROM predictions
                WHERE embeddings IS NOT NULL
                ORDER BY similarity ASC
                LIMIT 5
            ),
            text_search AS (
                SELECT 
                    id,
                    patient_name,
                    age,
                    gender,
                    risk_level,
                    confidence,
                    key_findings,
                    recommendations,
                    created_at,
                    ts_rank(to_tsvector('english', search_text), plainto_tsquery('english', $2)) AS rank
                FROM predictions
                WHERE to_tsvector('english', search_text) @@ plainto_tsquery('english', $2)
                ORDER BY rank DESC
                LIMIT 5
            )
            SELECT * FROM (
                SELECT * FROM semantic_search
                UNION
                SELECT 
                    id,
                    patient_name,
                    age,
                    gender,
                    risk_level,
                    confidence,
                    key_findings,
                    recommendations,
                    created_at,
                    1 - similarity AS rank
                FROM text_search
            ) combined_results
            ORDER BY rank DESC
            LIMIT 10;
        `;

        const result = await pool.query(searchQuery, [queryEmbedding, query]);
        
        res.json({
            success: true,
            results: result.rows.map(row => ({
                id: row.id,
                patientName: row.patient_name,
                age: row.age,
                gender: row.gender,
                riskLevel: row.risk_level,
                confidence: row.confidence,
                keyFindings: row.key_findings,
                recommendations: row.recommendations,
                date: row.created_at
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Error performing search'
        });
    }
});

export default router; 