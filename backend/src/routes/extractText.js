import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Function to perform OCR using Azure Computer Vision
async function performOCR(imagePath) {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);

    // Azure Computer Vision API endpoint
    const endpoint = process.env.AZURE_VISION_ENDPOINT;
    const subscriptionKey = process.env.AZURE_VISION_KEY;

    // Make the API request
    const response = await fetch(
      `${endpoint}/vision/v3.2/read/analyze`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBuffer
      }
    );

    if (!response.ok) {
      throw new Error(`Azure API request failed: ${response.statusText}`);
    }

    // Get the operation location
    const operationLocation = response.headers.get('operation-location');

    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      });

      if (!pollResponse.ok) {
        throw new Error(`Azure API polling failed: ${pollResponse.statusText}`);
      }

      const pollData = await pollResponse.json();
      
      if (pollData.status === 'succeeded') {
        result = pollData;
        break;
      }

      // Wait for 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!result) {
      throw new Error('OCR operation timed out');
    }

    // Extract text from the result
    let extractedText = '';
    let confidence = 0;
    let wordCount = 0;

    if (result.analyzeResult && result.analyzeResult.readResults) {
      for (const page of result.analyzeResult.readResults) {
        for (const line of page.lines) {
          extractedText += line.text + '\n';
          confidence += line.confidence;
          wordCount += line.words.length;
        }
      }

      // Calculate average confidence
      confidence = confidence / wordCount * 100;
    }

    // Clean up the text
    const cleanedText = extractedText
      .replace(/[\r\n]+/g, '\n')
      .replace(/[^\S\r\n]+/g, ' ')
      .trim();

    return {
      text: cleanedText,
      confidence: confidence,
      words: wordCount
    };

  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}

// Handle text extraction from images
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Perform OCR on the image
    const result = await performOCR(req.file.path);

    res.json({ 
      text: result.text,
      confidence: result.confidence,
      wordsRecognized: result.words,
      message: 'Text extracted from handwritten notes'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      error: 'Failed to extract text from handwritten notes',
      details: error.message 
    });
  } finally {
    // Clean up: delete the uploaded file
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }
  }
});

export default router; 