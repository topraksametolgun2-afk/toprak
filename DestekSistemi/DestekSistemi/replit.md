# Overview

This is a B2B (Business-to-Business) e-commerce platform called "Toprak B2B" built with React and Express.js. The application provides a comprehensive solution for businesses to manage products, orders, customer communications, and support tickets. It features a modern web interface with real-time capabilities for messaging and notifications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful APIs with WebSocket support for real-time features
- **Authentication**: Session-based authentication (currently mocked for development)
- **File Structure**: Modular architecture with separated concerns (routes, storage, database)

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Centralized schema definitions in shared directory
- **Migrations**: Drizzle Kit for database schema migrations

## Real-time Communication
- **WebSockets**: Native WebSocket server for real-time messaging and notifications
- **Client Management**: Connection mapping for user-specific message delivery
- **Integration**: WebSocket context provider for React components

## Key Features Architecture
- **Support System**: Ticket-based customer support with real-time chat
- **Notification System**: Real-time notifications with read/unread status
- **User Management**: Role-based access control (BUYER, SELLER, ADMIN)
- **Product Management**: Inventory tracking with seller associations
- **Order Management**: Complete order lifecycle with status tracking
- **Messaging**: Real-time chat system for order communications

## Development Architecture
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Hot Reload**: Vite HMR for frontend and tsx for backend development
- **Error Handling**: Centralized error handling with user-friendly error modals

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

## UI and Styling
- **@radix-ui/***: Headless UI primitives for accessible components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library

## Authentication and Security
- **bcrypt**: Password hashing for user authentication
- **connect-pg-simple**: PostgreSQL session store (for future session management)

## Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation
- **drizzle-zod**: Zod schema generation from Drizzle schemas

## Real-time Communication
- **ws**: WebSocket library for real-time features
- **date-fns**: Date manipulation and formatting