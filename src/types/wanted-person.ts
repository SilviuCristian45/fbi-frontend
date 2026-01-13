export interface PagedResult<T> {
  totalCount: number;
  data: T[];
}

export interface WantedPersonSummary {
  id: number;
  title: string;
  description?: string;
  rewardText?: string;
  mainImageUrl?: string;
  publicationDate?: string;
}

export interface WantedPersonDetail {
  id: number;
  title: string;
  description?: string;
  details?: string;
  caution?: string;
  rewardText?: string;
  sex?: string;
  race?: string;
  hair?: string;
  eyes?: string;
  images: string[];
  aliases: string[];
  subjects: string[];
}