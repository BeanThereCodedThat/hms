import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
