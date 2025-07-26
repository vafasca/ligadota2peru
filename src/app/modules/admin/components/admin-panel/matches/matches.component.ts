import { Component } from '@angular/core';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent {
pendingMatches = [
    { 
      teamA: 'Team Elite', 
      teamB: 'New Challengers', 
      tournament: 'Dota 2 Championship', 
      scheduledTime: new Date(Date.now() + 86400000) 
    },
    { 
      teamA: 'Veterans', 
      teamB: 'Rookies', 
      tournament: 'Dota 2 Open', 
      scheduledTime: new Date(Date.now() + 86400000 * 2) 
    }
  ];
}
