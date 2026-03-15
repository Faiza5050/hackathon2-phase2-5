/**
 * Custom Render Utility for Testing
 *
 * Provides a custom render function that wraps components with necessary providers.
 * This ensures consistent test setup across all component tests.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * AllProviders component that wraps the app with necessary context providers.
 * Add additional providers here as needed (e.g., ThemeProvider, QueryClientProvider).
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}

/**
 * Custom render options that extend the default RenderOptions.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Optional wrapper component. If provided, it will wrap the AllProviders.
   * Use this for additional providers specific to a test.
   */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Custom render function that wraps the component with all necessary providers.
 * 
 * @param ui - The React component to render
 * @param options - Optional render options
 * @returns RenderResult from Testing Library
 * 
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 * 
 * @example
 * ```tsx
 * // With additional wrapper
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>
 * });
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  { wrapper: Wrapper, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  const WrapperComponent = Wrapper;

  function Providers({ children }: { children: React.ReactNode }) {
    return (
      <AllProviders>
        {WrapperComponent ? <WrapperComponent>{children}</WrapperComponent> : children}
      </AllProviders>
    );
  }

  return render(ui, {
    wrapper: Providers,
    ...renderOptions,
  });
}

// Re-export everything from Testing Library for convenience
export * from '@testing-library/react';

// Override render with our custom version
export { renderWithProviders as render };
