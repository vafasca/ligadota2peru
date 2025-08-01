import { Component } from '@angular/core';
import { Player, PlayerDivision, PlayerRole, PlayerStatus } from '../../../models/jugador.model';
import { UserService } from '../../../services/user.service';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogUserComponent } from './confirmation-dialog-user/confirmation-dialog-user.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  deletedPlayers: Player[] = [];
  searchResults: Player[] = [];
  isLoading: boolean = false;
  searchError: string | null = null;

  private searchTerms = new Subject<string>();

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

    this.userService.getDeletedPlayers().subscribe(players => {
      this.deletedPlayers = players;
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
      case 'deleted': return this.deletedPlayers;
      default: return [];
    }
  }

  // Método para editar usuario
  editUser(user: Player): void {
  const dialogRef = this.dialog.open(EditUserDialogComponent, {
    width: '600px',
    data: { 
      user: { ...user },
      showObservations: true
    }
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
        
        // Mostrar notificación de éxito
        this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        // Mostrar notificación de error
        this.snackBar.open('Error al actualizar usuario', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  });
}



  // Método para suspender/activar usuario
  toggleUserStatus(user: Player): void {
  const newStatus = user.status === PlayerStatus.Active ? PlayerStatus.Suspended : PlayerStatus.Active;
  const action = newStatus === PlayerStatus.Suspended ? 'suspender' : 'activar';
  
  const dialogRef = this.dialog.open(ConfirmationDialogUserComponent, {
    width: '500px',
    data: {
      title: `Confirmar ${action}`,
      message: `¿Estás seguro que deseas ${action} a ${user.nick}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancelar',
      showReasonInput: newStatus === PlayerStatus.Suspended,
      reasonLabel: 'Motivo de la suspensión:',
      placeholder: 'Ej: Comportamiento inapropiado en partida'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.confirmed) {
      const updateData: Partial<Player> = { status: newStatus };
      
      if (newStatus === PlayerStatus.Suspended && result.reason) {
        const newObservation = `SUSPENSIÓN (${new Date().toLocaleDateString()}): ${result.reason}\n${user.observations || ''}`;
        updateData.observations = newObservation.substring(0, 1000); // Limitar longitud
      }

      this.userService.updatePlayer(user.uid, updateData)
        .then(() => {
          this.updateUserInList({ ...user, ...updateData });
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
    width: '500px',
    data: {
      title: 'Eliminar usuario',
      message: `¿Estás seguro que deseas eliminar a ${user.nick}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDestructive: true,
      showReasonInput: true,
      reasonLabel: 'Motivo de la eliminación:',
      placeholder: 'Ej: Abandono repetido de partidas'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.confirmed) {
      const updateData: Partial<Player> = { 
        status: PlayerStatus.Deleted 
      };
      
      if (result.reason) {
        const newObservation = `ELIMINACIÓN (${new Date().toLocaleDateString()}): ${result.reason}\n${user.observations || ''}`;
        updateData.observations = newObservation.substring(0, 1000); // Limitar longitud
      }

      this.userService.updatePlayer(user.uid, updateData)
        .then(() => {
          this.updateUserInList({ ...user, ...updateData });
        })
        .catch(error => {
          console.error('Error al eliminar usuario:', error);
        });
    }
  });
}

  // Método para restaurar usuario
  restoreUser(user: Player): void {
    const dialogRef = this.dialog.open(ConfirmationDialogUserComponent, {
      width: '400px',
      data: {
        title: 'Restaurar usuario',
        message: `¿Estás seguro que deseas restaurar a ${user.nick}?`,
        confirmText: 'Restaurar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.updatePlayerStatus(user.uid, PlayerStatus.Active)
          .then(() => {
            this.deletedPlayers = this.deletedPlayers.filter(p => p.uid !== user.uid);
          })
          .catch(error => {
            console.error('Error al restaurar usuario:', error);
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
