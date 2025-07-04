"use client";

import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Toaster } from 'sonner';
import SignInForm from './SignInForm';
import { SignOutButton } from './SignOutButton';
import TimetableManager from './components/TimetableManager';

export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={<div className="flex justify-center items-center h-full text-white">Loading Spline scene...</div>}>
          <Spline
            scene="https://prod.spline.design/lCdYpF6pmPf5ji5f/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 bg-black/50 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-700 shadow-sm px-4">
          <h2 className="text-xl font-semibold text-blue-400">Staff Timetable Manager</h2>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </header>
        <main className="flex-1 p-4">
          <Content />
        </main>
        <Toaster />
      </div>
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Staff Timetable Management</h1>
          <p className="text-gray-300">
            Welcome back, {loggedInUser?.email ?? "Admin"}! Manage staff assignments and schedules.
          </p>
        </div>
        <TimetableManager />
      </Authenticated>
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Staff Timetable Manager</h1>
            <p className="text-gray-300">Sign in to manage staff schedules and assignments</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}

// CSS to hide the "Made with Spline" button
const styles = `
  /* Target the Spline watermark (adjust selector based on actual class if needed) */
  a[href*="spline.design"], div[class*="spline-watermark"], div[class*="made-with-spline"] {
    display: none !important;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);