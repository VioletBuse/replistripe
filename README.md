# TypeScript Web Application

A modern Node.js + TypeScript web application using Express.js.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your environment variables:
```
PORT=3000
NODE_ENV=development
```

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm test`: Run tests

## Project Structure

```
├── src/                # Source files
│   └── index.ts       # Application entry point
├── dist/              # Compiled JavaScript files
├── .env              # Environment variables
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Development

The application uses:
- Express.js for the web server
- TypeScript for type safety
- CORS for handling cross-origin requests
- dotenv for environment variable management
- Jest for testing