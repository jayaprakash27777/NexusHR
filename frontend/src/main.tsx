import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { useRealtimeStore } from './store/realtime'
import { ThemeProvider } from './components/theme/ThemeProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry on auth or not-found errors
        if ([401, 403, 404].includes(error?.response?.status)) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})

// Wire the QueryClient into the realtime store so WebSocket events
// can invalidate React Query caches without component coupling
useRealtimeStore.getState().setQueryClient(queryClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="nexushr-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
