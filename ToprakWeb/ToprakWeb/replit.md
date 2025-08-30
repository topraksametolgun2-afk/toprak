# Overview

This is a full-stack web application called "Toprak" built with a modern TypeScript stack. It's a business management system featuring a dashboard interface with support for ticket management, stock/inventory management, user management, and various business operations. The application uses React for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Components**: Radix UI primitives with shadcn/ui design system providing a comprehensive component library
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and API data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API endpoints following conventional HTTP methods and status codes
- **Data Access**: Storage abstraction layer with in-memory implementation (MemStorage) for development/testing
- **Development Server**: Vite integration for hot module replacement and development workflow
- **Error Handling**: Centralized error handling middleware with structured error responses

## Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Tables**: Four main entities - users, tickets, stock_items, and activities
- **User Management**: Basic user authentication structure with roles and credentials
- **Ticket System**: Support ticket management with status tracking, priority levels, and assignment
- **Inventory**: Stock item management with quantity tracking and categorization
- **Activity Logging**: System activity tracking with JSON metadata storage

## Component Structure
- **Layout System**: Dashboard layout with sidebar navigation and header components
- **Feature Pages**: Dedicated pages for dashboard, support center, stock management, product search, Turkish bot, ticket system, and settings
- **Reusable Components**: Comprehensive UI component library including forms, tables, cards, and data visualization elements
- **Data Display**: Statistics cards, activity feeds, and data tables with real-time updates

## Development Workflow
- **Type Safety**: Full TypeScript implementation across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and schemas between client and server
- **Build Process**: Vite for frontend bundling and esbuild for backend compilation
- **Development Tools**: Hot reload, error overlays, and development-specific tooling integration

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with migration support and schema validation

## UI Framework
- **Radix UI**: Headless UI components for accessibility and customization
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with design system integration

## Development Tools
- **Vite**: Fast build tool with hot module replacement and plugin ecosystem
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit Integration**: Development environment integration with runtime error handling

## Data Management
- **TanStack Query**: Server state management with caching, synchronization, and optimistic updates
- **Zod**: Schema validation for runtime type checking and form validation
- **React Hook Form**: Performant form library with validation integration

## Fonts and Assets
- **Google Fonts**: Inter font family for consistent typography
- **Lucide React**: Feather-style icon library for consistent iconography

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express.js session handling