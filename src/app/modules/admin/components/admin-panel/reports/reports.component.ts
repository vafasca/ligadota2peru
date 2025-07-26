import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
reportedUsers = [
    { 
      username: 'toxic_player', 
      reason: 'Comportamiento tóxico en partida', 
      reportedBy: 'fair_player', 
      date: new Date(Date.now() - 86400000) 
    },
    { 
      username: 'cheater123', 
      reason: 'Uso de hacks/cheats', 
      reportedBy: 'honest_player', 
      date: new Date(Date.now() - 86400000 * 2) 
    }
  ];
}
