import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TeamNotesDialogComponent } from '../team-notes-dialog/team-notes-dialog.component';

interface Team {
  id: number;
  name: string;
  logo: string;
  players: Player[];
  joinDate: string;
  status: 'accepted' | 'pending' | 'rejected';
  mmr: number;
  wins: number;
  losses: number;
  notes?: string;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  mmr: number;
  role: string;
}
@Component({
  selector: 'app-teams-per-tournament',
  templateUrl: './teams-per-tournament.component.html',
  styleUrls: ['./teams-per-tournament.component.css']
})
export class TeamsPerTournamentComponent {
@Input() tournamentId?: number;
  activeTab: 'accepted' | 'pending' = 'accepted';
  tournamentName: string = 'Dota 2 Championship';
  acceptedTeams: Team[] = [];
  pendingTeams: Team[] = [];
  notes: {[key: number]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (!this.tournamentId) {
      this.tournamentId = +this.route.snapshot.paramMap.get('id')!;
    }
    
    this.loadTeams();
  }

  loadTeams(): void {
    // Equipos aceptados
    this.acceptedTeams = [
      {
        id: 1,
        name: 'Team Liquid',
        logo: 'team-liquid',
        players: [
          { id: 101, name: 'MATUMBAMAN', avatar: 'assets/players/matumbaman.jpg', mmr: 9500, role: 'Carry' },
          { id: 102, name: 'miCKe', avatar: 'assets/players/micke.jpg', mmr: 9000, role: 'Mid' },
          { id: 103, name: 'qojqva', avatar: 'assets/players/qojqva.jpg', mmr: 8900, role: 'Offlane' },
          { id: 104, name: 'Taiga', avatar: 'assets/players/taiga.jpg', mmr: 8800, role: 'Support' },
          { id: 105, name: 'iNSaNiA', avatar: 'assets/players/insania.jpg', mmr: 8700, role: 'Support' }
        ],
        joinDate: '2023-07-10',
        status: 'accepted',
        mmr: 8450,
        wins: 12,
        losses: 3,
        notes: 'Equipo profesional con mucha experiencia internacional'
      },
      {
        id: 2,
        name: 'OG',
        logo: 'og',
        players: [
          { id: 201, name: 'Yuragi', avatar: 'assets/players/yuragi.jpg', mmr: 9200, role: 'Carry' },
          { id: 202, name: 'bzm', avatar: 'assets/players/bzm.jpg', mmr: 9300, role: 'Mid' },
          { id: 203, name: 'ATF', avatar: 'assets/players/atf.jpg', mmr: 9100, role: 'Offlane' },
          { id: 204, name: 'Taiga', avatar: 'assets/players/taiga.jpg', mmr: 8800, role: 'Support' },
          { id: 205, name: 'Misha', avatar: 'assets/players/misha.jpg', mmr: 8900, role: 'Support' }
        ],
        joinDate: '2023-07-11',
        status: 'accepted',
        mmr: 8300,
        wins: 10,
        losses: 5,
        notes: 'Campeones de TI en múltiples ocasiones'
      }
    ];

    // Solicitudes pendientes
    this.pendingTeams = [
      {
        id: 3,
        name: 'Tundra Esports',
        logo: 'tundra',
        players: [
          { id: 301, name: 'Skiter', avatar: 'assets/players/skiter.jpg', mmr: 9100, role: 'Carry' },
          { id: 302, name: 'Nine', avatar: 'assets/players/nine.jpg', mmr: 9200, role: 'Mid' },
          { id: 303, name: '33', avatar: 'assets/players/33.jpg', mmr: 9000, role: 'Offlane' },
          { id: 304, name: 'Saksa', avatar: 'assets/players/saksa.jpg', mmr: 8700, role: 'Support' },
          { id: 305, name: 'Sneyking', avatar: 'assets/players/sneyking.jpg', mmr: 8600, role: 'Support' }
        ],
        joinDate: '2023-07-15',
        status: 'pending',
        mmr: 8100,
        wins: 8,
        losses: 7,
        notes: 'Equipo ascendente con buen desempeño reciente'
      }
    ];

    // Cargar notas guardadas
    this.acceptedTeams.forEach(team => {
      if (team.notes) {
        this.notes[team.id] = team.notes;
      }
    });
  }

  async acceptTeam(teamId: number): Promise<void> {
    const confirm = await this.showConfirmation(
      'Aceptar Equipo',
      '¿Estás seguro de que deseas aceptar este equipo en el torneo?',
      'El equipo será añadido a la lista de participantes'
    );
    
    if (!confirm) return;

    const team = this.pendingTeams.find(t => t.id === teamId);
    if (team) {
      team.status = 'accepted';
      this.acceptedTeams.push(team);
      this.pendingTeams = this.pendingTeams.filter(t => t.id !== teamId);
      // Aquí iría la llamada al backend para actualizar el estado
    }
  }

  async rejectTeam(teamId: number): Promise<void> {
    const confirm = await this.showConfirmation(
      'Rechazar Equipo',
      '¿Estás seguro de que deseas rechazar este equipo?',
      'El equipo será eliminado de las solicitudes pendientes'
    );
    
    if (!confirm) return;

    const team = this.pendingTeams.find(t => t.id === teamId);
    if (team) {
      team.status = 'rejected';
      this.pendingTeams = this.pendingTeams.filter(t => t.id !== teamId);
      // Aquí iría la llamada al backend para actualizar el estado
    }
  }

  async removeTeam(teamId: number): Promise<void> {
    const confirm = await this.showConfirmation(
      'Eliminar Equipo',
      '¿Estás seguro de que deseas eliminar este equipo del torneo?',
      'El equipo será removido de la lista de participantes'
    );
    
    if (!confirm) return;

    this.acceptedTeams = this.acceptedTeams.filter(t => t.id !== teamId);
    // Aquí iría la llamada al backend para eliminar el equipo
  }

  showConfirmation(title: string, message: string, details: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: { title, message, details }
    });
    
    return dialogRef.afterClosed().toPromise();
  }

  openNotesDialog(team: Team): void {
    const dialogRef = this.dialog.open(TeamNotesDialogComponent, {
      width: '500px',
      data: { 
        teamName: team.name,
        notes: this.notes[team.id] || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.notes[team.id] = result;
        // Aquí iría la llamada al backend para guardar las notas
      }
    });
  }

  viewPlayerProfile(playerId: number): void {
    // Navegar al perfil del jugador
    console.log('Ver perfil del jugador:', playerId);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  goBack(): void {
    this.location.back();
  }
}
