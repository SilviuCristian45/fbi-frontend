"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 flex items-center justify-center">Se încarcă harta... 🌍</div>
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 👇 UPDATED: Acum primim și 'details'
  onSubmit: (lat: number, lng: number, details: string) => void;
  personName: string;
}

export default function MapModal({ isOpen, onClose, onSubmit, personName }: MapModalProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  // 👇 NEW: State pentru text
  const [details, setDetails] = useState("");

  // Resetăm poziția și textul când se deschide modalul
  useEffect(() => {
    if (isOpen) {
        setPosition(null);
        setDetails(""); // Reset text
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">Raportează Locație: {personName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="overflow-y-auto flex-grow">
            
            {/* Map Body */}
            <div className="relative w-full h-80 bg-gray-100 border-b border-gray-200">
                <MapInner position={position} setPosition={setPosition} />
                {!position && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold shadow-md border border-yellow-200 pointer-events-none">
                        📍 Apasă pe hartă pentru a pune pinul
                    </div>
                )}
            </div>

            {/* 👇 NEW: Zona de Detalii */}
            <div className="p-4 bg-gray-50 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    Detalii suplimentare (Opțional)
                </label>
                <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ex: Purta o jachetă roșie, ochelari de soare și a intrat în stația de metrou..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-h-[100px] resize-y text-gray-800"
                />
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white flex justify-end gap-3 border-t shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded transition-colors"
          >
            Anulează
          </button>
          <button 
            // 👇 UPDATED: Trimitem și details
            onClick={() => position && onSubmit(position[0], position[1], details)}
            disabled={!position}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <span>Trimite Raport</span> 🚀
          </button>
        </div>
      </div>
    </div>
  );
}