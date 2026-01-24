import { ReportItem } from "../types/reports";

interface Props {
  report: ReportItem | null;
  onClose: () => void;
}

export function ReportDetailsModal({ report, onClose }: Props) {
  if (!report) return null;

  // Funcție ca să închidem modalul când dăm click pe fundalul negru
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // 1. BACKDROP (Fundal întunecat)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      {/* 2. MODAL CONTENT (Fereastra albă) */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Analysis Report #{report.id}</h2>
            <p className="text-sm text-gray-500">{report.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* BODY (Split View) */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* STÂNGA: EVIDENCE (Poza Agentului) */}
          <div className="w-full md:w-5/12 bg-gray-100 p-6 flex flex-col items-center justify-center border-r border-gray-200 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 self-start">📸 Original Evidence</h3>
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-4 border-white">
              <img 
                src={report.url} 
                className="w-full h-full object-cover"
                alt="Original Suspect" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=No+Image'; }}
              />
            </div>
            <div className="mt-6 w-full bg-white p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-bold">Details</p>
                <p className="text-gray-800 mt-1">{report.name}</p>
            </div>
          </div>

          {/* DREAPTA: AI RESULTS (Lista Scrollabilă) */}
          <div className="w-full md:w-7/12 bg-white flex flex-col">
             <div className="p-4 bg-white border-b sticky top-0 z-10">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    🤖 AI Identification Results ({report.matches?.length || 0})
                </h3>
             </div>

             <div className="overflow-y-auto p-4 space-y-4 flex-1">
                {(!report.matches || report.matches.length === 0) ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-4xl mb-2">✅</div>
                        <p>No matches found in the FBI database.</p>
                    </div>
                ) : (
                    report.matches.map((match, idx) => (
                        <div 
                            key={idx} 
                            className={`flex gap-4 p-4 rounded-xl border-2 transition-all ${
                                match.confidence > 80 
                                ? "border-red-100 bg-red-50/30" 
                                : "border-gray-100 hover:border-blue-200"
                            }`}
                        >
                            {/* Poza FBI */}
                            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
                                <img 
                                    src={match.url} 
                                    className="w-full h-full object-cover"
                                    alt="FBI Record" 
                                />
                            </div>

                            {/* Info Match */}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Candidate #{idx + 1}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        match.confidence > 80 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                        {match.confidence.toFixed(2)}% Match
                                    </span>
                                </div>
                                
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">Source Database Record:</p>
                                    <a href={match.url} target="_blank" className="text-blue-600 hover:underline text-xs break-all line-clamp-1">
                                        {match.url}
                                    </a>
                                </div>

                                {/* Bara de progres vizuală */}
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full ${match.confidence > 80 ? "bg-red-500" : "bg-blue-500"}`} 
                                        style={{ width: `${match.confidence}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}