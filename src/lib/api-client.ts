import { ApiResponse } from "../types/api";
import { WantedPersonDetail } from "@/src/types/wanted-person";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url; // E deja complet
  }
  // Dacă nu are slash la început, adăugăm unul
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function fetchWithGeneric<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const finalUrl = normalizeUrl(url);
  const response = await fetch(finalUrl, options);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message?.join(", ") || "API Error");
  }

  return json as ApiResponse<T>;
}


export async function authFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const finalUrl = normalizeUrl(url);
  // 1. Pregătim Headers
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}), // Păstrăm și alte headere dacă au fost trimise
  } as Record<string, string>;

  // 2. Extragem Token-ul din LocalStorage (Doar pe client)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  // 3. Apelăm fetch-ul generic cu noile headere
  return fetchWithGeneric<T>(finalUrl, {
    ...options,
    headers,
  });
}



// ... funcțiile existente authFetch, etc ...

// Funcție nouă pentru detalii
export async function getWantedPersonById(id: string | number): Promise<ApiResponse<WantedPersonDetail>> {
  return authFetch<WantedPersonDetail>(`/FbiWanted/${id}`);
}