"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { authFetch } from "@/src/lib/api-client";
// 🔥 1. Importăm Toast
import toast, { Toaster } from "react-hot-toast";

interface Sighting {
    id: number;
    lat: number;
    lng: number;
    details: string;
    reportedBy: string;
    timestamp: string;
    wantedPersonId: number;
}

export default function SightingsList({ wantedId }: { wantedId: number }) {
    const [sightings, setSightings] = useState<Sighting[]>([]);
    const [loading, setLoading] = useState(true);
    const [highlightId, setHighlightId] = useState<number | null>(null);

    const playNotificationSound = () => {
        try {
            const audio = new Audio("https://freesound.org/embed/sound/iframe/738813/");
            audio.volume = 0.5;
            audio.play().catch((e) => console.log("Audio autoplay blocked", e));
        } catch (error) {
            console.error("Audio error", error);
        }
    };

    // --- Funcție Helper pentru Notificare Personalizată ---
    const showTacticalToast = (report: Sighting) => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-slate-900 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-500`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {/* Iconiță Radar Pulsând */}
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-red-400 uppercase tracking-wider">
                                New Intel Received
                            </p>
                            <p className="mt-1 text-sm text-gray-300">
                                Agent <span className="text-white font-semibold">{report.reportedBy}</span> a raportat o locație nouă!
                            </p>
                            <p className="mt-1 text-xs text-gray-500 italic line-clamp-1">
                                "{report.details}"
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: "top-right" });
    };

    // 1. HTTP Load
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await authFetch<Sighting[]>(`/FbiWanted/${wantedId}/sightings`);
                // @ts-ignore 
                const list = Array.isArray(res) ? res : res.data || [];
                setSightings(list);
            } catch (err) {
                console.error("Error loading history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [wantedId]);

    // 2. SignalR
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:7002/hubs/surveillance", {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connection.start().catch(err => console.error("SignalR error:", err));

        connection.on("ReceiveLocation", (newReport: Sighting) => {
            if (newReport.wantedPersonId === Number(wantedId)) {
                setSightings(prev => [newReport, ...prev]);
                setHighlightId(newReport.id);
                
                // 🔥 AICI SE ÎNTÂMPLĂ MAGIA
                playNotificationSound();   // 🔊 Sunet
                showTacticalToast(newReport); // 🔔 Notificare Vizuală

                setTimeout(() => setHighlightId(null), 5000);
            }
        });

        return () => {
            connection.stop();
        };
    }, [wantedId]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* 🔥 2. Adăugăm componenta Toaster aici (invizibilă până apare notificarea) */}
            <Toaster />

            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Live Intelligence Feed
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Secured Channel</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-300">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Se decriptează datele...</div>
                ) : sightings.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">
                        Nicio raportare recentă în baza de date.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sightings.map((report) => {
                            const isNew = report.id === highlightId;
                            return (
                                <div 
                                    key={report.id} 
                                    className={`p-4 transition-all duration-1000 ${
                                        isNew 
                                            ? "bg-red-100 border-l-4 border-red-500 shadow-inner" 
                                            : "hover:bg-slate-50 border-l-4 border-transparent"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-sm ${isNew ? 'text-red-800' : 'text-blue-700'}`}>
                                                Agent {report.reportedBy}
                                            </span>
                                            <span className="text-xs text-gray-400">• {new Date(report.timestamp).toLocaleString()}</span>
                                            {isNew && <span className="text-xs bg-red-500 text-white px-1.5 rounded font-bold animate-pulse">NEW</span>}
                                        </div>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 px-2 py-1 rounded border border-gray-200 transition-colors"
                                        >
                                            Vezi pe Harta 🗺️
                                        </a>
                                    </div>
                                    <p className="text-gray-800 text-sm mt-2 font-medium">{report.details}</p>
                                    <div className="mt-2 text-xs font-mono text-gray-500 flex gap-4">
                                        <span>LAT: {report.lat.toFixed(5)}</span>
                                        <span>LNG: {report.lng.toFixed(5)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}