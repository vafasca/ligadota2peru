// match.model.ts
export interface Match {
    id: string;
    result: 'win' | 'loss';
    date: Date;
    heroName: string;
    heroImage: string;
    kills: number;
    deaths: number;
    assists: number;
    ratingChange: number;
  }