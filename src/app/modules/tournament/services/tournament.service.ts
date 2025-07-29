import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { TournamentTeam } from '../models/team.model';
import { Match } from '../models/match.model';
import { Team } from '../../admin/models/equipos.model';
import { PlayerDivision } from '../../admin/models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  constructor(private firestore: Firestore) {}

  async getTeams(count: number): Promise<TournamentTeam[]> {
  const teamsCollection = collection(this.firestore, 'teams');
  const querySnapshot = await getDocs(teamsCollection);
  
  const teams: TournamentTeam[] = [];
  querySnapshot.forEach((doc) => {
    const teamData = doc.data() as Team;
    if (teamData.status === 'active' && teamData.players?.length >= 5) {
      teams.push({
        id: doc.id,
        name: teamData.name,
        tournamentId: '',
        originalTeamId: doc.id,
        captainId: teamData.captainId,
        icon: teamData.logo || '🏆',
        players: teamData.players.map(p => ({
          uid: p.uid,
          nick: p.nick,
          role: p.role,
          avatar: p.avatar,
          mmr: p.mmr,
          medalImage: p.medalImage,
          idDota: p.idDota
        })),
        division: teamData.division || PlayerDivision.PorDefinir,
        createdAt: new Date(),
        isActive: true,
        stats: {
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0
        }
      });
    }
  });

  return teams
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

  generateSingleEliminationBracket(teams: TournamentTeam[]): Match[] {
    // El resto del método permanece igual
    const matches: Match[] = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // Random seeding
    
    const totalTeams = shuffledTeams.length;
    const totalRounds = Math.ceil(Math.log2(totalTeams));
    const totalMatches = totalTeams - 1;
    const firstRoundMatches = totalTeams / 2;
    
    // Generate first round matches
    for (let i = 0; i < firstRoundMatches; i++) {
      matches.push({
        id: `round-1-match-${i}`,
        round: 1,
        team1: shuffledTeams[i * 2],
        team2: shuffledTeams[i * 2 + 1],
        isCompleted: false
      });
    }
    
    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `round-${round}-match-${i}`,
          round,
          isCompleted: false
        });
      }
    }
    
    return matches;
  }

  getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const q = query(
    collection(this.firestore, 'tournament_teams'),
    where('tournamentId', '==', tournamentId),
    where('isActive', '==', true)
  );

  return getDocs(q).then(snapshot => 
    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentTeam))
  );
}
}
