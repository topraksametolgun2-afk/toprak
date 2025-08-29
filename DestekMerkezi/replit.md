# Overview

This is a full-stack support ticket system built with React, Express, and TypeScript. The application allows users to create and manage support tickets with real-time messaging capabilities. It features separate interfaces for regular users and administrators, with WebSocket-powered live updates and a comprehensive ticket management system including categories, priorities, and status tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **Vite**: Build tool and development server for fast development experience
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library
- **TanStack Query**: Server state management for API data fetching and caching
- **Wouter**: Lightweight client-side routing library
- **React Hook Form + Zod**: Form handling with schema validation

## Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **WebSocket Server**: Real-time bidirectional communication for live ticket updates
- **Memory Storage**: In-memory data storage implementation with interface for future database integration
- **Middleware Stack**: Request logging, JSON parsing, error handling, and simplified authentication

## Database Design
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **Schema Structure**:
  - Users table with admin role support
  - Tickets with status, priority, and category enums
  - Messages linked to tickets and users
  - UUID primary keys with automatic generation

## Authentication & Authorization
- **Simplified Authentication**: Header-based user identification (development setup)
- **Role-Based Access**: Admin users can access administrative panel and manage all tickets
- **User Isolation**: Regular users can only see their own tickets

## Real-time Features
- **WebSocket Integration**: Live notifications for new messages and ticket updates
- **Client Management**: Connection tracking with user authentication
- **Event Broadcasting**: System-wide notifications for ticket status changes

## UI/UX Architecture
- **Component Structure**: Modular components with shadcn/ui design system
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Toast Notifications**: User feedback system for actions and real-time updates
- **Modal System**: Ticket detail views with real-time message updates

# External Dependencies

## Core Technologies
- **Node.js Runtime**: Server execution environment
- **TypeScript**: Static type checking for both frontend and backend
- **Vite**: Frontend build tool and development server

## Database & ORM
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Drizzle ORM**: Database toolkit with migrations support
- **@neondatabase/serverless**: PostgreSQL client for serverless environments

## Frontend Libraries
- **React**: UI framework with hooks and functional components
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Wouter**: Lightweight routing solution
- **Zod**: Schema validation library

## UI Components & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **Replit Integration**: Development environment plugins and error handling