import { Component } from '@angular/core';

interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  region: string;
  format: string;
  maxTeams: number;
  teams: any[];
  prizePool: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
}

interface Tab {
  id: string;
  label: string;
}
@Component({
  selector: 'app-create-tounament',
  templateUrl: './create-tounament.component.html',
  styleUrls: ['./create-tounament.component.css']
})
export class CreateTounamentComponent {
searchQuery: string = '';
  activeTab: string = 'all';
  selectedRegion: string = '';
  selectedFormat: string = '';
  showCreateModal: boolean = false;

  tabs: Tab[] = [
    { id: 'all', label: 'Todos' },
    { id: 'upcoming', label: 'Próximos' },
    { id: 'ongoing', label: 'En curso' },
    { id: 'completed', label: 'Finalizados' }
  ];

  regions: string[] = ['Europa', 'América Norte', 'América Sur', 'Asia', 'Oceanía', 'Global'];
  formats: string[] = ['1v1', '5v5', 'Battle Royale', 'Eliminación simple', 'Doble eliminación', 'Round Robin'];

  tournaments: Tournament[] = [
    {
      id: 1,
      name: 'Torneo Invierno 2023',
      startDate: '2023-12-15T18:00:00',
      endDate: '2023-12-17T22:00:00',
      region: 'América Sur',
      format: '5v5',
      maxTeams: 16,
      teams: Array(3).fill({}).map((_, i) => ({id: i+1})),
      prizePool: 5000,
      status: 'upcoming',
      description: 'Torneo de invierno para equipos de todas las habilidades'
    },
    {
      id: 2,
      name: 'Liga Faceit Pro',
      startDate: '2023-11-01T16:00:00',
      endDate: '2023-11-30T23:00:00',
      region: 'Global',
      format: '5v5',
      maxTeams: 32,
      teams: Array(28).fill({}).map((_, i) => ({id: i+1})),
      prizePool: 25000,
      status: 'ongoing',
      description: 'Liga profesional con los mejores equipos del mundo'
    },
    {
      id: 3,
      name: 'Torneo Relámpago',
      startDate: '2023-10-10T15:00:00',
      endDate: '2023-10-10T22:00:00',
      region: 'Europa',
      format: '1v1',
      maxTeams: 64,
      teams: Array(64).fill({}).map((_, i) => ({id: i+1})),
      prizePool: 2000,
      status: 'completed',
      description: 'Torneo rápido 1v1 mid only'
    }
  ];

  newTournament: Omit<Tournament, 'id' | 'status' | 'teams'> & { id?: number } = {
    name: '',
    startDate: '',
    endDate: '',
    region: '',
    format: '',
    maxTeams: 8,
    prizePool: 0,
    description: ''
  };

  get filteredTournaments(): Tournament[] {
    return this.tournaments.filter(tournament => {
      // Filtro de búsqueda
      const matchesSearch = tournament.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          tournament.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Filtro de pestaña
      const matchesTab = this.activeTab === 'all' || tournament.status === this.activeTab;
      
      // Filtro de región
      const matchesRegion = !this.selectedRegion || tournament.region === this.selectedRegion;
      
      // Filtro de formato
      const matchesFormat = !this.selectedFormat || tournament.format === this.selectedFormat;
      
      return matchesSearch && matchesTab && matchesRegion && matchesFormat;
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetNewTournament();
  }

  resetNewTournament(): void {
    this.newTournament = {
      name: '',
      startDate: '',
      endDate: '',
      region: '',
      format: '',
      maxTeams: 8,
      prizePool: 0,
      description: ''
    };
  }

  createTournament(): void {
    // Generar nuevo ID
    const newId = Math.max(...this.tournaments.map(t => t.id)) + 1;
    
    // Crear nuevo torneo
    const newTourney: Tournament = {
      id: newId,
      name: this.newTournament.name,
      startDate: this.newTournament.startDate,
      endDate: this.newTournament.endDate,
      region: this.newTournament.region,
      format: this.newTournament.format,
      maxTeams: this.newTournament.maxTeams,
      teams: [],
      prizePool: this.newTournament.prizePool,
      status: 'upcoming',
      description: this.newTournament.description
    };
    
    // Añadir al principio del array
    this.tournaments.unshift(newTourney);
    
    // Cerrar modal y resetear formulario
    this.closeCreateModal();
  }

  viewTournament(id: number): void {
    // Navegar a la vista de detalles del torneo
    console.log(`Ver torneo ${id}`);
    // this.router.navigate(['/tournament', id]);
  }

  registerToTournament(id: number): void {
    // Lógica para inscribirse en un torneo
    console.log(`Inscribirse al torneo ${id}`);
  }
}
