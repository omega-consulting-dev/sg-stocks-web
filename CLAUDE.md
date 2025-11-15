# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript stock management web application using Vite as the build tool. The project uses shadcn-vue components (New York style) with Tailwind CSS v4 for styling.

## Technology Stack

- **Framework**: Vue 3.5+ with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS v4 with shadcn-vue components
- **UI Components**: Reka UI (headless components) + shadcn-vue
- **Icons**: lucide-vue-next
- **Build Tool**: Vite 7
- **Testing**: Vitest + Vue Test Utils
- **Type Checking**: vue-tsc

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload

# Building
npm run build                  # Type-check and build for production
npm run build-only            # Build without type checking
npm run type-check            # Run TypeScript type checking only
npm run preview               # Preview production build locally

# Testing
npm run test:unit             # Run all unit tests
npm run test:unit -- [path]   # Run specific test file

# Code Quality
npm run lint                  # Lint and auto-fix with ESLint
npm run format                # Format code with Prettier
```

## Architecture

### Directory Structure

- `src/components/navigation/` - App-level navigation components (AppSidebar, AppNavbar, MenuMain, NavUser, ToggleMode)
- `src/components/ui/` - shadcn-vue component library (15 components installed: avatar, breadcrumb, button, collapsible, dropdown-menu, input, label, separator, sheet, sidebar, skeleton, switch, tooltip)
- `src/views/` - Route view components
- `src/router/` - Vue Router configuration
- `src/stores/` - Pinia state management stores
- `src/lib/` - Utility functions (includes `cn()` for class merging)
- `src/assets/` - Static assets and global CSS

### Layout Architecture

The app uses a sidebar-based layout with:
- `SidebarProvider` wrapping the entire layout
- `AppSidebar` for main navigation
- `SidebarInset` containing `AppNavbar` and main content area
- Collapsible sidebar that transforms to icons when collapsed

### Path Aliases

Configured in `vite.config.ts` and `components.json`:
- `@/` → `src/`
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/lib/utils` → `src/lib/utils`
- `@/components/ui` → `src/components/ui`

### shadcn-vue Integration

This project uses shadcn-vue components with the following configuration:
- Style: New York
- Base color: neutral
- CSS variables enabled
- Icon library: lucide-vue-next
- No component prefix

When adding new shadcn-vue components, they should be added to `src/components/ui/` and follow the existing pattern.

### Styling Utilities

- Use the `cn()` utility from `@/lib/utils` for merging Tailwind classes with class-variance-authority
- Tailwind v4 with the new Vite plugin (`@tailwindcss/vite`)
- Global styles in `src/assets/main.css`

## Node Version Requirements

This project requires Node.js `^20.19.0 || >=22.12.0`

## Development Notes

- The app currently has a single route (`/`) rendering `HomeView`
- Main layout includes placeholder content (grid of aspect-video divs) that should be replaced with actual application content
- Vue DevTools plugin is enabled in development mode
- All `.vue` files use TypeScript (`<script setup lang="ts">`)
