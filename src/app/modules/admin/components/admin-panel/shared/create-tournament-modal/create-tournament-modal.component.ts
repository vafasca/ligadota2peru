import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tournament } from 'src/app/modules/admin/models/tournament.model';

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

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      game: ['Dota 2', Validators.required],
      format: ['Single Elimination', Validators.required],
      maxTeams: [16, [Validators.required, Validators.min(4), Validators.max(32)]],
      startDate: ['', Validators.required],
      prizePool: [''],
      entryFee: [0, [Validators.min(0)]],
      rules: ['']
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
  if (this.tournamentForm.valid) {
    // Obtener la fecha del formulario (ej: 31/07/2025)
    const selectedDate = new Date(this.tournamentForm.value.startDate);

    // Ajustar la fecha para evitar el cambio de día al guardar en UTC
    // Sumamos 4 horas (UTC-4 → UTC) para que se guarde correctamente
    const adjustedDate = new Date(selectedDate);
    adjustedDate.setHours(selectedDate.getHours() + 4); // Ajuste para UTC-4 (Cochabamba)

    const tournamentData: Tournament = {
      ...this.tournamentForm.value,
      startDate: adjustedDate, // Guardamos con el ajuste horario
      currentTeams: 0,
      status: 'Programado',
      createdBy: 'moderator-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tournamentCreated.emit(tournamentData);
    this.onClose();
  }
}
}
