const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://tejanmayi:<db_password>@cluster0.t2zpqwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Chat History Schema
const chatHistorySchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    sessionId: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    metadata: {
        startTime: { type: Date, default: Date.now },
        endTime: Date,
        duration: Number,
        mood: String,
        topics: [String]
    }
}, { timestamps: true });

// Transcript Schema
const transcriptSchema = new mongoose.Schema({
    patientId: { type: String, required: true },
    sessionId: { type: String, required: true },
    content: { type: String, required: true },
    metadata: {
        duration: Number,
        wordCount: Number,
        sentiment: {
            score: Number,
            label: String
        },
        keyPhrases: [String],
        entities: [{
            text: String,
            type: String,
            relevance: Number
        }]
    }
}, { timestamps: true });

// LLM Response Log Schema
const llmResponseLogSchema = new mongoose.Schema({
    requestId: { type: String, required: true },
    patientId: { type: String, required: true },
    input: { type: String, required: true },
    response: { type: String, required: true },
    metadata: {
        model: String,
        tokens: Number,
        processingTime: Number,
        confidence: Number,
        context: [String]
    }
}, { timestamps: true });

// Create models
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
const Transcript = mongoose.model('Transcript', transcriptSchema);
const LLMResponseLog = mongoose.model('LLMResponseLog', llmResponseLogSchema);

module.exports = {
    ChatHistory,
    Transcript,
    LLMResponseLog
}; 