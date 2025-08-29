# TypeScript Monorepo - React + Express.js + Supabase

## Overview

This is a modern full-stack TypeScript monorepo featuring a React frontend, Express.js backend, and Supabase PostgreSQL database. The application implements a user management system with role-based permissions (BUYER, SELLER, ADMIN) and provides a comprehensive development dashboard for monitoring system health and managing operations.

The project is designed as a development-ready template with hot reload capabilities, comprehensive UI components, and a clean architectural separation between frontend and backend concerns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common schemas and types shared between frontend and backend

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with structured error handling and logging middleware
- **Development Setup**: Custom Vite integration for seamless development experience

### Database Schema
The application uses a PostgreSQL database with the following core entities:
- **Users Table**: Stores user information with email, hashed passwords, and role-based permissions
- **Role System**: Enum-based user roles (BUYER, SELLER, ADMIN) for access control
- **Timestamps**: Automatic created_at and updated_at tracking

### Data Access Layer
- **Storage Interface**: Abstract IStorage interface for database operations
- **Implementation**: DatabaseStorage class implementing CRUD operations for users
- **Type Safety**: Zod schemas for runtime validation and Drizzle for compile-time type checking

### Development Features
- **Hot Reload**: Both frontend and backend support hot reloading during development
- **Health Monitoring**: Real-time health checks for database and server status
- **Development Dashboard**: Comprehensive UI for monitoring system status and managing development tasks
- **Error Handling**: Structured error responses with proper HTTP status codes

### Security Considerations
- **Password Security**: Hashed password storage (implementation ready for bcrypt integration)
- **Input Validation**: Zod schemas for request validation
- **Environment Variables**: Secure configuration management for database connections

### Build and Deployment
- **TypeScript Compilation**: Shared tsconfig.json with path mapping for clean imports
- **Production Build**: Optimized builds for both frontend (Vite) and backend (esbuild)
- **Asset Management**: Proper static file serving and asset resolution

## External Dependencies

### Database
- **Supabase PostgreSQL**: Cloud-hosted PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **@neondatabase/serverless**: Serverless database connection adapter

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Router alternatives (Wouter)
- **UI Framework**: Radix UI primitives, Shadcn/ui components, Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Development Tools**: Vite, TypeScript, PostCSS with Tailwind

### Backend Dependencies
- **Express.js**: Web application framework with middleware support
- **Validation**: Zod for schema validation and type inference
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development and Build Tools
- **TypeScript**: Shared configuration across frontend and backend
- **Vite**: Development server and build tool with React plugin
- **Replit Integration**: Custom plugins for Replit development environment
- **ESLint/Prettier**: Code formatting and linting (configuration ready)

### Utility Libraries
- **Date Handling**: date-fns for date manipulation
- **CSS Utilities**: clsx, class-variance-authority for conditional styling
- **Component Utilities**: Embla Carousel, CMDK for enhanced UI components