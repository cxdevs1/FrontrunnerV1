# Index Inclusion Sniper

## Overview

This is a FinTech dashboard application designed to analyze mechanical buying pressure for S&P index inclusions and migrations. The app calculates the required shares that index funds must buy when stocks are added to S&P 500, S&P 400, or S&P 600 indices, providing traders with actionable intelligence on potential price movements driven by passive fund rebalancing.

The application features an institutional-grade UI with real-time pressure analysis, volume tracking, and alert systems for identifying high-impact index addition events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom institutional FinTech design system (slate/indigo palette, 12px border radii, Inter font)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints with Zod validation
- **Build**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Migrations**: Drizzle Kit for schema migrations (`drizzle-kit push`)
- **Connection**: pg Pool with connection pooling configured for production/development

### Key Data Models
- **indexEvents**: Tracks index addition/migration announcements with ticker, dates, market cap, price, and volume data
- **dailyMetrics**: Stores calculated pressure scores, relative volume, and alert states for tracking

### Core Business Logic
- **Pressure Calculation**: Computes mechanical buying pressure based on index AUM, market cap weights, and trading volume
- **Migration Support**: Handles both new additions and migrations between indices (calculates net demand from buy/sell pressure)
- **Alert Levels**: Classifies pressure as EXTREME (3.0x+), HIGH (1.5x+), or NORMAL based on days-of-volume impact

## External Dependencies

### Database
- PostgreSQL (requires `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### UI Framework Dependencies
- Radix UI primitives for accessible components
- TanStack React Query for data fetching
- Tailwind CSS for styling
- Lucide React for icons

### Development Tools
- Vite with HMR for frontend development
- tsx for TypeScript execution
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)

### Python Components (Legacy/Prototyping)
- `index_logic.py` and `mock_data.py` contain prototype pressure calculation logic
- Core logic has been ported to TypeScript in `server/analyzer.ts`