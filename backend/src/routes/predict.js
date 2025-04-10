import express from 'express';
import depressionModel from '../models/depressionModel.js';

const router = express.Router();

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

    // Save the prediction to the database
    await depressionModel.savePrediction(clinicalNotes, result);

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
      error: 'Failed to analyze clinical notes'
    });
  }
});

export default router; 