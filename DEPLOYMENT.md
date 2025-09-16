# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Required API keys (see Environment Variables section)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5050
FRONTEND_URL=http://localhost:3000

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Embeddings
JINA_API_KEY=your_jina_api_key_here
JINA_MODEL=jina-embeddings-v2-base-en

# Vector Database
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION=news_articles

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password_here
REDIS_HOST=localhost
REDIS_PORT=6379

# News APIs (Optional)
NEWS_API_KEY=your_news_api_key_here
GUARDIAN_API_KEY=your_guardian_api_key_here

# RSS Configuration
RSS_MAX_PER_FEED=1000
RSS_MAX_TOTAL=100000
RSS_TIMEOUT=10000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

## Quick Start with Docker Compose

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run the application:

```bash
docker-compose up -d
```

This will start:

- Backend API on port 5050
- Frontend on port 3000
- Redis on port 6379

## Manual Deployment

### Backend

1. Install dependencies:

```bash
cd backend
npm ci --only=production
```

2. Set environment variables
3. Start the server:

```bash
npm start
```

### Frontend

1. Install dependencies:

```bash
cd frontend
npm ci
```

2. Build the application:

```bash
npm run build
```

3. Serve the built files with a web server (nginx, Apache, etc.)

## Data Ingestion

To populate the vector database with news articles:

```bash
cd backend
npm run ingest
```

This will fetch 100,000 articles from various RSS feeds and store them in Qdrant.

## Health Checks

- Backend: `http://localhost:5050/api/health`
- Frontend: `http://localhost:3000/health`

## Monitoring

The application includes comprehensive health checks and logging:

- Basic health: `/api/health`
- Detailed health: `/api/health/services`
- Database health: `/api/health/db`

## Scaling

For production scaling:

1. Use a load balancer (nginx, HAProxy)
2. Scale backend services horizontally
3. Use managed Redis (AWS ElastiCache, Redis Cloud)
4. Use managed Qdrant or self-hosted Qdrant cluster
5. Set up monitoring (Prometheus, Grafana)

## Security Considerations

- All API keys are stored in environment variables
- CORS is configured for specific origins
- Rate limiting is enabled
- Security headers are set
- Input validation and sanitization
- Error handling doesn't expose sensitive information

## Performance Optimization

- Gzip compression enabled
- Static asset caching
- Connection pooling for Redis
- Batch processing for embeddings
- Rate limiting for external APIs

## Troubleshooting

1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Check health endpoints
4. Monitor resource usage
5. Check external service connectivity
