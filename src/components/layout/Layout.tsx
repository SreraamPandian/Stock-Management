import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
