# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

QuantFrame is a Warframe trading application built with Tauri (Rust backend) + React (TypeScript frontend). It interfaces with Warframe Market APIs for trading items and rivens, with local SQLite database for persistence.

## Development Commands

### Frontend Development
```bash
pnpm dev              # Start Vite dev server on port 1420
pnpm build            # Build frontend (runs TypeScript + Vite)
pnpm lint             # Run ESLint on TypeScript files
pnpm preview          # Preview production build
```

### Tauri Development
```bash
pnpm tauri:dev        # Start Tauri in dev mode (launches both frontend & backend)
pnpm tauri:build      # Build production Tauri application (debug mode)
pnpm tauri build      # Build release MSI installer (what user means by "build")
```

**Note**: When user says "build" or "rebuild", they typically mean building the MSI installer package, which is done via `pnpm tauri build`.

### Working with Backend
When making Rust changes, Tauri will automatically rebuild the backend during `pnpm tauri:dev`.

For manual Rust compilation without Tauri:
```bash
cd src-tauri
cargo build           # Build Rust backend
cargo test            # Run Rust tests (if any)
```

## Architecture Overview

### Frontend (React + TypeScript)

**Path Aliases** (configured in tsconfig.json and vite.config.ts):
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@contexts/*` → `src/contexts/*`
- `@hooks/*` → `src/hooks/*`
- `@utils/*` → `src/utils/*`
- `@api/*` → `src/api/*`
- `@models/*` → `src/models/*`
- `@icons/*` → `src/icons/*`
- `$types*` → `src/types/index.ts`

**Key Technologies**:
- **Mantine UI (v8.3.2)**: Primary component library
- **React Router (v7.7.0)**: Navigation
- **TanStack Query (v5.64.1)**: Data fetching & caching
- **i18next**: Internationalization (en, dk)
- **FontAwesome**: Icons (custom Warframe-specific icons added)
- **Recharts & Chart.js**: Data visualization

**Core Structure**:
- `src/App.tsx`: App initialization with QueryClient, ModalsProvider, ThemeProvider
- `src/contexts/`: React contexts (app, auth, theme, liveScraper)
- `src/api/`: TypeScript API client wrapping Tauri invoke commands
  - Each module (auth, cache, order, etc.) corresponds to Rust backend commands
  - `api/index.ts` exports `TauriClient` which handles all invoke calls
- `src/pages/`: Page components
- `src/components/`: Reusable UI components

**State Management Pattern**:
- React Context for global state (app settings, auth, theme)
- TanStack Query for server state (caching, refetching)
- Tauri events for real-time updates from backend

### Backend (Rust + Tauri)

**Workspace Structure**:
The backend is a Cargo workspace with multiple crates:
- `src-tauri/`: Main Tauri application
- `src-tauri/entity/`: SeaORM database entities
- `src-tauri/migration/`: Database migrations
- `src-tauri/service/`: Business logic layer (SeaORM queries)
- `src-tauri/qf_api/`: Warframe Market API client library
- `src-tauri/utils/`: Shared utilities

**Key Components**:
- `src-tauri/src/lib.rs`: Main entry point, initializes database, state management, and Tauri commands
- `src-tauri/src/commands/`: All Tauri commands exposed to frontend (organized by domain)
- `src-tauri/src/app/client.rs`: AppState management
- `src-tauri/src/cache/client.rs`: Caching layer for market data
- `src-tauri/src/live_scraper/`: Real-time market scraping functionality
- `src-tauri/src/log_parser/`: Warframe game log parsing

**Database**:
- SQLite database located at: `%LOCALAPPDATA%\dev.kenya.quantframe\quantframeV2.sqlite` (Windows)
- Managed with SeaORM + migrations
- Automatic backups created on startup
- Debug mode option for temporary database

**State Management**:
Uses Tauri's `manage()` to share state across commands:
- `AppState`: Main application state (includes QF API client, settings, user)
- `CacheState`: Cached market data
- `LiveScraperState`: Live trading scraper state
- `LogParserState`: Game log parser state

All managed states are wrapped in `Mutex` for thread safety.

### Frontend-Backend Communication

**Invoke Pattern**:
Frontend calls Rust commands via Tauri's invoke:
```typescript
// Frontend (TypeScript)
await api.stock_item.create({ item_name: "Prime Warframe", ... });

// Backend (Rust)
#[tauri::command]
async fn stock_item_create(...) -> Result<StockItem, Error> { ... }
```

**Event Pattern**:
Backend emits events to frontend for real-time updates:
```rust
// Backend
app.emit("app:ready", ())?;
app.emit("on_error", error)?;

// Frontend
useTauriEvent(TauriTypes.Events.OnError, handleAppError, []);
```

## Important Configuration

### Analytics
User prefers analytics **disabled** in this project. Respect this when adding features.

### Auto-updater
Configured in `src-tauri/tauri.conf.json` with public key for signature verification.
- Endpoint: `https://api.quantframe.app/release/{{target}}/{{arch}}/{{current_version}}`
- When building from source, **delete the `pubkey` field** in `tauri.conf.json`

### Vite Port
Frontend dev server runs on **port 1420** (strict mode). Tauri expects this port.

### Database Migrations
When adding new tables/fields:
1. Create migration in `src-tauri/migration/`
2. Update entities in `src-tauri/entity/`
3. Migrations run automatically on app startup

## Common Development Patterns

### Adding a New Feature Module

**Frontend**:
1. Create API module in `src/api/[module]/index.ts`
2. Export from `src/api/index.ts` and add to `TauriClient` class
3. Create page/components in `src/pages/[module]/` or `src/components/[module]/`
4. Add types to `src/types/index.ts`

**Backend**:
1. Create command module in `src-tauri/src/commands/[module].rs`
2. Add commands to `invoke_handler!` in `src-tauri/src/lib.rs`
3. Create service methods in `src-tauri/service/src/[module].rs` for database operations
4. Define entities in `src-tauri/entity/src/[module].rs` if new tables needed

### Working with Tauri Commands

Commands follow consistent patterns:
- Accept structured input via serde deserialization
- Access managed state via `State<'_, Mutex<T>>`
- Return `Result<T, Error>` for error handling
- Use `#[tauri::command]` attribute macro

### Custom Warframe Icons

Custom FontAwesome icons for Warframe-specific elements (polarities, resources) are registered in `App.tsx`:
```typescript
library.add(faPlat, faPolarity, faPolarityMadurai, ...);
```

New icons should be added to `src/icons/` and registered similarly.

## Performance Optimizations

### Frontend Bundle Optimization

The application uses **lazy loading** and **manual chunk splitting** for optimal performance:

**Lazy Loading:**
- All route components load on-demand using `React.lazy()`
- Initial bundle reduced by ~76% (596 KB → 160 KB gzipped)
- Users only download code for pages they visit

**Vendor Chunking:**
Large dependencies are split into separate chunks for better caching:
- `vendor-mantine`: Mantine UI components
- `vendor-react`: React core libraries
- `vendor-charts`: Chart.js and Recharts
- `vendor-icons`: FontAwesome icons
- `vendor-query`: TanStack Query
- `vendor-tauri`: Tauri plugins

**Benefits:**
- Faster initial load time
- Better browser caching (vendor chunks rarely change)
- Faster subsequent navigation
- Smaller downloads per route

When adding new large dependencies, consider adding them to appropriate vendor chunks in `vite.config.ts`.

## Testing Strategy

This project does not currently have a test suite. When adding tests:
- Frontend: Use standard React testing patterns (Vitest recommended for Vite projects)
- Backend: Use Cargo's built-in test framework with `#[cfg(test)]` modules
