import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeTab: string = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  @Output() openTournamentModal = new EventEmitter<void>();

  switchTab(tab: string): void {
    this.tabChange.emit(tab);
  }

  handleOpenTournamentModal(): void {
    this.openTournamentModal.emit();
  }
}
