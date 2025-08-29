# TypeScript Monorepo - React + Express.js + Supabase

## Overview

This is a modern full-stack TypeScript monorepo featuring a React frontend, Express.js backend, and Supabase PostgreSQL database. The application implements a user management system with role-based permissions and modern UI components. The project is designed as a development-ready template with hot reload capabilities, comprehensive UI components, and clean architectural separation between frontend and backend concerns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with clear separation of concerns:
- `client/` - React frontend application built with Vite
- `server/` - Express.js backend API with TypeScript
- `shared/` - Common schemas and types shared between frontend and backend

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod resolvers for validation

### Backend Architecture
- **Framework**: Express.js with TypeScript for robust API development
- **Database Layer**: Drizzle ORM for type-safe database operations and migrations
- **API Design**: RESTful endpoints with structured error handling and middleware
- **Development Integration**: Custom Vite integration for seamless full-stack development

### Database Design
- **Platform**: Supabase PostgreSQL for managed database services
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Schema Management**: Migration-based schema evolution with Drizzle Kit
- **Core Entities**: Users table with role-based permissions (BUYER, SELLER, ADMIN)
- **Data Validation**: Zod schemas for runtime validation and type safety

### Authentication Strategy
- **Provider**: Supabase Auth for user authentication and session management
- **Role System**: Enum-based user roles for granular access control
- **Session Handling**: Supabase client integration for frontend authentication state

### Development Environment
- **Hot Reload**: Full-stack hot reloading for both frontend and backend
- **Type Checking**: Comprehensive TypeScript configuration across the monorepo
- **Build Process**: Unified build system using Vite for frontend and esbuild for backend
- **Development Tools**: Runtime error overlay and cartographer for enhanced debugging

## External Dependencies

### Database Services
- **Supabase**: PostgreSQL database hosting, authentication, and real-time features
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL operations
- **Drizzle Kit**: Database migration and schema management tools

### Frontend Libraries
- **React 18**: Core frontend framework with hooks and concurrent features
- **Vite**: Build tool and development server
- **TanStack React Query**: Server state management and data fetching
- **Radix UI**: Primitive UI components for accessibility
- **Shadcn/ui**: Pre-built component library with customizable styling
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management and validation
- **Wouter**: Lightweight routing solution

### Backend Dependencies
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Static type checking for JavaScript
- **Zod**: Schema validation library
- **tsx**: TypeScript execution environment for development

### Development Tools
- **ESBuild**: Fast JavaScript bundler for backend builds
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Plugins**: Development environment enhancements for runtime errors and debugging