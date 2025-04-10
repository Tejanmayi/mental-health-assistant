import express from 'express';
import depressionModel from '../models/depressionModel.js';

const router = express.Router();

// GET endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Depression prediction service is running',
    status: 'ok',
    availableEndpoints: {
      POST: '/api/predict',
      description: 'Submit clinical notes for depression risk analysis'
    }
  });
});

// POST endpoint for predictions
router.post('/', async (req, res) => {
  try {
    const { clinicalNotes } = req.body;

    if (!clinicalNotes) {
      return res.status(400).json({
        success: false,
        error: 'Clinical notes are required'
      });
    }

    const result = await depressionModel.analyzeWithLLM(clinicalNotes);

    // Return the prediction without saving to database
    res.json({
      success: true,
      data: {
        riskLevel: result.riskLevel,
        confidenceScore: result.confidenceScore,
        keyFindings: result.keyFindings,
        recommendations: result.recommendations
      }
    });
  } catch (error) {
    console.error('Error in predict route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze clinical notes',
      details: error.message
    });
  }
});

export default router; 