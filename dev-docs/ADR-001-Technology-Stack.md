# ADR-001: Technology Stack Selection

## Status

Accepted

## Date

2025-09-24

## Context

We need to select a technology stack for a self-hosted unified knowledge management platform that includes:

- Knowledge management (tasks, projects, notes)
- Inventory tracking with QR codes
- Food management with expiration tracking
- Calendar integration
- Communication hub (SMS, email)
- Voice control and processing
- Home automation integration
- AI-powered features (OCR, embeddings, smart search)

### Key Requirements

- Self-hosted deployment on single server
- Event-driven architecture with bounded contexts
- Heavy AI/ML integration (OCR, voice processing, LLMs)
- Real-time features and offline support
- Ultra-strict code quality for AI agent development
- Mobile app capability
- Performance targets: <200ms API, <400ms voice commands

## Decision

### Backend: NestJS + TypeScript

**Chosen over Python/FastAPI and Go**

**Reasons:**

- **Code Quality Control**: ESLint provides granular complexity limits (max 8 complexity, max 30 lines per function) essential for AI agent development
- **Architecture Support**: Excellent for hexagonal/clean architecture patterns
- **Event-Driven**: Strong async patterns and decorators for event handling
- **Type Safety**: TypeScript strict mode provides compile-time safety
- **Ecosystem**: Mature ecosystem with excellent testing, validation, and documentation tools

### Event Bus: Redis Streams + ioredis

**Chosen over NATS, RabbitMQ, Kafka**

**Reasons:**

- **Simplicity**: Single Redis container serves both cache and event bus
- **Persistence**: Built-in event persistence and replay capabilities
- **Performance**: Excellent for self-hosted single-server deployment
- **Integration**: ioredis provides best-in-class TypeScript support
- **Resource Efficient**: Minimal overhead compared to alternatives

### AI Services: Python Microservices

**Hybrid approach for AI-specific workloads**

**Reasons:**

- **AI Ecosystem**: Python has superior libraries for OCR, speech processing, LLMs
- **Separation**: Keep AI complexity isolated from main business logic
- **Performance**: Dedicated services for compute-intensive tasks
- **Libraries**: PaddleOCR, Whisper, Ollama have mature Python integrations

### Database: PostgreSQL 15+ with pgvector

**Chosen over MongoDB, MySQL**

**Reasons:**

- **ACID Compliance**: Critical for knowledge management consistency
- **Vector Search**: pgvector enables semantic search without separate vector DB
- **Performance**: Excellent for complex queries and relationships
- **Extensions**: Rich ecosystem (uuid-ossp, pg_trgm for full-text search)

### Frontend: Next.js 15 + PWA

**Chosen over pure React, Vue, or native mobile**

**Reasons:**

- **Mobile Strategy**: PWA provides app-like experience without App Store approval
- **Performance**: Server-side rendering for better initial load times
- **Offline Support**: Service workers for offline-first architecture
- **Development Speed**: Single codebase for web and mobile
- **Ecosystem**: Excellent TypeScript and state management integration

## Consequences

### Positive

- **Code Quality**: ESLint complexity controls enable reliable AI agent development
- **Performance**: Optimal for self-hosted deployment with 32GB RAM, 8-core server
- **Maintainability**: TypeScript and hexagonal architecture provide long-term sustainability
- **Resource Efficiency**: Single Redis for cache + events, PostgreSQL for all structured data
- **Development Speed**: Familiar stack with excellent tooling

### Negative

- **Learning Curve**: Team needs NestJS expertise
- **Complexity**: Hybrid TypeScript/Python services require coordination
- **Mobile Limitations**: PWA has some native feature limitations vs native apps

### Risks

- **AI Integration**: Coordination between NestJS and Python services adds complexity
- **Performance**: Event bus throughput needs monitoring under load
- **Mobile Experience**: PWA may not feel fully "native" to users

## Alternatives Considered

### Python/FastAPI Backend

- **Pros**: Better AI integration, simpler single-language stack
- **Cons**: Lacks ESLint-level code quality controls, weaker architecture patterns

### Native Mobile Apps

- **Pros**: Better platform integration, performance
- **Cons**: Dual development effort, App Store approval process, deployment complexity

### Separate Vector Database

- **Pros**: Specialized vector search performance
- **Cons**: Additional infrastructure complexity, unnecessary for single-server deployment

## Implementation Plan

### Phase 1: Core Foundation (4 weeks)

- NestJS project with hexagonal architecture
- PostgreSQL + Redis Docker setup
- Basic CRUD for all domains
- Event bus implementation

### Phase 2: AI Integration (3 weeks)

- Python AI services for OCR, embeddings
- Redis Streams event coordination
- Vector search with pgvector

### Phase 3: Frontend + Mobile (4 weeks)

- Next.js web application
- PWA configuration with offline support
- Real-time WebSocket integration

## Notes

- Server specs (32GB RAM, 8-core CPU) exceed requirements significantly
- All dependencies verified and installed on target Ubuntu 24.04 server
- Performance targets adjusted upward due to superior hardware capacity
