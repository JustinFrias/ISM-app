import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';
import { isClerkConfigured, clerkPublishableKey } from './services/clerk';

const root = createRoot(document.getElementById('root')!);

if (isClerkConfigured && clerkPublishableKey) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/login">
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
