// src/components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificăm doar pe client
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (!token) {
        // Nu avem token -> Redirect la Login
        router.push("/login");
      } else {
        // Avem token -> Afișăm conținutul
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Până se decide dacă e logat sau nu, arătăm un spinner/loading
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Verificare acces... 🕵️‍♂️</div>
      </div>
    );
  }

  // Dacă e logat, randăm pagina protejată
  return <>{children}</>;
}