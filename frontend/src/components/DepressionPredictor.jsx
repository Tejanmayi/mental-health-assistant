import React, { useState } from 'react';
import { api } from '../services/api';
import './DepressionPredictor.css';

const DepressionPredictor = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    notes: '',
    previousHistory: '',
    currentMedications: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          file
        }));
        setError('');
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFilePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          // For PDFs, we'll just show the filename
          setFilePreview(file.name);
        }
      } else {
        setError('Please upload a PDF or image file');
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.predictDepression(formData);
      setResult(response);
    } catch (err) {
      setError('Failed to process prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-container">
      <h1>Clinical Depression Assessment</h1>
      
      <form className="prediction-form" onSubmit={handleSubmit}>
        <div className="form-grid">
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
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="file">Upload Clinical Notes (PDF or Image)</label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
          />
          {error && <p className="error-message">{error}</p>}
          {filePreview && (
            <div className="file-preview">
              {formData.file?.type.startsWith('image/') ? (
                <img src={filePreview} alt="Uploaded file preview" />
              ) : (
                <div className="pdf-preview">
                  <i className="fas fa-file-pdf"></i>
                  <span>{filePreview}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Clinical Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="5"
            placeholder="Enter clinical notes here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="previousHistory">Previous History</label>
          <textarea
            id="previousHistory"
            name="previousHistory"
            value={formData.previousHistory}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter previous medical history..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentMedications">Current Medications</label>
          <textarea
            id="currentMedications"
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleInputChange}
            rows="3"
            placeholder="Enter current medications..."
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Processing...' : 'Analyze Notes'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="prediction-result">
          <h2>Assessment Results</h2>
          
          <div className="result-section">
            <h3>Patient Information</h3>
            <div className="patient-info">
              <p><strong>Name:</strong> {result.patientInfo.name}</p>
              <p><strong>Age:</strong> {result.patientInfo.age}</p>
              <p><strong>Gender:</strong> {result.patientInfo.gender}</p>
            </div>
          </div>

          <div className="result-section">
            <h3>Risk Assessment</h3>
            <div className="risk-level">
              <div className={`level ${result.riskLevel.toLowerCase()}`}>
                {result.riskLevel}
              </div>
              <div className="confidence">
                Confidence: {result.confidence}%
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>Key Findings</h3>
            <div className="key-findings">
              {result.keyFindings.map((finding, index) => (
                <div key={index} className="finding-item">
                  {finding}
                </div>
              ))}
            </div>
          </div>

          <div className="result-section">
            <h3>Clinical Recommendations</h3>
            <div className="recommendations">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepressionPredictor;
