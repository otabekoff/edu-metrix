import React from 'react';
import { RouterProvider } from 'react-router';
import { StateProvider } from './context/StateContext';
import { Toaster } from 'sonner';
import { router } from './router';
import "./index.css";

export function App() {
  return (
    <StateProvider>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </StateProvider>
  );
}

export default App;
