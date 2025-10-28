# 🩺 OrganFlow Smart Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**The user interface for OrgFlow - A revolutionary Web3 organ donation management platform powered by Hedera Hashgraph.**

## 🎯 Overview

This React/TypeScript frontend provides a modern, intuitive interface for hospitals and medical professionals to manage the complete organ donation lifecycle. Built with medical-grade UX principles and real-time blockchain integration.

## 🚀 Quick Start

### Prerequisites
```bash
Node.js ≥ 18.0
npm ≥ 8.0
```

### Installation & Setup

1. **Navigate to frontend directory:**
   ```bash
   cd organflow-hash-care-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install  # if using Bun
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   bun dev  # if using Bun
   ```

4. **Access the application:**
   - Frontend: http://localhost:8081/
   - Backend must be running on port 3002

## 🏗️ Architecture

```
┌─────────────────┐    REST APIs    ┌────────────────┐
│   React SPA     │◄──────────────►│  Express API   │
│                 │                 │   (Backend)    │
│ • Dashboard     │                 │ • Organ CRUD   │
│ • Live Registry │                 │ • Transfers    │
│ • Analytics     │                 │ • Analytics    │
│ • Realtime Feed │                 └────────────────┘
└─────────────────┘                        │
                        Blockchain Layer
                                │
                    ┌──────────────────────┐
                    │   Hedera Hashgraph    │
                    │    Smart Contracts    │
                    └──────────────────────┘
```

## 🎨 Features

### 🏥 Dashboard & Analytics
- **Real-time Metrics:** Live organ availability counts and hospital statistics
- **Interactive Charts:** Donation trends and transplant success rates
- **Multi-Hospital View:** Network-wide organ distribution maps

### 📋 Organ Registry
- **Live Registration:** Register organs with complete donor/medical metadata
- **Status Tracking:** Monitor organs through full lifecycle (Available → Transplanted)
- **Transfer System:** Seamless coordination between hospitals

### 📊 Analytics Panel
- **Performance Metrics:** Hospital efficiency and success rates
- **Demand Forecasting:** Predictive analytics for organ needs
- **Audit Trails:** Complete blockchain-verified transaction history

### 🔄 Real-time Updates
- **Auto-refresh:** Data updates every 30 seconds
- **Live Notifications:** Organ availability and transfer alerts
- **Status Synchronization:** Instant hospital network synchronization

## 🧠 Tech Stack

### Core Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with full IntelliSense
- **Vite** - Lightning-fast development and optimized production builds

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - Accessible, customizable component library
- **Radix UI** - Headless UI components for complex interactions
- **Framer Motion** - Smooth animations and micro-interactions

### Data & State
- **React Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling with validation

### Development Tools
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Automated code formatting
- **Vitest** - Fast unit testing framework
- **TypeScript Compiler** - Type checking and compilation

## 📁 Project Structure

```
organflow-hash-care-main/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base shadcn/ui components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   └── ...            # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   ├── pages/             # Route components/pages
│   └── services/          # API services and integrations
├── index.html             # Main HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite build configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests
```

### Environment Setup

Create a `.env.local` file for development:

```env
VITE_API_BASE_URL=http://localhost:3002
VITE_HEDERA_NETWORK=testnet
```

## 🌐 API Integration

The frontend connects to the backend API at `src/services/api.ts`:

- **Base URL:** Configurable via environment variables
- **Authentication:** Hospital-based authentication
- **Real-time:** WebSocket connections for live updates
- **Error Handling:** Comprehensive error states and retry logic

## 🎯 Best Practices

### Code Quality
- **TypeScript Strict:** Full type safety enabled
- **ESLint Rules:** Medical application standards
- **Component Patterns:** Consistent component architecture
- **Testing:** Unit tests for critical medical functions

### Performance
- **Code Splitting:** Route-based code splitting
- **Lazy Loading:** Component lazy loading for optimal bundle size
- **Caching:** Intelligent data caching and prefetching
- **Optimization:** Optimized re-renders and memory usage

### Accessibility
- **WCAG 2.1:** Full accessibility compliance
- **Keyboard Navigation:** Complete keyboard support
- **Screen Readers:** Screen reader compatible
- **High Contrast:** Medical setting appropriate contrast ratios

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Vercel:** Recommended for React applications
- **Netlify:** Alternative static hosting
- **Docker:** Containerized deployment (see root README)

### Environment Variables
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_HEDERA_NETWORK=mainnet
```

## 🤝 Contributing

1. **Follow Git Workflow:** Create feature branches from `main`
2. **TypeScript First:** All code must be type-safe
3. **Component Standards:** Use established UI patterns
4. **Test Coverage:** Maintain >80% test coverage for new features
5. **Code Review:** Required for all medical-critical features

## 📞 Support

- **Technical Issues:** Create GitHub issues with `frontend` label
- **API Questions:** Check backend README in `../backend/README.md`
- **Medical UX:** Contact healthcare team for medical workflow questions

## 🔗 Related Projects

- **Backend API:** `../backend/` - Express.js REST API
- **Smart Contracts:** `../backend/contracts/` - Hedera smart contracts
- **Main Repository:** Parent OrgFlow repository with full documentation

---

**Part of the OrgFlow ecosystem** 🩺
