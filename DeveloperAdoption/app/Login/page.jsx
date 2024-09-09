"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import background2 from "../../public/Login.jpg";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (email === "" || password === "") {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User logged in:", user);
      const idToken = await userCredential.user.getIdToken();

      // Send the ID token to your API to set the session cookie
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        // Redirect to dashboard or handle successful login
        router.push("/")
      } else {
        // Handle error
        setErrorMessage("Failed to set session");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setErrorMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="relative flex w-full max-w-4xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <motion.div
          className="w-full lg:w-1/2 p-8 flex flex-col justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="text-5xl text-blue-600">
              <FontAwesomeIcon icon={faSignInAlt} className="text-blue-500" />
            </div>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold text-center text-gray-800 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome!
          </motion.h2>
          <p className="text-center text-gray-500 mb-6">
            Sign in to your account
          </p>
          {errorMessage && (
            <motion.div
              className="mb-4 text-red-500 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {errorMessage}
            </motion.div>
          )}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              <label
                className="block text-gray-600 text-sm md:text-base mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-600 text-sm md:text-base mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FontAwesomeIcon
                  icon={faLock}
                  className="w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="w-4 h-4 text-blue-600 form-checkbox"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me?
                </label>
              </div>
              <Link
                href="/SignUp"
                className="text-sm text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </div>
            <motion.button
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
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
                "Login"
              )}
            </motion.button>
          </motion.form>
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href="/Login/password-reset"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hidden lg:block w-1/2 relative"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Image
            src={background2}
            alt="Login Background"
            layout="fill"
            objectFit="cover"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
