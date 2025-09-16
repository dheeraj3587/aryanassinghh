# NewsFlow AI - Intelligent News Analysis Platform

A production-ready AI platform that provides intelligent news analysis using advanced RAG (Retrieval-Augmented Generation) technology. The system ingests 100,000+ articles from various RSS feeds worldwide, creates embeddings, and stores them in a vector database for semantic search and contextual analysis.

## Features

- **Real-time News Ingestion**: Fetches 100,000+ articles from 200+ RSS feeds worldwide
- **RAG Pipeline**: Uses Jina AI embeddings and Qdrant vector database
- **AI-Powered Chat**: Google Gemini 1.5 Flash for intelligent responses
- **Session Management**: Redis-based session storage with fallback to in-memory
- **Modern UI**: React + TypeScript frontend with Framer Motion animations
- **Production Ready**: Docker, health checks, rate limiting, comprehensive logging

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Vector DB     │
│   (React)       │◄──►│   (Express)     │◄──►│   (Qdrant)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis         │
                       │   (Sessions)    │
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- API Keys (see Environment Variables)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd project
```

### 2. Environment Configuration

Create `.env` file with required API keys:

```bash
# AI Services
GEMINI_API_KEY=your_gemini_api_key
JINA_API_KEY=your_jina_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key

# Optional
REDIS_URL=redis://localhost:6379
NEWS_API_KEY=your_news_api_key
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

### 4. Ingest News Data

```bash
# Run data ingestion (100,000 articles)
docker-compose exec backend npm run ingest:prod
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5050
- Health Check: http://localhost:5050/api/health

## Manual Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Chat

- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/stream` - Stream response endpoint
- `GET /api/chat/history/:sessionId` - Get chat history

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/services` - Detailed service status
- `GET /api/health/db` - Database connectivity

### Session

- `POST /api/session` - Create new session
- `GET /api/session/:id` - Get session details

## Configuration

### Environment Variables

| Variable         | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `GEMINI_API_KEY` | Yes      | Google Gemini API key                |
| `JINA_API_KEY`   | Yes      | Jina AI embeddings API key           |
| `QDRANT_URL`     | Yes      | Qdrant vector database URL           |
| `QDRANT_API_KEY` | Yes      | Qdrant API key                       |
| `REDIS_URL`      | No       | Redis connection URL                 |
| `NEWS_API_KEY`   | No       | NewsAPI key for additional sources   |
| `PORT`           | No       | Server port (default: 5050)          |
| `NODE_ENV`       | No       | Environment (development/production) |

### RSS Configuration

- `RSS_MAX_PER_FEED`: Articles per feed (default: 1000)
- `RSS_MAX_TOTAL`: Total articles to fetch (default: 100000)
- `RSS_TIMEOUT`: Request timeout in ms (default: 10000)

## Data Sources

The system fetches news from 200+ RSS feeds including:

- **US**: NYT, CNN, Reuters, AP, NPR, Fox, CBS, NBC, USA Today, The Hill, Politico
- **UK**: BBC, Guardian, Telegraph, Independent, Financial Times
- **International**: Deutsche Welle, France24, Le Monde, NHK, Japan Times
- **Tech**: The Verge, TechCrunch, Wired, Engadget, Ars Technica

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

### Key Production Features

- **Docker Support**: Multi-stage builds, health checks
- **Security**: CORS, rate limiting, security headers
- **Monitoring**: Comprehensive health checks and logging
- **Scalability**: Horizontal scaling support
- **Error Handling**: Graceful degradation and fallbacks

## Development

### Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration and validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities and logging
│   │   └── scripts/         # Data ingestion scripts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API client
│   │   └── lib/             # Utilities
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── DEPLOYMENT.md
```

### Adding New Data Sources

1. Add RSS feed URL to `feedsByCountry` in `ingestion.js`
2. Update source extraction logic if needed
3. Test with `npm run ingest`

### Customizing AI Responses

Modify the system prompt in `chatService.js`:

```javascript
const systemPrompt = `You are a helpful news assistant...`;
```

## Monitoring

### Health Checks

- Basic: `GET /api/health`
- Services: `GET /api/health/services`
- Database: `GET /api/health/db`

### Logs

```bash
# View logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change `PORT` in `.env`
2. **API key errors**: Verify all required keys are set
3. **Redis connection**: Check `REDIS_URL` or disable Redis
4. **Qdrant errors**: Verify `QDRANT_URL` and `QDRANT_API_KEY`

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Check the troubleshooting section
- Review logs for error details
- Open an issue on GitHub
