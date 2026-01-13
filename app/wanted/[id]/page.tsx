"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { getWantedPersonById } from "@/src/lib/api-client";
import { WantedPersonDetail } from "@/src/types/wanted-person";
import Link from "next/link";

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
        // Opțional: redirect la 404 sau înapoi
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
        <div className="max-w-6xl mx-auto">
          
          {/* Buton Back */}
          <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium">
            &larr; Înapoi la listă
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            
            {/* Header cu Titlu */}
            <div className="bg-slate-900 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold text-center uppercase tracking-wide">
                {person.title}
              </h1>
              {person.subjects && person.subjects.length > 0 && (
                 <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {person.subjects.map(sub => (
                        <span key={sub} className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {sub}
                        </span>
                    ))}
                 </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
              
              {/* STÂNGA: Galerie Foto */}
              <div className="lg:col-span-1 space-y-4">
                {/* Imaginea Mare */}
                <div className="aspect-[3/4] w-full bg-gray-200 rounded-lg overflow-hidden shadow-md border-4 border-gray-100 relative">
                    <img 
                        src={selectedImage || '/placeholder.png'} 
                        alt={person.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Thumbnails */}
                {person.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {person.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setSelectedImage(img)}
                                className={`w-20 h-20 flex-shrink-0 rounded border-2 overflow-hidden ${selectedImage === img ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
              </div>

              {/* DREAPTA: Informații */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Recompensă */}
                {person.rewardText && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <h3 className="text-green-800 font-bold uppercase text-sm mb-1">Reward</h3>
                        <p className="text-green-900 font-semibold">{person.rewardText}</p>
                    </div>
                )}

                {/* Descriere */}
                <div>
                    <h3 className="text-gray-900 font-bold text-xl border-b pb-2 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {person.description || "No description available."}
                    </p>
                </div>

                {/* Tabel Detalii Fizice */}
                <div>
                    <h3 className="text-gray-900 font-bold text-xl border-b pb-2 mb-3">Physical Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <DetailItem label="Sex" value={person.sex} />
                        <DetailItem label="Race" value={person.race} />
                        <DetailItem label="Hair" value={person.hair} />
                        <DetailItem label="Eyes" value={person.eyes} />
                    </div>
                </div>

                {/* Alias-uri */}
                {person.aliases && person.aliases.length > 0 && (
                    <div>
                        <h3 className="text-gray-900 font-bold text-xl border-b pb-2 mb-3">Aliases</h3>
                        <div className="flex flex-wrap gap-2">
                            {person.aliases.map((alias, i) => (
                                <span key={i} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-mono">
                                    {alias}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Caution / Remarks (HTML Content) */}
                {/* Atenție: API-ul FBI returnează HTML aici, deci folosim dangerouslySetInnerHTML */}
                {(person.caution || person.details) && (
                    <div className="bg-red-50 border border-red-100 p-5 rounded-lg">
                        <h3 className="text-red-700 font-bold text-lg mb-2 flex items-center gap-2">
                             ⚠️ Caution / Remarks
                        </h3>
                        <div 
                            className="prose prose-sm text-gray-800"
                            dangerouslySetInnerHTML={{ __html: person.caution || person.details || "" }} 
                        />
                    </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}

// O mică componentă helper pentru tabel
function DetailItem({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <span className="block text-xs text-gray-500 uppercase font-bold">{label}</span>
            <span className="text-gray-800 font-medium">{value}</span>
        </div>
    )
}