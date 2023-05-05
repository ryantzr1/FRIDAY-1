import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to the home page if the user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/");
      }
    });

    // Unsubscribe from the listener when the component unmounts
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(email, password);
      router.push("/");
    } catch (error) {
      setError("Invalid email or password.");
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-200 h-screen">
      <div className="flex justify-center items-center h-screen">
        <div className="bg-gray-800 w-full max-w-md rounded-lg shadow-lg">
          <div className="py-8 px-8 rounded-lg">
            <h1 className="text-3xl text-center font-bold mb-8 text-green-500">
              Welcome back!
            </h1>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-400 font-bold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-400 font-bold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
              )}
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                Sign in
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm font-medium">
                New to our platform?
              </p>
              <a
                href="/login"
                className="text-green-500 hover:text-green-600 font-bold"
              >
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}