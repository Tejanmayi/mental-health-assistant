# Mental Health Counselor Assistant

## Project Overview
The Mental Health Counselor Assistant is a comprehensive web application designed to assist mental health professionals in analyzing patient data and providing risk assessments. The system combines machine learning models with a user-friendly interface to help counselors make informed decisions about patient care.

## Technology Stack

### Frontend
- **Framework**: React.js
- **Styling**: CSS3
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Deployment**: Vercel
- **UI Components**: Custom-built components
- **Form Handling**: React controlled components

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Machine Learning**: Python with scikit-learn
- **Text Processing**: Natural Language Processing (NLP)
- **Deployment**: Render
- **API Documentation**: Swagger/OpenAPI

### Machine Learning
- **Language**: Python
- **Libraries**: 
  - scikit-learn
  - pandas
  - numpy
  - nltk
  - transformers
- **Models**: 
  - Risk Assessment Classifier
  - Text Analysis Models
  - Feature Extraction Pipelines
- **Large Language Model (LLM)**:
  - **Model**: BERT-based models from Hugging Face
  - **Specific Models**:
    - `bert-base-uncased` for general text understanding
    - `mental-bert` for mental health domain-specific analysis
  - **Integration**: Hugging Face Transformers library
  - **Applications**:
    - Clinical note analysis
    - Risk assessment generation
    - Recommendation generation
    - Contextual understanding of mental health terminology
  - **Features**:
    - Natural language understanding
    - Context-aware responses
    - Mental health domain expertise
    - Ethical considerations in mental health analysis
    - Local deployment for enhanced privacy
    - Custom fine-tuning for mental health domain

## System Architecture

### Data Flow
1. User inputs clinical notes or uploads documents
2. Frontend sends data to backend API
3. Backend processes text and extracts features
4. ML models and LLM analyze features and generate risk assessment
5. Results are returned to frontend
6. Frontend displays analysis and recommendations

### Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis History Table
CREATE TABLE analysis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    clinical_notes TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    confidence_score FLOAT NOT NULL,
    findings JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

### 1. User Authentication
- Secure login and registration
- Role-based access control
- Session management
- Password hashing and security

### 2. Risk Analysis
- Clinical notes analysis
- Document upload and processing
- Risk level classification
- Confidence scoring
- Key findings extraction
- Personalized recommendations

### 3. Data Management
- Analysis history tracking
- User session management
- Secure data storage
- Data backup and recovery

### 4. User Interface
- Responsive design
- Intuitive navigation
- Real-time feedback
- Error handling
- Loading states
- Result visualization

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Analysis
- `POST /api/analyze` - Analyze clinical notes
- `POST /api/extract-text` - Extract text from documents
- `GET /api/analysis/history` - Get analysis history

### Health Check
- `GET /api/health` - System health check

## Machine Learning Pipeline

### 1. Data Preprocessing
- Text cleaning and normalization
- Tokenization
- Stop word removal
- Lemmatization
- Feature extraction

### 2. Feature Engineering
- TF-IDF vectorization
- Sentiment analysis
- Keyword extraction
- Topic modeling
- Contextual embeddings

### 3. Model Training
- Dataset preparation
- Model selection
- Hyperparameter tuning
- Cross-validation
- Performance evaluation

### 4. Risk Assessment
- Risk level classification
- Confidence scoring
- Findings generation
- Recommendations generation
- **Risk Level Parameters**:
  - **Low Risk** (Score: 0-0.3)
    - No immediate concerns
    - Mild symptoms
    - Good coping mechanisms
    - Strong support system
  - **Medium Risk** (Score: 0.3-0.7)
    - Moderate symptoms
    - Some coping difficulties
    - Partial support system
    - Potential for escalation
  - **High Risk** (Score: 0.7-1.0)
    - Severe symptoms
    - Poor coping mechanisms
    - Limited support system
    - Immediate intervention needed
- **Key Indicators**:
  - Symptom severity
  - Frequency of symptoms
  - Impact on daily functioning
  - Support system availability
  - Previous history
  - Coping mechanisms
  - Risk factors present
  - Protective factors present

## Deployment

### Backend (Render)
1. Environment setup
2. Database configuration
3. API deployment
4. SSL/TLS configuration
5. Monitoring and logging

### Frontend (Vercel)
1. Build optimization
2. Static file serving
3. CDN configuration
4. Environment variables
5. Continuous deployment

## Security Measures

### Data Security
- HTTPS encryption
- Password hashing
- Input validation
- SQL injection prevention
- XSS protection

### Authentication
- JWT tokens
- Session management
- Role-based access
- Rate limiting
- CORS configuration

## Future Enhancements

### Planned Features
1. Real-time collaboration
2. Advanced analytics dashboard
3. Integration with EHR systems
4. Mobile application
5. Multi-language support

### Technical Improvements
1. Microservices architecture
2. Containerization
3. Advanced caching
4. Real-time updates
5. Enhanced ML models

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request


## Acknowledgments
- Mental health professionals for domain expertise
- Open-source community for tools and libraries
- Research papers and studies in mental health analysis