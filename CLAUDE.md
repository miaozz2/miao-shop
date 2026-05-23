# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript backend project (miao-shop). It listens on port 3000 by default.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run start        # Run in production mode (dist/main.js)
npm run start:dev    # Run in watch mode with hot reload
npm run start:debug  # Run in debug mode with watch
npm run start:prod  # Run compiled production build
npm run lint        # Lint and fix with ESLint
npm run format      # Format with Prettier
npm run test        # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:cov    # Run tests with coverage
npm run test:e2e    # Run e2e tests (uses test/jest-e2e.json)
```

## Architecture

Standard NestJS modular architecture:

- **Entry point**: [src/main.ts](src/main.ts) - Creates the NestFactory app and listens on `process.env.PORT ?? 3000`
- **Root module**: [src/app.module.ts](src/app.module.ts) - Root module importing controllers and providers
- **Controllers**: [src/app.controller.ts](src/app.controller.ts) - Handles HTTP requests via decorators
- **Services**: [src/app.service.ts](src/app.service.ts) - Business logic via `@Injectable()` decorator

Tests live alongside source files with `.spec.ts` suffix. Jest configuration sets `rootDir: src` so test files are co-located with their source modules.

## Key Technical Details

- Uses `module: nodenext` and `moduleResolution: nodenext` in TypeScript config
- Decorator metadata enabled (`emitDecoratorMetadata: true`, `experimentalDecorators: true`)
- Strict null checks enabled (`strictNullChecks: true`)
- No database or ORM configured yet