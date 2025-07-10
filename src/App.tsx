"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import Dashboard from "./components/Dashboard";
import BackgroundImage from "./assets/images/campus.jpg";
import { SignOutButton } from "./SignOutButton"; // Assuming SignOutButton is in a separate file

export default function App() {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient overlay over background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-80 z-0"></div>

      {/* Actual content overlaid */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center p-4 md:p-6 bg-white bg-opacity-5 backdrop-blur-lg shadow-lg">
          <img
            src="src/assets/images/logo.jpeg"
            alt="College Logo"
            className="w-16 h-16 md:w-48 md:h-28 rounded-2xl shadow-lg mr-4"
          />
          <div className="flex-grow basis-0 text-center -ml-48">
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#38d8cb] leading-tight tracking-wide">
              SRI KRISHNA COLLEGE OF TECHNOLOGY
            </h1>
            <p className="text-sm md:text-base font-semibold text-[#F9A825] mt-1">
              AUTONOMOUS INSTITUTION | ACCREDITED BY NAAC WITH ‘A’ GRADE
            </p>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 flex justify-center items-center px-4 py-8">
          <Content />
        </main>
        <Toaster />
      </div>
    </div>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        {currentUser ? (
          <Dashboard user={currentUser} />
        ) : (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center text-white">
              <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-300 mx-auto"></div>
            </div>
          </div>
        )}
      </Authenticated>

      <Unauthenticated>
        <SignInCard />
      </Unauthenticated>
    </>
  );
}

function SignInCard() {
  return (
    <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Staff Timetable Manager</h1>
        <p className="text-blue-200 mt-1">Sign in to access the timetable system</p>
      </div>
      <SignInForm />
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.target as HTMLFormElement);
        formData.set("flow", flow);
        void signIn("password", formData).catch((error) => {
          let toastTitle = "";
          if (error.message.includes("Invalid password")) {
            toastTitle = "Invalid password. Please try again.";
          } else {
            toastTitle =
              flow === "signIn"
                ? "Could not sign in, did you mean to sign up?"
                : "Could not sign up, did you mean to sign in?";
          }
          toast.error(toastTitle);
          setSubmitting(false);
        });
      }}
    >
      <input
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 transition duration-200"
        type="email"
        name="email"
        placeholder="Email"
        required
      />
      <input
        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 transition duration-200"
        type="password"
        name="password"
        placeholder="Password"
        required
      />
      <button
        className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 ${
          submitting
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        type="submit"
        disabled={submitting}
      >
        {flow === "signIn" ? "Sign in" : "Sign up"}
      </button>

      <div className="text-center text-sm text-white mt-2">
        {flow === "signIn"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          type="button"
          className="text-blue-300 hover:text-blue-100 hover:underline font-medium cursor-pointer"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
        >
          {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
        </button>
      </div>

      <div className="flex items-center justify-center my-4">
        <hr className="w-1/3 border-gray-400" />
        <span className="mx-4 text-gray-300">or</span>
        <hr className="w-1/3 border-gray-400" />
      </div>

      <button
        className="w-full py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition duration-200"
        onClick={() => void signIn("anonymous")}
        type="button"
      >
        Sign in anonymously
      </button>
    </form>
  );
}