"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { getWantedPersonById } from "@/src/lib/api-client";
import { WantedPersonDetail } from "@/src/types/wanted-person";
import Link from "next/link";
import SightingsList from "@/src/components/SightingsList"; // <--- Importăm componenta nouă

export default function WantedDetailPage() {
  const { id } = useParams(); // Luăm ID-ul din URL
  const router = useRouter();
  
  const [person, setPerson] = useState<WantedPersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const loadPerson = async () => {
      if (!id) return;
      
      try {
        const result = await getWantedPersonById(id as string);
        setPerson(result.data);
        // Setăm prima imagine ca imagine principală default
        if (result.data.images && result.data.images.length > 0) {
          setSelectedImage(result.data.images[0]);
        }
      } catch (error) {
        console.error("Nu am găsit persoana:", error);
        // router.push("/"); 
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!person) {
    return <div className="p-10 text-center">Persoana nu a fost găsită.</div>;
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Buton Back */}
          <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium">
            &larr; Înapoi la listă
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
            
            {/* Header cu Titlu */}
            <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
              <h1 className="text-3xl md:text-4xl font-bold text-center uppercase tracking-wide text-red-500">
                {person.title}
              </h1>
              {person.subjects && person.subjects.length > 0 && (
                 <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {person.subjects.map(sub => (
                        <span key={sub} className="bg-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase text-gray-200">
                            {sub}
                        </span>
                    ))}
                 </div>
              )}
            </div>

            {/* SECȚIUNEA 1: POZE ȘI DETALII FIZICE (TOP) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8 bg-white">
              
              {/* STÂNGA: Galerie Foto */}
              <div className="lg:col-span-1 space-y-4">
                {/* Imaginea Mare */}
                <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200 relative">
                    <img 
                        src={selectedImage || '/placeholder.png'} 
                        alt={person.title}
                        className="w-full h-full object-contain bg-neutral-900"
                    />
                     {person.rewardText && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-center py-2 font-bold backdrop-blur-sm">
                            REWARD: {person.rewardText}
                        </div>
                     )}
                </div>

                {/* Thumbnails */}
                {person.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {person.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${selectedImage === img ? 'border-red-500 opacity-100' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* DREAPTA: Statistici și Detalii Fizice */}
              <div className="lg:col-span-2">
                 <h3 className="text-gray-900 font-bold text-xl border-b pb-2 mb-4 flex items-center gap-2">
                    📊 Physical Identification
                 </h3>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <DetailItem label="Sex" value={person.sex} />
                    <DetailItem label="Race" value={person.race} />
                
                    <DetailItem label="Hair" value={person.hair} />
                    <DetailItem label="Eyes" value={person.eyes} />
                 </div>

                 {/* Alias-uri */}
                 {person.aliases && person.aliases.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Known Aliases</h4>
                        <div className="flex flex-wrap gap-2">
                            {person.aliases.map((alias, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-mono border border-gray-200">
                                    {alias}
                                </span>
                            ))}
                        </div>
                    </div>
                 )}
              </div>
            </div>

            {/* SECȚIUNEA 2: DESCRIERE COMPLEXĂ ȘI LIVE FEED (BOTTOM) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8 border-t border-gray-200 bg-gray-50">
                
                {/* STÂNGA (2/3): Descriere Text și Caution */}
                <div className="lg:col-span-2 space-y-8">
                     
                     {/* Caution / Remarks */}
                     {(person.caution || person.details) && (
                        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg shadow-sm">
                            <h3 className="text-red-700 font-bold text-lg mb-3 flex items-center gap-2 uppercase tracking-wider">
                                ⚠️ Caution / Remarks
                            </h3>
                            <div 
                                className="prose prose-sm text-gray-800 max-w-none"
                                dangerouslySetInnerHTML={{ __html: person.caution || person.details || "" }} 
                            />
                        </div>
                    )}

                    {/* Descriere Textuală */}
                    {person.description && (
                        <div>
                            <h3 className="text-gray-900 font-bold text-xl mb-3">Case Details</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                {person.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* DREAPTA (1/3): LIVE INTEL FEED */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        {/* AICI ESTE COMPONENTA NOUĂ */}
                        <SightingsList wantedId={person.id} />
                        
                        <div className="mt-4 text-xs text-gray-500 text-center">
                            Datele sunt criptate și accesibile doar personalului autorizat.<br/>
                            Folosiți butonul "Raportează" din lista principală pentru a adăuga informații noi.
                        </div>
                    </div>
                </div>

            </div>

          </div>
        </div>
      </main>
    </AuthGuard>
  );
}

// Helper pentru tabel
function DetailItem({ label, value, fullWidth = false }: { label: string, value?: string, fullWidth?: boolean }) {
    if (!value) return null;
    return (
        <div className={`bg-white p-3 rounded border border-gray-200 shadow-sm ${fullWidth ? 'col-span-2 sm:col-span-3' : ''}`}>
            <span className="block text-xs text-gray-400 uppercase font-bold mb-1">{label}</span>
            <span className="text-gray-900 font-semibold text-sm">{value}</span>
        </div>
    )
}