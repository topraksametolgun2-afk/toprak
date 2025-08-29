# Overview

This project is a full-stack web application built with Express.js and React that implements a comprehensive user management system with authentication and profile management. The application features email/password-based authentication with role-based access control (Admin, Seller, Buyer), user registration and login functionality, and a complete settings interface for profile management, password changes, and notification preferences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing with protected route functionality
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Authentication**: JWT token stored in localStorage with automatic header injection

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Middleware**: Custom auth guards for route protection and role-based access control
- **API Design**: RESTful API with consistent error handling and validation

## Database Schema
- **Users Table**: Stores user information including authentication credentials, profile data, and role-based permissions
- **Schema Features**: UUID primary keys, email uniqueness constraints, role enumeration (BUYER, SELLER, ADMIN), notification preferences, and automatic timestamps

## Authentication & Authorization
- **JWT Implementation**: Secure token generation with configurable expiration
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Role-Based Access**: Middleware guards for protecting admin routes and role-specific functionality
- **Session Management**: Client-side token management with automatic logout on token expiration

## API Structure
- **Auth Routes**: Registration, login, profile retrieval, and password management
- **Profile Management**: Update personal information, change passwords, and manage notification preferences
- **Error Handling**: Consistent error responses with Zod validation for request validation
- **Response Format**: Standardized JSON responses with appropriate HTTP status codes

# External Dependencies

## Database & ORM
- **Neon Database**: PostgreSQL serverless database with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Database Features**: UUID generation, indexing for performance optimization

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide Icons**: Icon library for consistent visual elements

## Development Tools
- **Vite**: Fast build tool with hot module replacement and development server
- **TypeScript**: Type safety across the entire application stack
- **Replit Integration**: Development environment with runtime error handling and debugging tools

## Authentication & Security
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **Zod**: Runtime type validation and schema parsing