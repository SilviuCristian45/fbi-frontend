"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { SignalRProvider, useSignalR } from "../context/SignalRContext";

// 👇 Helper simplu să luăm tokenul (Adaptează cheia dacă o ții altfel)
function getStoredToken() {
    if (typeof window !== "undefined") {
        // Verifică cum ai salvat tokenul la login. De obicei e "token" sau "accessToken"
        return localStorage.getItem("token") || localStorage.getItem("accessToken");
    }
    return null;
}

// --- COMPONENTA INTERNĂ (MANAGER) ---
interface SignalRManagerProps {
    children: React.ReactNode;
    token: string | null;
}

function SignalRManager({ children, token }: SignalRManagerProps) {
    const { connection, setConnection } = useSignalR();

    useEffect(() => {
        // Dacă nu avem token sau avem deja conexiune, nu facem nimic
        if (!token || connection) return;

        console.log("🔌 Inițializare SignalR Global...");

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(process.env.NEXT_PUBLIC_WEBSOCKETS_URL ?? "", { 
                accessTokenFactory: () => token // Folosim token-ul din localStorage
            })
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => {
                console.log("🟢 Global SignalR Connected");
                
                // ASCULTĂM ALERTELE GLOBALE
                newConnection.on("ReceiveUrgentAlert", (msg) => {
                    // Sunet de alarmă
                    const audio = new Audio('/sounds/alarm.mp3'); 
                    audio.play().catch(() => {});

                    // Toast care nu dispare singur
                    toast.error(
                        (t) => (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg uppercase">Alertă Critică!</span>
                                <span>{msg}</span>
                                <button 
                                    onClick={() => toast.dismiss(t.id)}
                                    className="mt-2 bg-white text-red-600 px-2 py-1 rounded text-xs font-bold"
                                >
                                    Confirmare
                                </button>
                            </div>
                        ), 
                        { duration: 10000, position: "top-center" }
                    );
                });

                setConnection(newConnection);
            })
            .catch(err => console.error("SignalR Connection Error:", err));

        // Cleanup
        return () => {
            newConnection.stop();
            setConnection(null);
        };
    }, [token]);

    return <>{children}</>;
}

// --- COMPONENTA PRINCIPALĂ (AUTH GUARD) ---
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 1. Verificăm dacă avem token la încărcarea paginii
        const storedToken = getStoredToken();
        
        if (!storedToken) {
            // Dacă nu e logat, îl trimitem la login
            router.push("/auth/login"); // ⚠️ Pune aici ruta ta de Login
        } else {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, [router]);

    // Dacă nu e autentificat, nu afișăm nimic (așteptăm redirectul)
    if (!isAuthenticated) return null;

    return (
        <SignalRProvider>
            <SignalRManager token={token}>
                <Toaster />
                {children}
            </SignalRManager>
        </SignalRProvider>
    );
}