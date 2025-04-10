import React, { useState } from 'react';
import '../styles/DepressionPredictor.css';

function DepressionPredictor() {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    clinicalNotes: '',
    file: null
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analyzeText, setAnalyzeText] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/extract-text`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from file');
      }

      const data = await response.json();
      setExtractedText(data.text);
      // Don't automatically update clinical notes
      setAnalyzeText(true);
    } catch (err) {
      setError('Failed to extract text from file. Please try again or enter text manually.');
      console.error('Error extracting text:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeText = () => {
    setFormData(prev => ({
      ...prev,
      clinicalNotes: extractedText
    }));
    setAnalyzeText(false);
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setExtractedText('');
    setAnalyzeText(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: formData.patientName,
          age: formData.age,
          gender: formData.gender,
          clinicalNotes: formData.clinicalNotes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      console.log('Received prediction data:', data);
      setPrediction(data);
    } catch (err) {
      console.error('Error getting prediction:', err);
      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add console log for prediction state changes
  React.useEffect(() => {
    console.log('Prediction state updated:', prediction);
  }, [prediction]);

  return (
    <div className="depression-predictor">
      <h1>Depression Risk Assessment</h1>
      <p className="description">
        Enter patient information and clinical notes to assess depression risk level.
        You can either type the notes directly or upload a PDF/image file containing the notes.
      </p>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label htmlFor="patientName">Patient Name</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
            min="1"
            max="120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file">Upload Clinical Notes (PDF or Image)</label>
          {!formData.file ? (
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          ) : (
            <div className="file-upload-container">
              <div className="file-info">
                <span>{formData.file.name}</span>
                {analyzeText && (
                  <button
                    type="button"
                    className="analyze-text-button"
                    onClick={handleAnalyzeText}
                  >
                    Analyze Text
                  </button>
                )}
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={handleRemoveFile}
                title="Remove file"
              >
                ×
              </button>
            </div>
          )}
          <small>Supported formats: PDF, JPEG, PNG</small>
        </div>

        <div className="form-group">
          <label htmlFor="clinicalNotes">Clinical Notes</label>
          <textarea
            id="clinicalNotes"
            name="clinicalNotes"
            value={formData.clinicalNotes}
            onChange={handleInputChange}
            rows="6"
            placeholder="Enter clinical notes or they will be automatically extracted from the uploaded file..."
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Analyzing...' : 'Assess Risk'}
        </button>
      </form>

      {prediction && (
        <div className="prediction-result">
          <div className="result-section">
            <h3>Risk Level</h3>
            <div className={`risk-level ${prediction.data?.riskLevel?.toLowerCase()}`}>
              {prediction.data?.riskLevel || 'Unknown'}
            </div>
          </div>

          <div className="result-section">
            <h3>Confidence Score</h3>
            <p className="confidence-score">{Math.round(prediction.data?.confidenceScore || 0)}%</p>
          </div>

          <div className="findings-section">
            <h3>Key Findings</h3>
            <ul>
              {prediction.data?.keyFindings?.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>

          <div className="recommendations-section">
            <h3>Recommendations</h3>
            <ul>
              {prediction.data?.recommendations?.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepressionPredictor;
