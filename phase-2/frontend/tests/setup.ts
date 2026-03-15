/**
 * Jest Test Setup File
 * 
 * This file is executed before each test file.
 * It sets up Testing Library matchers for better assertions.
 * 
 * Note: MSW (Mock Service Worker) is available in package.json but requires
 * additional setup for Node.js environment. To enable MSW:
 * 1. Install @mswjs/interceptors: npm install @mswjs/interceptors --save-dev
 * 2. Uncomment the MSW setup code below
 */

// Import Testing Library Jest DOM matchers for better assertions
import '@testing-library/jest-dom';

// ============================================================================
// MSW Setup (Optional - uncomment when @mswjs/interceptors is installed)
// ============================================================================
// import { setupServer } from 'msw/node';
// import { handlers } from './__mocks__/handlers';
//
// export const server = setupServer(...handlers);
//
// beforeAll(() => {
//   server.listen({ onUnhandledRequest: 'bypass' });
// });
//
// afterEach(() => {
//   server.resetHandlers();
//   localStorage.clear();
// });
//
// afterAll(() => {
//   server.close();
// });
// ============================================================================
