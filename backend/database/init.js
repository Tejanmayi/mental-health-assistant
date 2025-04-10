const { Pool } = require('pg');
const config = require('./config');
const mongoose = require('mongoose');

// Initialize PostgreSQL
async function initPostgres() {
  const pool = new Pool(config.postgres);
  
  try {
    // Create patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(50),
        contact_info JSONB,
        medical_history JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        session_date TIMESTAMP NOT NULL,
        duration INTEGER,
        notes TEXT,
        mood_rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create assessments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        session_id INTEGER REFERENCES sessions(id),
        assessment_type VARCHAR(100) NOT NULL,
        score INTEGER,
        results JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
      CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
      CREATE INDEX IF NOT EXISTS idx_assessments_patient_id ON assessments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
    `);

    console.log('PostgreSQL tables and indexes created successfully');
  } catch (error) {
    console.error('Error initializing PostgreSQL:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Initialize MongoDB
async function initMongoDB() {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('MongoDB connected successfully');

    // Create indexes for MongoDB collections
    await mongoose.model('ChatHistory').createIndexes();
    await mongoose.model('Transcript').createIndexes();
    await mongoose.model('LLMResponseLog').createIndexes();

    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
}

// Run initialization
async function initialize() {
  try {
    await initPostgres();
    await initMongoDB();
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initialize(); 