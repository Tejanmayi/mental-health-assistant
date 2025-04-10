-- Create the counseling_responses table
CREATE TABLE IF NOT EXISTS counseling_responses (
    id SERIAL PRIMARY KEY,
    prompt TEXT NOT NULL,
    hq1 TEXT NOT NULL,
    hq2 TEXT NOT NULL,
    mq1 TEXT NOT NULL,
    lq1 TEXT NOT NULL,
    lq2 TEXT NOT NULL,
    lq3 TEXT NOT NULL,
    lq4 TEXT NOT NULL,
    lq5 TEXT NOT NULL,
    is_depression BOOLEAN NOT NULL
);

-- Create an index for full-text search on the prompt column
CREATE INDEX IF NOT EXISTS idx_counseling_prompt ON counseling_responses USING gin(to_tsvector('english', prompt)); 