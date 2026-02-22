# Admin Backend Frontend (ab-fe)

A React + TypeScript + Vite frontend application for managing brands, countries, and market groups through a GraphQL API.

## Features

- **Brands Management**: View all brands
- **Countries Management**: View all countries  
- **Market Groups Management**: 
  - Select a brand to view its market groups
  - Create new market groups for a selected brand
  - View market groups in a clean list format

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Apollo Client** - GraphQL client
- **GraphQL** - API query language

## Prerequisites

- Node.js (v18+)
- pnpm package manager
- Backend GraphQL server running on `http://localhost:8080/graphql`

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

```bash
# Start development server
pnpm dev
```

The application will start on `http://localhost:5173` (or next available port).

## Project Structure

```
src/
├── components/          # React components
│   ├── BrandsList.tsx
│   ├── CountriesList.tsx
│   └── MarketGroupsManager.tsx
├── contexts/            # React contexts
│   └── SnackbarContext.tsx
├── graphql/             # GraphQL operations
│   └── operations.ts
├── lib/                 # Utility libraries
│   └── apolloClient.ts
├── types/               # TypeScript type definitions
│   └── graphql.ts
├── App.tsx              # Main app component
└── main.tsx             # Application entry point
```

## Usage

1. **Start the backend server** on `http://localhost:8080/graphql`
2. **Start the frontend** with `pnpm dev`
3. **Navigate through tabs**:
   - **Brands** - View all available brands
   - **Countries** - View all available countries
   - **Market Groups** - Select a brand, view its market groups, and create new ones

## GraphQL Schema

The application connects to a GraphQL backend with the following schema:

```graphql
type Query {
  findAllBrands: [Brand!]!
  findAllCountries: [Country!]!
  findAllMarketGroups(brandPublicId: ID!): [MarketGroup!]!
}

type Mutation {
  createMarketGroup(brandPublicId: ID!, name: String!): MarketGroup!
}

type Brand {
  publicId: ID!
  name: String!
}

type Country {
  publicId: ID!
  name: String!
}

type MarketGroup {
  publicId: ID!
  name: String!
}
```

## Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Linting

```bash
# Run ESLint
pnpm lint
```
