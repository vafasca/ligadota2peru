import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, Firestore, getDoc, getDocs, increment, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Tournament } from '../../admin/models/tournament.model';
import { catchError, forkJoin, from, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { TournamentTeam } from '../../tournament/models/team.model';
import { Team } from '../../admin/models/equipos.model';
import { PlayerDivision } from '../../admin/models/jugador.model';
import { TeamService } from './team.service';
import { TournamentInvitation } from '../models/tournamentInvitation.model';
import { NotificationService } from 'src/app/shared-services/notification.service';
import { Notification } from '../../admin/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentRegisterService {
private tournamentsCollection;
private tournamentTeamsCollection;
private invitationsCollection = collection(this.firestore, 'tournament_invitations');

  constructor(
    private firestore: Firestore,
    private teamService: TeamService,
    private notificationService: NotificationService
  ) {
    this.tournamentsCollection = collection(this.firestore, 'tournaments');
    this.tournamentTeamsCollection = collection(this.firestore, 'tournament_teams');
  }

  getTournament(tournamentId: string): Observable<Tournament | null> {
    const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
    return from(getDoc(tournamentDocRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          startDate: data['startDate']?.toDate() || null,
          endDate: data['endDate']?.toDate() || null,
          registrationStartDate: data['registrationStartDate']?.toDate() || null,
          registrationEndDate: data['registrationEndDate']?.toDate() || null,
          createdAt: data['createdAt']?.toDate() || null,
          updatedAt: data['updatedAt']?.toDate() || null
        } as Tournament;
      }),
      catchError(error => {
        console.error('Error getting tournament:', error);
        return throwError(() => new Error('Error al obtener torneo'));
      })
    );
  }

  getActiveTournaments(): Observable<Tournament[]> {
    const q = query(
      this.tournamentsCollection,
      where('status', 'in', ['Programado', 'En progreso'])
    );

    return new Observable<Tournament[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tournaments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Tournament));
        observer.next(tournaments);
      }, error => observer.error(error));
      
      return () => unsubscribe();
    });
  }

  registerTeamToTournament(tournamentId: string, team: Team): Observable<string> {
    // Validar que todos los campos requeridos estén presentes
    if (!team.id || !team.name || !team.captainId || !team.players || !team.division) {
      return throwError(() => new Error('Datos del equipo incompletos'));
    }

    const tournamentTeamData: Omit<TournamentTeam, 'id'> = {
      tournamentId,
      originalTeamId: team.id,
      name: team.name,
      captainId: team.captainId,
      players: team.players.map(p => ({
        uid: p.uid,
        nick: p.nick || 'Sin nombre',
        role: p.role || 'Sin rol',
        avatar: p.avatar || 'assets/default-avatar.png',
        mmr: p.mmr || 0,
        medalImage: p.medalImage || 'assets/default-medal.png',
        idDota: p.idDota || 0
      })),
      division: team.division,
      logo: team.logo || '../assets/default-logo.png',
      createdAt: new Date(),
      isActive: true,
      stats: {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      }
    };

    // Verificar que no haya valores undefined
    this.validateTournamentTeamData(tournamentTeamData);

    // Primero creamos el equipo en tournament_teams
    return from(addDoc(this.tournamentTeamsCollection, tournamentTeamData)).pipe(
      // Luego actualizamos el torneo para añadir el equipo
      switchMap(docRef => {
        const tournamentDocRef = doc(this.firestore, `tournaments/${tournamentId}`);
        return from(updateDoc(tournamentDocRef, {
          teams: arrayUnion(team.id),
          currentTeams: increment(1)
        })).pipe(
          map(() => docRef.id) // Devolvemos el ID del equipo en tournament_teams
        );
      }),
      catchError(error => {
        console.error('Error registering team:', error);
        return throwError(() => new Error('Error al inscribir equipo'));
      })
    );
  }

  private validateTournamentTeamData(data: Omit<TournamentTeam, 'id'>): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        throw new Error(`Campo requerido '${key}' no puede ser undefined`);
      }
    });
    
    // Validación adicional para el array de jugadores
    if (!data.players || data.players.length === 0) {
      throw new Error('El equipo debe tener jugadores');
    }
  }

  getTournamentTeams(tournamentId: string): Observable<TournamentTeam[]> {
  const q = query(
    this.tournamentTeamsCollection,
    where('tournamentId', '==', tournamentId),
    where('isActive', '==', true)
  );

  return new Observable<TournamentTeam[]>(observer => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TournamentTeam));
      observer.next(teams);
    }, error => observer.error(error));
    
    return () => unsubscribe();
  });
}

canRegisterToTournament(teamId: string, tournamentId: string): Observable<{ canRegister: boolean; message?: string }> {
  return forkJoin([
    this.getTournament(tournamentId).pipe(take(1)),
    this.teamService.getTeam(teamId).pipe(take(1)),
    this.getTournamentTeams(tournamentId).pipe(take(1)),
    this.checkAllInvitationsAccepted(teamId, tournamentId).pipe(take(1)),
    this.checkAllPlayersResponded(teamId, tournamentId).pipe(take(1))
  ]).pipe(
    switchMap(([tournament, team, tournamentTeams, allAccepted, allResponded]) => {
      // Verificaciones iniciales
      if (!tournament) {
        return of({ canRegister: false, message: 'Torneo no encontrado' });
      }

      if (tournament.status !== 'Programado') {
        return of({ canRegister: false, message: 'El torneo no está aceptando inscripciones' });
      }

      const now = new Date();
      const startDate = new Date(tournament.registrationStartDate);
      const endDate = new Date(tournament.registrationEndDate);

      if (now < startDate) {
        return of({ 
          canRegister: false, 
          message: `Las inscripciones comienzan el ${this.formatDate(startDate)}` 
        });
      }

      if (now > endDate) {
        return of({ canRegister: false, message: 'El período de inscripciones ha finalizado' });
      }

      if (!team || team.players.length !== 5) {
        return of({ canRegister: false, message: 'El equipo debe tener exactamente 5 jugadores' });
      }

      if (tournament.teams && tournament.teams.includes(teamId)) {
        return of({ canRegister: false, message: 'El equipo ya está inscrito en este torneo' });
      }

      if (tournament.currentTeams >= tournament.maxTeams) {
        return of({ canRegister: false, message: 'No hay cupos disponibles en este torneo' });
      }

      // Verificar jugadores duplicados
      const allPlayersInTournament = tournamentTeams.flatMap(t => t.players.map(p => p.uid));
      const duplicatePlayers = team.players.filter(p => allPlayersInTournament.includes(p.uid));
      
      if (duplicatePlayers.length > 0) {
        const playerNames = duplicatePlayers.map(p => p.nick).join(', ');
        return of({ 
          canRegister: false, 
          message: `Jugadores ya inscritos: ${playerNames}` 
        });
      }

      // Verificar estado de invitaciones
      if (!allResponded) {
        return of({ 
          canRegister: false,
          message: 'Todos los jugadores deben responder a la invitación'
        });
      }

      if (!allAccepted) {
        return of({ 
          canRegister: false,
          message: 'Todos los jugadores deben aceptar la invitación al torneo'
        });
      }
      
      return of({ 
        canRegister: true,
        message: '¡PUEDES INSCRIBIRTE A ESTE TORNEO!'
      });
    }),
    catchError(error => {
      return of({
        canRegister: false,
        message: error.message || 'Error al verificar inscripción'
      });
    })
  );
}

private checkAllPlayersResponded(teamId: string, tournamentId: string): Observable<boolean> {
  return forkJoin([
    this.teamService.getTeam(teamId).pipe(take(1)),
    this.getPlayerResponses(teamId, tournamentId)
  ]).pipe(
    map(([team, responses]) => {
      // Verificar si el equipo es null
      if (!team) {
        return false;
      }
      
      // El capitán siempre cuenta como respondido
      const captainId = team.captainId;
      
      return team.players.every(player => {
        // El capitán siempre cuenta como respondido
        if (player.uid === captainId) return true;
        
        // Buscar respuesta del jugador
        const response = responses.find(r => r.playerId === player.uid);
        return response !== undefined; // Tiene respuesta si existe en la colección
      });
    })
  );
}

private getPlayerResponses(teamId: string, tournamentId: string): Observable<{playerId: string, status: string}[]> {
  const q = query(
    collection(this.firestore, 'tournament_invitations'),
    where('teamId', '==', teamId),
    where('tournamentId', '==', tournamentId)
  );

  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.docs.map(doc => ({
      playerId: doc.data()['playerId'],
      status: doc.data()['status']
    })))
  );
}

private checkInvitationsExist(teamId: string, tournamentId: string): Observable<boolean> {
  const q = query(
    this.invitationsCollection,
    where('teamId', '==', teamId),
    where('tournamentId', '==', tournamentId)
  );

  return from(getDocs(q)).pipe(
    map(snapshot => !snapshot.empty)
  );
}

private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  sendTournamentInvitations(teamId: string, tournamentId: string): Observable<void> {
  return forkJoin([
    this.teamService.getTeam(teamId),
    this.getTournament(tournamentId),
    this.getExistingInvitations(teamId, tournamentId) // Nuevo método
  ]).pipe(
    switchMap(([team, tournament, existingInvitations]) => {
      if (!team || !tournament) {
        return throwError(() => new Error('Equipo o torneo no encontrado'));
      }
      
      const captainId = team.captainId;
      const playersToNotify = team.players
        .filter(player => player.uid !== captainId)
        .filter(player => {
          const existing = existingInvitations.find(i => i.playerId === player.uid);
          // Solo enviar a: no existe invitación o fue rechazada
          return !existing || existing.status === 'rejected';
        });

      const invitations = playersToNotify.map(player => {
        // Si ya existe (rechazada), actualizarla. Si no, crear nueva
        const existing = existingInvitations.find(i => i.playerId === player.uid);
        
        const invitationData = {
          tournamentId,
          teamId,
          captainId,
          playerId: player.uid,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        const invitationPromise = existing 
          ? updateDoc(doc(this.firestore, `tournament_invitations/${existing.id}`), invitationData)
          : addDoc(this.invitationsCollection, invitationData);

        return from(invitationPromise).pipe(
          switchMap(() => {
            const notification: Omit<Notification, 'id'> = {
              userId: player.uid,
              title: 'Invitación a Torneo',
              message: `${team.name} te invita a unirse al torneo ${tournament.name}`,
              type: 'tournament_invitation',
              tournamentId: tournamentId,
              teamId: teamId,
              read: false,
              createdAt: new Date()
            };
            return this.notificationService.createNotification(notification);
          })
        );
      });
      
      return invitations.length > 0 
        ? forkJoin(invitations).pipe(map(() => undefined))
        : of(undefined);
    }),
    catchError(error => {
      console.error('Error sending invitations:', error);
      return throwError(() => new Error('Error al enviar invitaciones'));
    })
  );
}

private getExistingInvitations(teamId: string, tournamentId: string): Observable<TournamentInvitation[]> {
  const q = query(
    this.invitationsCollection,
    where('teamId', '==', teamId),
    where('tournamentId', '==', tournamentId)
  );

  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TournamentInvitation)))
  );
}

  checkAllInvitationsAccepted(teamId: string, tournamentId: string): Observable<boolean> {
    const q = query(
      this.invitationsCollection,
      where('teamId', '==', teamId),
      where('tournamentId', '==', tournamentId)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const invitations = snapshot.docs.map(doc => doc.data() as TournamentInvitation);
        if (invitations.length === 0) return false;
        
        return invitations.every(i => i.status === 'accepted');
      })
    );
  }
}
