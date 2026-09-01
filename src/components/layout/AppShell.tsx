import React from 'react';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';

interface AppShellProps { children: React.ReactNode; }

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 ml-60 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </main>
  </div>
);
