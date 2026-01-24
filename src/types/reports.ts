// src/types/reports.ts
import { PagedResult } from "./wanted-person"; // Refolosim PagedResult existent

export interface MatchItem {
  url: string;
  confidence: number;
}

export interface ReportItem {
  id: number;
  name: string; // Titlul raportului
  url: string;  // Poza incarcata de agent
  matches: MatchItem[]; // Lista de suspecti gasiti
}

// Folosim tipul generic PagedResult definit anterior
export type ReportPagedResult = PagedResult<ReportItem>;