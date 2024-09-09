"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import { motion } from "framer-motion";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account with that email exists, a password reset link has been sent.");
      setError("");
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-200 flex items-center justify-center">
      <motion.div
        className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-semibold text-center text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Reset Password
        </motion.h2>
        <p className="text-center text-gray-500">Enter your email to receive a password reset link.</p>
        {message && (
          <motion.div
            className="mb-4 text-green-500 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="mb-4 text-red-500 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        )}
        <motion.form
          onSubmit={handleResetRequest}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-600" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                className="flex justify-center items-center"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full"></div>
              </motion.div>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default PasswordReset;
