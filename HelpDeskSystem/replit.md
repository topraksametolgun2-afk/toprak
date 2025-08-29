# Overview

This is a support ticket system application built with React and Express.js. The system allows users to create and manage support tickets with real-time notifications, while providing administrators with comprehensive ticket management capabilities. The application features a Turkish language interface and includes user authentication, role-based access control, and WebSocket-based real-time updates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built as a React Single Page Application (SPA) using:

- **React 18** with TypeScript for type safety and modern React patterns
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management and caching
- **Tailwind CSS** with **shadcn/ui** components for consistent, modern UI design
- **Vite** as the build tool and development server for fast hot module replacement

The frontend follows a component-based architecture with clear separation between UI components, business logic, and data fetching. Components are organized into feature-specific modules (tickets, authentication, admin) with shared UI components from the shadcn/ui library.

## Backend Architecture

The server-side uses a Node.js Express.js architecture with:

- **Express.js** as the web framework handling HTTP requests and middleware
- **TypeScript** for type safety across the entire stack
- **WebSocket Server** using the 'ws' library for real-time notifications
- **In-memory storage** as the current data persistence layer (designed to be easily replaced with a database)
- **Mock authentication system** using simple Bearer tokens (ready for JWT/session upgrade)

The backend implements a RESTful API design with WebSocket endpoints for real-time features. The storage layer is abstracted through an interface, making it easy to swap the in-memory implementation for a database.

## Data Storage

Currently uses **in-memory storage** with Map-based data structures for:

- User management with role-based access (admin/user roles)
- Ticket lifecycle management with Turkish status labels ("açık", "yanıtlandı", "kapalı", "beklemede")
- Reply threading system linking replies to parent tickets
- Test data seeding for development (admin and regular user accounts)

The system is architected to easily migrate to **Drizzle ORM with PostgreSQL** as indicated by the configuration files. The database schema is already defined with proper relationships and Turkish enum values.

## Authentication and Authorization

Implements a simple authentication system with:

- **Role-based access control** distinguishing between regular users and administrators
- **Mock token-based authentication** stored in localStorage
- **Protected routes** with different access levels for user and admin interfaces
- **Authorization middleware** on API endpoints to verify user permissions

The authentication is designed to be easily upgraded to use JWT tokens or proper session management in production.

## Real-time Features

**WebSocket integration** provides live updates for:

- New ticket notifications for administrators
- Reply notifications for ticket participants  
- Status change notifications across the system
- Automatic UI updates without page refreshes

The WebSocket connection manages client state and broadcasts relevant updates based on user roles and ticket ownership.

## UI/UX Design System

Uses **shadcn/ui component library** built on **Radix UI primitives** with:

- **Tailwind CSS** for utility-first styling with custom design tokens
- **Turkish language interface** throughout the application
- **Responsive design** optimized for both desktop and mobile devices
- **Dark/light mode support** through CSS custom properties
- **Consistent component patterns** for forms, tables, dialogs, and navigation

# External Dependencies

## Core Framework Dependencies

- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM with schema migration tools
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **express**: Fast, unopinionated web framework for Node.js

## UI and Styling

- **@radix-ui/react-*** components: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Tool for creating variant-based component APIs
- **lucide-react**: Beautiful and consistent icon library

## Development and Build Tools

- **vite**: Next generation frontend build tool
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced debugging

## Real-time and WebSocket

- **ws**: Simple WebSocket library for Node.js
- **WebSocket API**: Browser-native WebSocket client implementation

## Form and Data Handling

- **react-hook-form** with **@hookform/resolvers**: Performant forms with easy validation
- **zod**: TypeScript-first schema validation
- **date-fns**: Modern JavaScript date utility library

The application is structured to be easily deployable on Replit with all necessary configuration files and can be migrated to use PostgreSQL when database persistence is needed.