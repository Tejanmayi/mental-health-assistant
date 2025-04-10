const { MongoClient } = require('mongodb');
require('dotenv').config();

async function initMongoDB() {
    const uri = 'mongodb+srv://tejanmayi:tiger@cluster0.t2zpqwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        retryWrites: true,
        retryReads: true
    });

    try {
        console.log('Attempting to connect to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas');

        const db = client.db('mental_health');
        console.log('Using database: mental_health');

        // Create ml_models collection
        console.log('Creating ml_models collection...');
        await db.createCollection('ml_models');
        await db.collection('ml_models').createIndexes([
            { key: { name: 1 }, unique: true },
            { key: { version: 1 } }
        ]);
        console.log('ML models collection and indexes created');

        // Create model_metrics collection
        console.log('Creating model_metrics collection...');
        await db.createCollection('model_metrics');
        await db.collection('model_metrics').createIndexes([
            { key: { model_id: 1 } },
            { key: { timestamp: -1 } }
        ]);
        console.log('Model metrics collection and indexes created');

        console.log('All MongoDB collections and indexes created successfully');
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

// Add error handling for the main execution
initMongoDB().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 