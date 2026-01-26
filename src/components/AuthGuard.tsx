"use client";

import * as signalR from "@microsoft/signalr";
import { Toaster, toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { SignalRProvider, useSignalR } from "../context/SignalRContext";
import { useEffect, useState, useRef } from "react";

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
    const { setConnection } = useSignalR();
    // 🔥 1. Folosim useRef ca să ținem conexiunea "vie" între randări
    const connectionRef = useRef<signalR.HubConnection | null>(null);


    useEffect(() => {
        

        if (!token) return;

        // 🔥 2. Creăm instanța O SINGURĂ DATĂ. 
        // Dacă React randează componenta de 10 ori, noi folosim aceeași instanță.
        if (!connectionRef.current) {
            connectionRef.current = new signalR.HubConnectionBuilder()
                .withUrl(process.env.NEXT_PUBLIC_WEBSOCKETS_URL ?? "http://localhost:7002/hubs/surveillance", {
                    accessTokenFactory: () => token,
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .build();
        }

        const conn = connectionRef.current;

        const startSocket = async () => {
            // 🔥 3. Pornim doar dacă e deconectat.
            // Dacă e "Connecting" (din cauza Strict Mode), nu facem nimic, îl lăsăm să termine.
            if (conn.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await conn.start();
                    console.log("🟢 SignalR Connected (Stable)");

                    // Re-atașăm listenerii (pentru că pot fi pierduți la re-mount)
                    conn.off("ReceiveUrgentAlert");
                    conn.on("ReceiveUrgentAlert", (msg) => {
                        const audio = new Audio('/sounds/alarm.mp3');
                        audio.play().catch(() => {});
                        toast.error(`ALERTĂ CRITICĂ: ${msg}`, { duration: 10000 });
                    });

                    setConnection(conn);
                } catch (err) {
                    console.error("SignalR Start Error:", err);
                }
            } else if (conn.state === signalR.HubConnectionState.Connected) {
                // Dacă e deja conectat (de la randarea anterioară), doar îl punem în context
                setConnection(conn);
            }
        };

        startSocket();
        return () => {
            conn.off("ReceiveUrgentAlert");
        };
    }, [token]); // Rulăm efectul doar când se schimbă token-ul

    return <>{children}</>;
}
// --- COMPONENTA PRINCIPALĂ (AUTH GUARD) ---
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const pathname = usePathname(); // <--- Hook nou
    const isPublicPage = pathname.startsWith("/auth");

    useEffect(() => {
        if (isPublicPage) {
            // Dacă suntem pe login, nu facem verificări
            return; 
        }

        const storedToken = getStoredToken();
        if (!storedToken) {
            router.push("/auth/login");
        } else {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, [router, pathname, isPublicPage]);

    
    if (isPublicPage) {
        // Dacă suntem pe login, nu facem verificări
        return <>{children}</>; 
    }

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