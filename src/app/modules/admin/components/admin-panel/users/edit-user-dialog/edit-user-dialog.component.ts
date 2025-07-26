import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Player, PlayerCategory, PlayerDivision, PlayerRole, PlayerRoleGame, PlayerStatus } from 'src/app/modules/admin/models/jugador.model';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  editForm: FormGroup;
  divisions = Object.values(PlayerDivision);
  roles = Object.values(PlayerRole);
  statuses = Object.values(PlayerStatus);
  categories = Object.values(PlayerCategory);
  mainRoles = Object.values(PlayerRoleGame);
  secondaryRoles = Object.values(PlayerRoleGame);
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: Player },
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      nick: [data.user.nick, [Validators.required, Validators.minLength(3)]],
      idDota: [data.user.idDota, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      mmr: [data.user.mmr, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      playerDivision: [data.user.playerDivision, Validators.required],
      rolUser: [data.user.rolUser, Validators.required],
      status: [data.user.status, Validators.required],
      role: [data.user.role, Validators.required],
      secondaryRole: [data.user.secondaryRole || ''],
      observations: [data.user.observations || ''],
      avatar: [data.user.avatar || ''],
      category: [data.user.category || PlayerCategory.Tier1, Validators.required]
    });

    if (data.user.avatar) {
      this.previewUrl = data.user.avatar;
    }
  }

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Validar tamaño máximo (500KB)
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      this.showSizeError(file.size);
      input.value = ''; // Limpiar el input
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.editForm.patchValue({ avatar: reader.result });
    };
    reader.readAsDataURL(file);
  }
}

private showSizeError(fileSize: number): void {
  const sizeInKB = Math.round(fileSize / 1024);
  this.snackBar.open(
    `🛑 La imagen es demasiado grande (${sizeInKB}KB). Máximo permitido: 500KB`,
    'Cerrar', 
    {
      duration: 5000,
      panelClass: ['dota-snackbar', 'error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    }
  );
}

  removeAvatar(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.editForm.patchValue({ avatar: '' });
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedUser = {
        ...this.data.user,
        ...this.editForm.value,
        // Si hay un nuevo archivo seleccionado, el avatar ya está en el form como Data URL
        // Si no hay archivo pero previewUrl existe, es el avatar existente
        avatar: this.editForm.value.avatar || this.data.user.avatar || ''
      };
      this.dialogRef.close(updatedUser);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
