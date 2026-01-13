"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import { authFetch } from "@/src/lib/api-client";
import { PagedResult, WantedPersonSummary } from "@/src/types/wanted-person";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState<PagedResult<WantedPersonSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE-URI ---
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        ...(debouncedSearch && { Search: debouncedSearch }),
      });

      // API call
      const result = await authFetch<PagedResult<WantedPersonSummary>>(
        `FbiWanted?${params.toString()}`
      );
      
      setData(result.data); // result.data este obiectul { totalCount, items }
    } catch (error) {
      console.error("Eroare:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, debouncedSearch]);

  // --- HANDLERS ---
  const handlePrevPage = () => {
    if (pageNumber > 1) setPageNumber(prev => prev - 1);
  };

  const handleNextPage = () => {
    // Folosim variabila calculată 'totalPages'
    if (pageNumber < totalPages) setPageNumber(prev => prev + 1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = parseInt(e.target.value);
      setPageSize(newSize);
      setPageNumber(1);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-bold text-gray-900">
              FBI Most Wanted 🕵️‍♂️
            </h1>
            <button 
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm font-medium"
            >
                Logout
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-8 bg-white p-4 rounded-xl shadow-sm">
            <input 
              type="text" 
              placeholder="Caută după nume sau descriere..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* GRID */}
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
          ) : (
            <>
                {/* Rezultate: Folosim data.items acum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {data?.items.map((person) => (
                    <Link 
                    href={`/wanted/${person.id}`} // <--- AICI ESTE LEGĂTURA
                    key={person.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    <div key={person.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                      <div className="h-64 w-full relative bg-gray-200">
                        <img 
                          src={person.mainImageUrl || '/placeholder.png'} 
                          alt={person.title}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image'; }}
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h2 className="font-bold text-lg text-gray-800 line-clamp-1" title={person.title}>{person.title}</h2>
                        {person.rewardText && (
                          <p className="text-sm text-green-600 font-semibold mt-1 truncate">💰 {person.rewardText}</p>
                        )}
                      </div>
                    </div>
                    </Link>
                  ))}
                </div>

                {/* ZONA DE CONTROL JOS */}
                {data && data.totalCount > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-4 bg-white p-4 rounded-xl shadow-sm">
                        
                        {/* Selector Page Size */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select 
                                value={pageSize} 
                                onChange={handlePageSizeChange}
                                className="border border-gray-300 rounded p-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="48">48</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        {/* Controale Pagină */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handlePrevPage}
                                disabled={pageNumber === 1}
                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                &larr; Prev
                            </button>
                            
                            <span className="text-gray-700 font-medium">
                                {/* Folosim 'pageNumber' din state și 'totalPages' calculat */}
                                Page <span className="text-blue-600">{pageNumber}</span> of {totalPages}
                            </span>

                            <button 
                                onClick={handleNextPage}
                                disabled={pageNumber >= totalPages} // Disable dacă suntem la capăt
                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                Next &rarr;
                            </button>
                        </div>
                        
                        {/* Info Total: folosim data.totalCount */}
                        <div className="text-sm text-gray-500">
                            Total: {data.totalCount} records
                        </div>
                    </div>
                )}

                {/* Verificăm data.items.length */}
                {data?.items.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-lg">
                        Nu am găsit rezultate.
                    </div>
                )}
            </>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}