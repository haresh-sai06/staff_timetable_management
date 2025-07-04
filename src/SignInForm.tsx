"use client";

import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';

// Define types for the auth actions (placeholder for Convex Auth)
interface AuthActions {
  signIn: (type: string, data?: FormData) => Promise<void>;
}

const useAuthActions = (): AuthActions => ({
  signIn: async (type: string, data?: FormData) => {
    console.log(`Simulating ${type} sign-in with data:`, data);
    if ( data?.get('password') === 'wrong') {
      throw new Error('Invalid password');
    }
    return Promise.resolve();
  },
});

const SignInForm: React.FC = () => {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set('flow', flow);
    signIn('password', formData).catch((error: Error) => {
      let toastTitle = '';
      if (error.message.includes('Invalid password')) {
        toastTitle = 'Invalid password. Please try again.';
      } else {
        toastTitle =
          flow === 'signIn'
            ? 'Could not sign in, did you mean to sign up?'
            : 'Could not sign up, did you mean to sign in?';
      }
      toast.error(toastTitle);
      setSubmitting(false);
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {flow === 'signIn' ? 'Sign In' : 'Sign Up'}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            className="px-4 py-3 border border-gray-600 rounded-md bg-white/10 text-white focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <input
            className="px-4 py-3 border border-gray-600 rounded-md bg-white/10 text-white focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button
            className="px-4 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            type="submit"
            disabled={submitting}
          >
            {flow === 'signIn' ? 'Sign in' : 'Sign up'}
          </button>
          <div className="text-center text-sm text-gray-400">
            <span>
              {flow === 'signIn'
                ? "Don't have an account? "
                : 'Already have an account? '}
            </span>
            <button
              type="button"
              className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors duration-200"
              onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
            >
              {flow === 'signIn' ? 'Sign up instead' : 'Sign in instead'}
            </button>        </div>
        </form>
        <div className="flex items-center justify-center my-3">
          <hr className="my-4 grow border-gray-200" />
          <span className="mx-4 text-gray-400">or</span>
          <hr className="my-4 grow border-gray-200" />
        </div>
        <button
          className="px-4 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200 w-full"
          onClick={() => signIn('anonymous')}
        >
          Sign in anonymously
        </button>
      </div>
    </div>
  );
};

export default SignInForm;