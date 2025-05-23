import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from 'src/app/modules/admin/models/equipos.model';
import { PlayerService } from 'src/app/modules/admin/services/player.service';
import { TeamService } from 'src/app/modules/main-menu/services/team.service';

@Component({
  selector: 'app-buscar-rivales-component',
  templateUrl: './buscar-rivales-component.component.html',
  styleUrls: ['./buscar-rivales-component.component.css']
})
export class BuscarRivalesComponentComponent {
teams: Team[] = [];
private teamSubscription!: Subscription;
// En tu archivo buscar-rivales-component.component.ts

rolesOrder = [
  { key: 'Hard Support', label: 'Hard Support' },
  { key: 'Offlane', label: 'Offlane' },
  { key: 'Mid Lane', label: 'Mid Lane' },
  { key: 'Carry (Safe Lane)', label: 'Carry (Safe Lane)' },
  { key: 'Soft Support', label: 'Soft Support' }
];

  constructor(private playerService: PlayerService, private router: Router, private teamService: TeamService) {}


  ngOnInit(): void {
    this.loadTeamsRealTime();
  }

  ngOnDestroy(): void {
    if (this.teamSubscription) {
      this.teamSubscription.unsubscribe();
    }
  }

  loadTeamsRealTime(): void {
    this.teamSubscription = this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (err) => {
        console.error('Error loading teams:', err);
      }
    });
  }

  goToLobby(): void {
  this.router.navigate(['/lobby']); // Cambia '/lobby' por la ruta correcta
}

goToLiveMatches(): void {
  this.router.navigate(['/live-matches']); // Cambia por tu ruta real
}

getMemberByRole(players: any[], role: string): any {
  return players.find(player => player.role === role);
}

  // getTeamRank(team: Team): string {
  //   // Implement your ranking logic here
  //   const avgMmr = team.players.reduce((sum, player) => sum + player.mmr, 0) / team.players.length;
  //   if (avgMmr > 5000) return 'S';
  //   if (avgMmr > 4000) return 'A';
  //   if (avgMmr > 3000) return 'B';
  //   return 'C';
  // }

  hasRoleFilled(team: Team, role: string): boolean {
    return team.players.some(player => player.role === role);
  }
}
