import { Component } from '@angular/core';
import { Player, PlayerDivision, PlayerRole, PlayerStatus } from '../../../models/jugador.model';
import { UserService } from '../../../services/user.service';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogUserComponent } from './confirmation-dialog-user/confirmation-dialog-user.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  activeUserTab: string = 'division1';
  searchTerm: string = '';
  
  division1Players: Player[] = [];
  division2Players: Player[] = [];
  moderators: Player[] = [];
  subModerators: Player[] = [];
  searchResults: Player[] = [];
  isLoading: boolean = false;
  searchError: string | null = null;

  private searchTerms = new Subject<string>();

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.setupSearch();
  }

  private loadAllData(): void {
    this.userService.getDivision1Players().subscribe(players => {
      this.division1Players = players;
    });

    this.userService.getDivision2Players().subscribe(players => {
      this.division2Players = players;
    });

    this.userService.getModerators().subscribe(moderators => {
      this.moderators = moderators;
    });

    this.userService.getSubModerators().subscribe(subModerators => {
      this.subModerators = subModerators;
    });
  }

  private setupSearch(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) {
          return of([]);
        }
        this.isLoading = true;
        this.searchError = null;
        return this.userService.searchPlayers(trimmedTerm).pipe(
          catchError(error => {
            console.error('Search error:', error);
            this.searchError = 'Error al realizar la búsqueda';
            return of([]);
          })
        );
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.isLoading = false;
    });
  }

  onSearchChange(): void {
    this.searchTerms.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.searchError = null;
  }

  setActiveTab(tab: string): void {
    this.activeUserTab = tab;
    this.clearSearch();
  }

  getCurrentList(): Player[] {
    if (this.searchTerm.trim()) {
      return this.searchResults;
    }
    
    switch (this.activeUserTab) {
      case 'division1': return this.division1Players;
      case 'division2': return this.division2Players;
      case 'moderators': return this.moderators;
      case 'subModerators': return this.subModerators;
      default: return [];
    }
  }

  // Método para editar usuario
  editUser(user: Player): void {
  const dialogRef = this.dialog.open(EditUserDialogComponent, {
    width: '600px',
    data: { user: { ...user } }
  });

  dialogRef.afterClosed().subscribe(async (result: Player) => {
    if (result) {
      try {
        // Preparar los datos para actualizar
        const updateData: Partial<Player> = {
          nick: result.nick,
          idDota: result.idDota,
          mmr: result.mmr,
          playerDivision: result.playerDivision,
          rolUser: result.rolUser,
          status: result.status,
          role: result.role,
          secondaryRole: result.secondaryRole,
          observations: result.observations,
          category: result.category
        };

        // Solo actualizar el avatar si hay cambios
        if (result.avatar !== user.avatar) {
          updateData.avatar = result.avatar;
        }

        // Actualizar en Firebase
        await this.userService.updatePlayer(result.uid, updateData);
        
        // Actualizar en la lista local
        this.updateUserInList({ ...user, ...updateData });
        
        console.log('Usuario actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    }
  });
}

  // Método para suspender/activar usuario
  toggleUserStatus(user: Player): void {
    const newStatus = user.status === PlayerStatus.Active ? PlayerStatus.Suspended : PlayerStatus.Active;
    const action = newStatus === PlayerStatus.Suspended ? 'suspender' : 'activar';
    
    const dialogRef = this.dialog.open(ConfirmationDialogUserComponent, {
      width: '400px',
      data: {
        title: 'Confirmar acción',
        message: `¿Estás seguro que deseas ${action} a ${user.nick}?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.updatePlayerStatus(user.uid, newStatus)
          .then(() => {
            this.updateUserInList({ ...user, status: newStatus });
          })
          .catch(error => {
            console.error(`Error al ${action} usuario:`, error);
          });
      }
    });
  }

  // Método para eliminar usuario (solo para moderadores/submoderadores)
  deleteUser(user: Player): void {
    const dialogRef = this.dialog.open(ConfirmationDialogUserComponent, {
      width: '400px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro que deseas eliminar a ${user.nick}? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(user.uid)
          .then(() => {
            // Eliminar el usuario de la lista correspondiente
            if (this.activeUserTab === 'moderators') {
              this.moderators = this.moderators.filter(m => m.uid !== user.uid);
            } else if (this.activeUserTab === 'subModerators') {
              this.subModerators = this.subModerators.filter(sm => sm.uid !== user.uid);
            }
          })
          .catch(error => {
            console.error('Error al eliminar usuario:', error);
          });
      }
    });
  }

  // Método para actualizar un usuario en la lista correspondiente
  private updateUserInList(updatedUser: Player): void {
    const updateList = (list: Player[]) => {
      return list.map(user => user.uid === updatedUser.uid ? updatedUser : user);
    };

    if (this.activeUserTab === 'division1') {
      this.division1Players = updateList(this.division1Players);
    } else if (this.activeUserTab === 'division2') {
      this.division2Players = updateList(this.division2Players);
    } else if (this.activeUserTab === 'moderators') {
      this.moderators = updateList(this.moderators);
    } else if (this.activeUserTab === 'subModerators') {
      this.subModerators = updateList(this.subModerators);
    }

    // También actualizar en los resultados de búsqueda si es necesario
    if (this.searchTerm.trim()) {
      this.searchResults = updateList(this.searchResults);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  openAddSubModeratorModal(): void {
  // Implementación vacía por ahora
}
}
