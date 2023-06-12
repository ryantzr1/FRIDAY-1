import "@/styles/globals.css";
import Sidebar from "../components/Sidebar";
import { AuthContextProvider } from "../context/AuthContext";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";

const noAuthRequired = ["/signin", "/signup"];

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <div>
      <AuthContextProvider>
        <Sidebar>
          {noAuthRequired.includes(router.pathname) ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )}
        </Sidebar>
      </AuthContextProvider>
    </div>
  );
}
