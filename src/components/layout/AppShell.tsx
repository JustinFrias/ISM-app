import React from 'react';
import { Sidebar } from './Sidebar';
import { PageTransition } from './PageTransition';

interface AppShellProps { children: React.ReactNode; }

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-skeuo-bg w-full relative">
    <Sidebar />
    <main className="flex-1 ml-0 md:ml-60 flex flex-col min-w-0 overflow-hidden w-full h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </main>
  </div>
);
