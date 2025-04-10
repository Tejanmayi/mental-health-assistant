require('dotenv').config();

module.exports = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || 'mental_health_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
}; 