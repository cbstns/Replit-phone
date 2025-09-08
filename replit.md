# Enstream Identity Account Status Checker

## Overview

This is a full-stack web application that provides a user interface for checking mobile phone account status using the Enstream Identity API. The application features a React frontend with shadcn/ui components and an Express.js backend that interfaces with the Enstream QA environment. Users can submit phone numbers in E.164 format to check account status (ACTIVE/SUSPENDED) and view a history of recent queries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Management**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints with JSON request/response format
- **Request Validation**: Zod schemas for runtime type validation and parsing
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Logging**: Custom request logging middleware that tracks API response times and payloads

### Data Storage Solutions
- **Development Storage**: In-memory storage using Map data structures for rapid development and testing
- **Production Ready**: Drizzle ORM configured with PostgreSQL support, including migration system
- **Database Schema**: Two main entities - users table for future authentication and phone_queries table for storing query history
- **Session Management**: PostgreSQL session store configuration using connect-pg-simple for production scalability

### Authentication and Authorization
- **Current State**: No authentication implemented - open access for development/testing
- **Future Ready**: User schema and authentication infrastructure prepared for implementation
- **API Security**: Basic environment variable configuration for Enstream API credentials

### External Service Integrations
- **Primary Integration**: Enstream Identity QA API for account status verification
- **Authentication Method**: HTTP Basic Auth with configurable credentials
- **Data Format**: JSON request/response with E.164 phone number validation
- **Request Tracking**: UUID-based request identification for tracing and debugging
- **Error Handling**: Comprehensive error handling for network failures and API errors

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **express**: Web application framework for the backend API server
- **@tanstack/react-query**: Server state management and caching library
- **react-hook-form**: Performant form library with minimal re-renders
- **zod**: TypeScript-first schema validation library

### UI and Styling Dependencies
- **@radix-ui/react-***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating type-safe CSS class variants
- **clsx**: Utility for constructing className strings conditionally

### Development and Build Tools
- **vite**: Fast build tool and development server optimized for modern web development
- **typescript**: Static type checking for JavaScript
- **drizzle-kit**: CLI tools for database schema management and migrations
- **esbuild**: Fast JavaScript bundler for production builds

### Third-Party Services
- **Enstream Identity API**: External service for mobile account status verification
- **PostgreSQL Database**: Persistent storage for application data and session management
- **Replit Integration**: Development environment integration with error overlay and debugging tools