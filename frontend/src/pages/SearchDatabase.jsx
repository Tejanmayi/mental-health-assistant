import React, { useState } from 'react';
import './SearchDatabase.css';

const SearchDatabase = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: searchTerm }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Search failed');
            }

            setSearchResults(data.results);
        } catch (err) {
            setError(err.message);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-container">
            <h1>Search Prediction History</h1>
            <p className="search-description">
                Enter keywords to search through past predictions and clinical assessments.
                You can search by patient name, symptoms, medications, or risk level.
                The search uses both exact matches and semantic understanding.
            </p>

            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by patient name, symptoms, medications, or risk level..."
                        className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}

            {searchResults.length > 0 ? (
                <div className="search-results">
                    {searchResults.map((result) => (
                        <div key={result.id} className="result-card">
                            <div className="result-header">
                                <h3>{result.patientName}</h3>
                                <span className={`risk-badge ${result.riskLevel.toLowerCase()}`}>
                                    {result.riskLevel}
                                </span>
                            </div>
                            <div className="result-details">
                                <p><strong>Age:</strong> {result.age}</p>
                                <p><strong>Gender:</strong> {result.gender}</p>
                                <p><strong>Confidence:</strong> {result.confidence}%</p>
                                <p><strong>Date:</strong> {new Date(result.date).toLocaleDateString()}</p>
                            </div>
                            <div className="result-content">
                                <div className="findings-section">
                                    <h4>Key Findings</h4>
                                    <ul>
                                        {result.keyFindings.map((finding, index) => (
                                            <li key={index}>{finding}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="recommendations-section">
                                    <h4>Recommendations</h4>
                                    <ul>
                                        {result.recommendations.map((recommendation, index) => (
                                            <li key={index}>{recommendation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !loading && searchTerm && (
                <div className="no-results">
                    No results found for "{searchTerm}". Try different keywords or check your spelling.
                </div>
            )}
        </div>
    );
};

export default SearchDatabase; 