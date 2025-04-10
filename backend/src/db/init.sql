-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(50) NOT NULL,
    notes TEXT,
    previous_history TEXT,
    current_medications TEXT,
    risk_level VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    key_findings TEXT[] NOT NULL,
    recommendations TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_text TEXT,
    embeddings vector(384)  -- Update to 384 dimensions for all-MiniLM-L6-v2
);

-- Create a text search column
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Create a function to update the search_text column
CREATE OR REPLACE FUNCTION update_search_text() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := 
        COALESCE(NEW.patient_name, '') || ' ' ||
        COALESCE(NEW.notes, '') || ' ' ||
        COALESCE(NEW.previous_history, '') || ' ' ||
        COALESCE(NEW.current_medications, '') || ' ' ||
        COALESCE(array_to_string(NEW.key_findings, ' '), '') || ' ' ||
        COALESCE(array_to_string(NEW.recommendations, ' '), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search_text
CREATE TRIGGER update_search_text_trigger
    BEFORE INSERT OR UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_search_text();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS predictions_search_idx ON predictions 
USING gin(to_tsvector('english', search_text));

-- Insert sample data
INSERT INTO predictions (
    patient_name,
    age,
    gender,
    notes,
    previous_history,
    current_medications,
    risk_level,
    confidence,
    key_findings,
    recommendations
) VALUES 
(
    'John Smith',
    35,
    'male',
    'Patient reports persistent feelings of sadness and loss of interest in activities. Sleep disturbances and fatigue noted.',
    'History of anxiety, no previous depression diagnosis',
    'None currently',
    'moderate',
    85.5,
    ARRAY['Persistent low mood', 'Sleep disturbances', 'Loss of interest in activities'],
    ARRAY['Consider starting SSRI medication', 'Schedule follow-up in 2 weeks', 'Recommend regular exercise']
),
(
    'Sarah Johnson',
    28,
    'female',
    'Patient experiencing significant anxiety and panic attacks. Reports difficulty concentrating at work.',
    'Family history of depression',
    'Prozac 20mg daily',
    'high',
    92.3,
    ARRAY['Severe anxiety symptoms', 'Panic attacks', 'Work performance affected'],
    ARRAY['Increase Prozac dosage to 40mg', 'Add CBT therapy', 'Consider short-term disability leave']
),
(
    'Michael Brown',
    42,
    'male',
    'Patient shows signs of seasonal affective disorder. Symptoms worse in winter months.',
    'Previous diagnosis of SAD',
    'Vitamin D supplements',
    'low',
    78.9,
    ARRAY['Seasonal pattern of symptoms', 'Mild depressive symptoms', 'Responds well to light therapy'],
    ARRAY['Continue light therapy', 'Maintain current treatment plan', 'Schedule check-in before next winter']
); 