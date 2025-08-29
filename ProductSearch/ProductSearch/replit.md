# Overview

This is a full-stack e-commerce product catalog application built with React and Express. The application provides a comprehensive product browsing experience with advanced search, filtering, and pagination capabilities. It features a modern UI built with shadcn/ui components and Tailwind CSS, with a focus on responsive design and user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Component Structure**: Modular component architecture with clear separation between UI components, pages, and business logic
- **Mobile-First Design**: Responsive design with dedicated mobile components and breakpoint-aware hooks

## Backend Architecture  
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with structured endpoints for product operations
- **Data Layer**: Currently uses in-memory storage (MemStorage) with interface abstraction for future database integration
- **Request Handling**: Comprehensive error handling, request logging, and JSON response formatting
- **Development Setup**: Vite integration for hot module replacement in development mode

## Data Storage Solutions
- **Current Implementation**: In-memory storage with mock product and user data
- **Database Ready**: Drizzle ORM configuration with PostgreSQL schema definitions
- **Schema Design**: Well-defined database schema with support for users, products, orders, messages, and notifications
- **Migration Support**: Drizzle Kit configured for database migrations and schema management

## Key Features
- **Product Search & Filtering**: Advanced search with multiple filter criteria (category, price range, rating, stock status)
- **Pagination**: Efficient pagination with customizable page sizes and navigation
- **Responsive UI**: Mobile-optimized interface with drawer-based filtering on small screens  
- **Real-time Updates**: Query invalidation and refetching for data consistency
- **Type Safety**: End-to-end TypeScript implementation with shared schema validation using Zod

## Development Workflow
- **Build System**: Vite for frontend bundling, esbuild for server-side compilation
- **Development Server**: Integrated development setup with hot reload and error overlays
- **Code Organization**: Monorepo structure with shared types and schemas between client and server
- **Path Aliases**: Configured import aliases for clean import statements and better developer experience

# External Dependencies

## UI and Styling
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography

## Data Management
- **TanStack Query**: Server state management with caching, synchronization, and background updates
- **Drizzle ORM**: Type-safe ORM with PostgreSQL support for future database integration
- **Zod**: Runtime type validation and schema parsing
- **Neon Database**: Serverless PostgreSQL database service (configured but not yet implemented)

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **React Hook Form**: Form state management with validation support
- **Wouter**: Lightweight routing library for React applications

## Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx & class-variance-authority**: Conditional CSS class management
- **nanoid**: Unique ID generation for client-side operations