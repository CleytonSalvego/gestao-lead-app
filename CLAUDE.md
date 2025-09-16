# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Development
- `npm run start` or `ng serve` - Start development server
- `npm run build` - Build the project for production
- `npm run watch` - Build with watch mode for development
- `npm run test` - Run unit tests with Karma
- `npm run lint` - Run ESLint linting

### Mobile Development
- `npx cap add android` - Add Android platform (if needed)
- `npx cap add ios` - Add iOS platform (if needed)
- `npx cap sync` - Sync web assets to native platforms
- `npx cap run android` - Build and run on Android
- `npx cap run ios` - Build and run on iOS

## Project Architecture

### Technology Stack
- **Ionic 8** + **Angular 18** - Hybrid mobile app framework
- **Capacitor 6** - Native runtime for iOS/Android
- **TypeScript 5.4** - Primary development language
- **SCSS** - Styling with custom themes

### Core Services Architecture
The app follows a service-oriented architecture with these key services:

**AuthService** (`/services/mock/auth.service.ts`):
- User authentication and authorization
- Token management and session handling
- Role-based permissions (Admin, Manager, Consultant, Viewer)
- User preferences management

**LeadsService** (`/services/mock/leads.service.ts`):
- Lead lifecycle management
- Kanban board data with status workflow: analysis → classification → information → initial_sale → support_sale → completed/rejected/pending
- Contact history tracking
- Metrics and analytics calculation
- Payment link generation

**ConsultantsService** (`/services/mock/consultants.service.ts`):
- Consultant management and KPIs
- Performance tracking and metrics
- Team analytics and top performers
- Consultant activation/deactivation

### Module Structure
- **Lazy Loading**: All pages use lazy-loaded modules for performance
- **Component Reusability**: Shared components in `/components` directory
- **Service Injection**: Services use `providedIn: 'root'` for singleton pattern
- **Interface-Driven**: Strong typing with TypeScript interfaces

### Key Domain Areas

1. **Authentication** (`/pages/auth/`):
   - Login with email/password
   - User registration
   - Password recovery
   - Demo credentials provided

2. **Dashboard** (`/pages/dashboard/`):
   - Metrics overview (total leads, conversions, ticket médio, taxa de contato)
   - Product distribution charts (Auto, Vida, Residencial, Saúde)
   - AI vs Human contact analytics
   - Quick actions and top performers

3. **Kanban Board** (`/pages/kanban/`):
   - Visual lead pipeline management
   - Drag-and-drop functionality
   - Status-based columns with lead cards
   - Real-time updates

4. **Lead Management** (`/pages/leads/`):
   - Lead listing with filters
   - Individual lead details and history
   - Contact tracking and notes
   - Payment link generation

5. **Consultant Management** (`/pages/consultants/`):
   - Consultant profiles and KPIs
   - Performance metrics tracking
   - Team management tools

6. **Settings** (`/pages/settings/`):
   - Lead classification rules
   - Integration preferences
   - User preferences and notifications

### Data Models

**Lead Interface**:
- Complete lead lifecycle tracking
- Contact history and notes
- Score-based prioritization
- Product association (Auto, Vida, Residencial, Saúde)

**User Interface**:
- Role-based access control
- Preference management
- Permission system

**Consultant Interface**:
- Comprehensive KPI tracking
- Performance metrics
- Goal progress monitoring

### Mock Data Structure
All services use realistic mock data with:
- Complete CRUD operations simulation
- Realistic response delays
- Error handling scenarios
- Observable-based reactive patterns

### UI/UX Standards
- **Premium Design**: Corporate Porto Seguro branding
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: ARIA labels and semantic HTML
- **Dark/Light Mode**: Theme switching support
- **Loading States**: Skeleton screens and spinners

### Testing Setup
- **Karma + Jasmine** for unit testing
- Chrome launcher configured for test execution
- Coverage reports generated in `/coverage` directory

## Project Context
This is a comprehensive CRM system for Porto Seguro insurance leads management. The application enables insurance consultants and managers to track leads through the complete sales pipeline, from initial contact to policy conversion. Features include real-time dashboards, visual kanban boards, consultant performance tracking, and integrated AI/human contact analytics.

### Demo Credentials
- **Admin**: admin@portoseguro.com.br / 123456
- **Consultant**: joao.silva@portoseguro.com.br / 123456

### Integration Points
The application is designed for future integration with:
- Porto Seguro lead APIs
- Payment processing systems
- CRM backend services
- Analytics platforms