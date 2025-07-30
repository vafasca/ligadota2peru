import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';
import { toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-create-tournament-modal',
  templateUrl: './create-tournament-modal.component.html',
  styleUrls: ['./create-tournament-modal.component.css']
})
export class CreateTournamentModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  // @Output() onTournamentCreated = new EventEmitter<Tournament>();
  @Output() tournamentCreated = new EventEmitter<Tournament>();
  
  tournamentForm: FormGroup;
  readonly timeZone = 'America/La_Paz';

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(4)]],
  game: ['Dota 2', Validators.required],
  format: ['Single Elimination', Validators.required],
  maxTeams: [16, [Validators.required, Validators.min(4), Validators.max(32)]],

  // ✅ Cambiado a datetime-local
  startDate: ['', Validators.required],

  // 🔽 Nuevos controles
  registrationStartDate: ['', Validators.required],
  registrationEndDate: ['', Validators.required],

  prizePool: [''],
  entryFee: [0, [Validators.min(0)]],
  rules: ['']
});
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
  if (this.tournamentForm.invalid) return;

  const formValue = this.tournamentForm.value;

  try {
    const tournamentData: Tournament = {
      ...formValue,
      // ✅ Convierte todas las fechas usando toZonedTime
      startDate: toZonedTime(formValue.startDate, this.timeZone),
      registrationStartDate: toZonedTime(formValue.registrationStartDate, this.timeZone),
      registrationEndDate: toZonedTime(formValue.registrationEndDate, this.timeZone),
      currentTeams: 0,
      status: 'Programado',
      createdBy: 'moderator-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tournamentCreated.emit(tournamentData);
    this.onClose();
  } catch (error) {
    console.error('Error al procesar fechas:', error);
  }
}
}
