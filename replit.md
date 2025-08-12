# Overview

ProcessTracker is a full-stack web application for monitoring and managing waste processing operations. The system provides real-time tracking of various waste processes (organic, plastic, metal, glass, paper, electronic) with detailed status monitoring, progress tracking, and user management capabilities. Built as a React frontend with an Express.js backend, it features comprehensive process lifecycle management from creation to completion.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with centralized route registration
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Development**: Hot reload with Vite integration for full-stack development

## Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration
- **User Flow**: Automatic redirect to Replit auth, session persistence, and protected route middleware

## Data Layer
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and database operations
- **Connection**: Connection pooling with WebSocket support for serverless environments

## Process Management System
- **Process Types**: Support for multiple waste categories (organic, plastic, metal, glass, paper, electronic)
- **Status Tracking**: Comprehensive state management (running, paused, error, stopped, completed)
- **Progress Monitoring**: Real-time progress updates with estimated and actual duration tracking
- **Error Handling**: Detailed error message storage and status management

## UI/UX Architecture
- **Design System**: Custom design tokens with CSS variables for theming
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Structure**: Modular component architecture with shared UI components
- **Accessibility**: ARIA-compliant components via Radix UI primitives
- **Loading States**: Skeleton loaders and loading indicators for better UX

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for Node.js
- **react**: Frontend UI library
- **@tanstack/react-query**: Server state management and caching

## Authentication Services
- **openid-client**: OpenID Connect client for Replit authentication
- **passport**: Authentication middleware with OpenID strategy
- **express-session**: Session middleware for Express
- **connect-pg-simple**: PostgreSQL session store

## UI and Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Icon library for UI elements

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **drizzle-kit**: Database schema management and migrations
- **wouter**: Lightweight routing for React applications