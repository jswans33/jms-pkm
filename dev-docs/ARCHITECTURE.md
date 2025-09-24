# Architecture

## Code Organization

```
src/
├── shared/               # Cross-cutting concerns
│   ├── domain/          # Base classes, interfaces
│   ├── infrastructure/  # Database, Redis, external APIs
│   └── events/          # Event bus implementation
├── knowledge/           # Tasks, projects, notes
├── inventory/           # Physical items, locations, QR
├── food/               # Recipes, meal plans, expiration
├── calendar/           # Events, time blocks, sync
├── communication/      # Messages, SMS, email
├── voice/              # Speech processing, commands
├── home/               # Smart devices, automation
└── ai/                 # OCR, embeddings, LLM integration
```

## Key Patterns

### Hexagonal Architecture
```typescript
// Each bounded context follows this structure:
context/
├── domain/              # Pure business logic
│   ├── entities/       # Core domain objects
│   ├── value-objects/  # Immutable values
│   ├── services/       # Domain services
│   └── events/         # Domain events
├── application/         # Use cases
│   ├── handlers/       # Command/query handlers
│   └── ports/          # Interfaces for adapters
└── infrastructure/      # External concerns
    ├── repositories/   # Database implementation
    ├── adapters/       # External service clients
    └── controllers/    # HTTP/WebSocket endpoints
```

### Event-Driven Communication
```typescript
// Publish events, don't call other contexts directly
await this.eventBus.publish(new ItemCreatedEvent(item));

// Subscribe to events from other contexts
@EventHandler(FoodExpiringEvent)
async handleFoodExpiring(event: FoodExpiringEvent) { ... }
```

## Ultra-Strict Development Rails

### NestJS CLI Usage (MANDATORY)
```bash
# Generate new bounded context
nest generate module knowledge
nest generate service knowledge
nest generate controller knowledge

# Generate within context (follow structure)
nest generate service knowledge/domain/task --flat
nest generate controller knowledge/infrastructure/task --flat

# Generate event handler
nest generate service knowledge/application/task-created-handler --flat
```

### Code Quality Gates (ZERO TOLERANCE)
```bash
# Pre-commit hooks (MANDATORY)
npm run lint --max-warnings 0    # Must pass
npm run test:unit                 # Must pass
npm run test:integration          # Must pass
npm run typecheck                 # Must pass

# Complexity limits (ENFORCED BY ESLINT)
max-complexity: 8                # McCabe complexity
max-lines-per-function: 30       # Function length
max-params: 4                    # Parameter count
max-depth: 4                     # Nesting depth
```

### Architecture Rules (STRICTLY ENFORCED)

#### 1. File Naming Convention
```bash
# Domain layer
task.entity.ts                   # Entities
task-priority.value-object.ts    # Value objects
task.service.ts                  # Domain services
task-created.event.ts            # Domain events

# Application layer
create-task.handler.ts           # Command handlers
get-tasks.query.ts               # Query handlers
task.repository.interface.ts     # Port interfaces

# Infrastructure layer
task.repository.ts               # Repository implementation
task.controller.ts               # HTTP controllers
twilio-sms.adapter.ts           # External adapters
```

#### 2. Dependency Direction (NEVER VIOLATE)
```typescript
// ✅ ALLOWED: Inward dependencies only
Domain ← Application ← Infrastructure

// ❌ FORBIDDEN: Outward dependencies
Domain → Application  // LINT ERROR
Application → Infrastructure  // LINT ERROR

// ❌ FORBIDDEN: Cross-context imports
import { FoodService } from '../food/...'  // LINT ERROR

// ✅ REQUIRED: Events for cross-context communication
await this.eventBus.publish(new TaskCreatedFromMessageEvent(...))
```

#### 3. Adding New Features (FOLLOW EXACTLY)

**Step 1: Generate with CLI**
```bash
# New entity in existing context
nest generate service knowledge/domain/subtask --flat
nest generate class knowledge/domain/subtask.entity --flat

# New use case
nest generate service knowledge/application/create-subtask-handler --flat
```

**Step 2: Implement Domain First**
```typescript
// 1. Entity (pure business logic)
@Entity()
export class Subtask {
  // Max 5 public methods, max 30 lines each
}

// 2. Domain service (if needed)
export class SubtaskService {
  // Max 3 public methods
}

// 3. Domain event
export class SubtaskCreatedEvent extends DomainEvent { }
```

**Step 3: Application Layer**
```typescript
// Command/Query handler (max 30 lines)
@CommandHandler(CreateSubtaskCommand)
export class CreateSubtaskHandler {
  async execute(command: CreateSubtaskCommand): Promise<void> {
    // Single responsibility only
  }
}
```

**Step 4: Infrastructure**
```typescript
// Repository implementation
@Injectable()
export class SubtaskRepository implements ISubtaskRepository {
  // Database access only, no business logic
}

// Controller (HTTP routing only)
@Controller('subtasks')
export class SubtaskController {
  // Max 5 endpoints, delegate to handlers immediately
}
```

#### 4. Cross-Context Integration (EVENT-ONLY)
```typescript
// ❌ NEVER: Direct service calls
const taskService = new TaskService();  // FORBIDDEN

// ✅ ALWAYS: Event-driven communication
@EventHandler(FoodExpiringEvent)
async handleFoodExpiring(event: FoodExpiringEvent) {
  await this.commandBus.execute(new CreateTaskCommand({
    title: `Check expired: ${event.foodItem}`,
    dueDate: new Date()
  }));
}
```

## Database Strategy

- **PostgreSQL**: All structured data with separate schemas per context
- **pgvector**: Embeddings for semantic search
- **Redis**: Events, cache, real-time features

```sql
-- Each context gets its own schema
CREATE SCHEMA knowledge;
CREATE SCHEMA inventory;
CREATE SCHEMA food;
```

## Testing Strategy

```
test/
├── unit/               # Domain logic tests
├── integration/        # Database + external services
└── e2e/               # Full request/response flows
```

## AI Services Integration

```typescript
// AI services are separate Python processes
// Communicate via Redis events + HTTP calls

@EventHandler(ImageUploadedEvent)
async processOCR(event: ImageUploadedEvent) {
  const result = await this.ocrClient.extractText(event.imageUrl);
  await this.eventBus.publish(new OCRCompletedEvent(result));
}
```

## Key Rules

1. **One Thing Per File**: Controllers only route, services only contain business logic
2. **No Direct Dependencies**: Contexts communicate via events only
3. **Interface Segregation**: Small, focused interfaces
4. **Dependency Injection**: All external dependencies injected
5. **Event Sourcing**: Important state changes produce events