import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeTab: string = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  @Output() openTournamentModal = new EventEmitter<void>();
  @Input() userAvatar: string = '';
  @Input() userNick: string = '';
  @Input() userIdDota: number = 0;

  constructor(private router: Router){
  }

  switchTab(tab: string): void {
    this.tabChange.emit(tab);
  }

  handleOpenTournamentModal(): void {
    this.openTournamentModal.emit();
  }

  goToProfile(): void {
    this.router.navigate(['/profile/', this.userIdDota]);
  }
}
