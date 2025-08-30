# Overview

This is a full-stack e-commerce web application built with React and Express, featuring a Turkish product catalog with advanced filtering and search capabilities. The application displays products with detailed information including ratings, pricing, stock status, and categories. It uses a modern tech stack with Vite for frontend tooling, ShadCN UI for components, Drizzle ORM for database operations, and PostgreSQL (via Neon) for data storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: ShadCN UI library with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful API with endpoints for products, categories, and filtering
- **Development Setup**: Development server with Vite middleware integration and hot module replacement
- **Error Handling**: Centralized error handling middleware with structured JSON responses

## Data Storage
- **Primary Database**: PostgreSQL via Neon serverless database
- **Schema Management**: Drizzle migrations with schema defined in TypeScript
- **Database Features**: 
  - User authentication schema (users table)
  - Product catalog with pricing, ratings, stock, and categories
  - Full-text search capabilities
  - Pagination and filtering support

# Recent Changes

Date: August 30, 2025
- ✅ Advanced filtering and search implementation with trigram indexes
- ✅ Enhanced product filtering with price sliders and rating controls  
- ✅ Database optimization with proper indexes for performance
- ✅ Mobile-responsive filter drawer with comprehensive filtering options
- ✅ Search debouncing for better performance
- ✅ Stock-based filtering with visual indicators
- ✅ URL parameter synchronization for all filters
- ✅ Advanced sorting options (price, rating, popularity, newest)

## Key Features
- **Advanced Product Filtering**: Complete filtering by category, price range (with slider), rating (with slider), stock status, search query, and sorting options
- **Responsive Design**: Mobile-first design with adaptive layouts and mobile filter drawer
- **Enhanced Search Functionality**: Real-time product search with debouncing and trigram fuzzy matching
- **Performance Optimized**: Database indexes for fast filtering and search on large product catalogs
- **Pagination**: Efficient pagination for large product catalogs with URL sync
- **Stock Management**: Real-time stock status display with visual indicators and filtering
- **Rating System**: 5-star rating display with review counts and rating-based filtering

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **express**: Backend web framework
- **vite**: Frontend build tool and development server

## UI and Styling
- **@radix-ui/***: Comprehensive set of headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for constructing className strings

## Development Tools
- **typescript**: Type checking and development tooling
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

## Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Integration adapters for validation libraries
- **zod**: Schema validation library
- **drizzle-zod**: Zod schema generation from Drizzle schemas

## Additional Utilities
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight router for React
- **cmdk**: Command menu component for search interfaces
- **embla-carousel-react**: Carousel/slider components