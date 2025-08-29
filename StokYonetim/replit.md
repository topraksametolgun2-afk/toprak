# E-Commerce Inventory Management System

## Overview

This is a full-stack e-commerce inventory management system built with React, Express, and PostgreSQL. The application provides comprehensive product and inventory management capabilities with a modern, responsive user interface. It features real-time inventory tracking, critical stock alerts, stock movement history, and an admin dashboard for managing products and inventory levels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom components built on top
- **Styling**: Tailwind CSS with CSS variables for theming and shadcn/ui design system
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **API Design**: RESTful endpoints with consistent error handling and request/response patterns
- **Middleware**: Custom logging middleware for API request tracking
- **Development**: Hot module replacement and automatic server restarts

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Database Design**: Normalized relational schema with proper foreign key relationships
- **Key Tables**: Users, Products, Categories, Inventory, Stock Movements, and Orders

### Authentication and Authorization
- **Current State**: Basic user role system (admin/customer) prepared in schema
- **Future Implementation**: Session-based authentication with express-session and PostgreSQL session store

### Component Architecture
- **Design System**: Shadcn/ui components with consistent styling and behavior
- **Layout**: Responsive admin layout with collapsible sidebar navigation
- **Forms**: Reusable form components with validation and error handling
- **Data Display**: Table components with filtering, searching, and pagination capabilities
- **Modals**: Dialog components for editing and confirmation actions

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Feather-based icon library for consistent iconography

### Development Tools
- **Vite**: Frontend build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production server builds
- **TypeScript**: Static type checking across the entire application stack

### State Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form state management with performance optimizations

### Validation
- **Zod**: Runtime type validation for API requests and form data
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for schema validation

### Utilities
- **Class Variance Authority**: Type-safe CSS class management
- **clsx**: Conditional CSS class name utility
- **date-fns**: Date manipulation and formatting library