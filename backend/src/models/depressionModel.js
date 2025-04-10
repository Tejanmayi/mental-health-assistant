import { HfInference } from '@huggingface/inference';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Simple depression prediction model using text similarity
class DepressionModel {
  constructor() {
    this.pgPool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });
    
    this.trainingData = [];
    this.initialize();

    // Common depression symptoms and their severity
    this.symptoms = {
      'sad': { severity: 2, category: 'mood' },
      'hopeless': { severity: 3, category: 'mood' },
      'worthless': { severity: 3, category: 'self-perception' },
      'guilt': { severity: 2, category: 'self-perception' },
      'sleep': { severity: 2, category: 'physical' },
      'appetite': { severity: 2, category: 'physical' },
      'fatigue': { severity: 2, category: 'physical' },
      'concentration': { severity: 2, category: 'cognitive' },
      'interest': { severity: 3, category: 'behavioral' },
      'suicidal': { severity: 4, category: 'risk' }
    };

    // Treatment recommendations based on symptom categories
    this.recommendations = {
      'mood': [
        'Consider cognitive behavioral therapy to address negative thought patterns',
        'Regular exercise and outdoor activities may help improve mood',
        'Mindfulness meditation could help manage emotional fluctuations'
      ],
      'self-perception': [
        'Self-esteem building exercises and positive affirmations',
        'Therapy focused on self-worth and personal value',
        'Journaling to track and challenge negative self-perceptions'
      ],
      'physical': [
        'Establish regular sleep hygiene practices',
        'Nutritional counseling to address appetite changes',
        'Gradual increase in physical activity to combat fatigue'
      ],
      'cognitive': [
        'Cognitive exercises to improve concentration',
        'Memory and focus training techniques',
        'Structured daily routines to support cognitive function'
      ],
      'behavioral': [
        'Behavioral activation therapy to increase engagement in activities',
        'Social skills training and gradual exposure to social situations',
        'Activity scheduling to rebuild interest in hobbies'
      ],
      'risk': [
        'Immediate psychiatric evaluation recommended',
        'Safety planning and crisis intervention',
        'Regular check-ins and monitoring of risk factors'
      ]
    };
  }

  async initialize() {
    try {
      // Initialize Hugging Face inference with proper token
      if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
      }
      
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      
      // Test database connection
      try {
        const client = await this.pgPool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        throw new Error(`Failed to connect to database: ${dbError.message}`);
      }
      
      // Load training data from database
      const result = await this.pgPool.query('SELECT * FROM counseling_responses');
      this.trainingData = result.rows;
      
      console.log('Model initialized successfully');
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    }
  }

  async analyzeWithLLM(clinicalNotes) {
    try {
      console.log('Starting LLM analysis...');
      
      const prompt = `Analyze the following clinical notes for depression risk assessment. 
        Provide a detailed analysis in JSON format with the following structure:
        {
          "riskLevel": "low/medium/high",
          "confidenceScore": number between 0-100,
          "keyFindings": ["list of key findings"],
          "recommendations": ["list of recommendations"]
        }
        
        Clinical Notes: ${clinicalNotes}`;

      console.log('Sending request to Hugging Face...');
      const response = await this.hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          return_full_text: false,
          temperature: 0.7,
          top_p: 0.95
        }
      });

      console.log('Received response from Hugging Face:', response);

      if (!response || !response.generated_text) {
        console.log('No valid response from LLM, falling back to simple analysis');
        return this.simpleTextAnalysis(clinicalNotes);
      }

      try {
        // Extract JSON from the response
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON found in response');
          return this.simpleTextAnalysis(clinicalNotes);
        }

        const result = JSON.parse(jsonMatch[0]);
        console.log('Parsed result:', result);
        
        return {
          riskLevel: result.riskLevel || 'unknown',
          confidenceScore: result.confidenceScore || 0,
          keyFindings: result.keyFindings || [],
          recommendations: result.recommendations || []
        };
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        console.error('Raw response:', response.generated_text);
        return this.simpleTextAnalysis(clinicalNotes);
      }
    } catch (error) {
      console.error('Error in analyzeWithLLM:', error);
      if (error.message.includes('401')) {
        console.error('Authentication error: Please check your Hugging Face API token permissions');
      }
      return this.simpleTextAnalysis(clinicalNotes);
    }
  }

  // Simple text analysis fallback
  simpleTextAnalysis(text) {
    const positiveWords = ['good', 'better', 'improve', 'positive', 'well', 'progress', 'recovery', 'stable', 'manage', 'cope'];
    const negativeWords = ['sad', 'hopeless', 'depressed', 'anxious', 'worried', 'stress', 'overwhelm', 'fatigue', 'tired', 'sleep', 'insomnia', 'appetite', 'weight', 'concentration', 'focus', 'memory', 'worthless', 'guilt', 'suicidal', 'death', 'die', 'pain', 'ache', 'headache', 'stomach', 'nausea', 'dizzy', 'isolate', 'alone', 'withdraw', 'avoid'];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const positivePhrases = sentences.filter(sentence => 
      positiveWords.some(word => sentence.toLowerCase().includes(word))
    );
    
    const negativePhrases = sentences.filter(sentence => 
      negativeWords.some(word => sentence.toLowerCase().includes(word))
    );

    const depressionScore = negativePhrases.length / (negativePhrases.length + positivePhrases.length) * 100;
    const confidence = Math.round(depressionScore);

    return {
      riskLevel: this.determineRiskLevel(confidence),
      confidenceScore: confidence,
      keyFindings: this.generateKeyFindings(positivePhrases, negativePhrases),
      recommendations: this.generateRecommendations(positivePhrases, negativePhrases)
    };
  }

  generateKeyFindings(positivePhrases, negativePhrases) {
    const findings = [];

    if (negativePhrases.length === 0 && positivePhrases.length === 0) {
      findings.push('No clear emotional indicators detected in the clinical notes');
      return findings;
    }

    if (negativePhrases.length > 0) {
      findings.push(`Patient shows ${negativePhrases.length > 5 ? 'severe' : negativePhrases.length > 2 ? 'moderate' : 'mild'} symptoms of emotional distress`);
      
      // Group symptoms by category
      const categories = {
        mood: negativePhrases.filter(p => 
          p.toLowerCase().includes('sad') || 
          p.toLowerCase().includes('hopeless')
        ),
        sleep: negativePhrases.filter(p => 
          p.toLowerCase().includes('sleep') || 
          p.toLowerCase().includes('insomnia')
        ),
        cognitive: negativePhrases.filter(p => 
          p.toLowerCase().includes('concentration') || 
          p.toLowerCase().includes('focus')
        )
      };

      Object.entries(categories).forEach(([category, phrases]) => {
        if (phrases.length > 0) {
          findings.push(`Notable ${category} symptoms: ${phrases.join('; ')}`);
        }
      });
    }

    if (positivePhrases.length > 0) {
      findings.push(`Positive indicators: ${positivePhrases.join('; ')}`);
    }

    return findings;
  }

  generateRecommendations(positivePhrases, negativePhrases) {
    const recommendations = new Set();

    if (negativePhrases.length === 0 && positivePhrases.length === 0) {
      recommendations.add('Continue regular monitoring and check-ins');
      return Array.from(recommendations);
    }

    // Add recommendations based on negative phrases
    if (negativePhrases.some(phrase => 
      phrase.toLowerCase().includes('sleep') || 
      phrase.toLowerCase().includes('insomnia')
    )) {
      recommendations.add('Implement sleep hygiene practices and establish a regular sleep schedule');
    }

    if (negativePhrases.some(phrase => 
      phrase.toLowerCase().includes('sad') || 
      phrase.toLowerCase().includes('hopeless')
    )) {
      recommendations.add('Consider cognitive behavioral therapy to address negative thought patterns');
    }

    if (negativePhrases.some(phrase => 
      phrase.toLowerCase().includes('appetite') || 
      phrase.toLowerCase().includes('weight')
    )) {
      recommendations.add('Nutritional counseling and regular meal planning');
    }

    if (negativePhrases.some(phrase => 
      phrase.toLowerCase().includes('concentration') || 
      phrase.toLowerCase().includes('focus')
    )) {
      recommendations.add('Cognitive exercises and structured daily routines');
    }

    // Add positive reinforcement recommendations
    if (positivePhrases.length > 0) {
      recommendations.add('Continue and reinforce positive coping mechanisms');
    }

    // Add general recommendations
    recommendations.add('Regular follow-up appointments to monitor progress');
    recommendations.add('Consider referral to a mental health specialist');

    return Array.from(recommendations);
  }

  async generateResponse(inputText) {
    try {
      if (!inputText) {
        throw new Error('Input text is required');
      }

      // Use LLM for analysis
      return await this.analyzeWithLLM(inputText);
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async savePrediction(inputText, predictionResult) {
    try {
      const query = `
        INSERT INTO prediction_history (input_text, prediction_result)
        VALUES ($1, $2)
        RETURNING id
      `;
      
      const values = [
        inputText,
        predictionResult
      ];
      
      const { rows } = await this.pgPool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error saving prediction:', error);
      throw error;
    }
  }

  determineRiskLevel(confidence) {
    if (confidence >= 80) return 'HIGH';
    if (confidence >= 50) return 'MODERATE';
    return 'LOW';
  }
}

// Export a singleton instance
const model = new DepressionModel();
export default model; 