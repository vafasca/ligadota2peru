import { Component, HostBinding, Input } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, Event } from '@angular/router';

@Component({
  selector: 'app-elevator-loading',
  templateUrl: './elevator-loading.component.html',
  styleUrls: ['./elevator-loading.component.css']
})
export class ElevatorLoadingComponent {
  @HostBinding('class.visible') isVisible = false;
  @HostBinding('class.completed') isCompleted = false;
  
  private minimumDisplayTime = 3000; // 3 segundos total
  private progressDuration = 2500; // 2.5 segundos para llenar la barra
  private displayStartTime = 0;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.show();
      }
      if (event instanceof NavigationEnd) {
        const elapsed = Date.now() - this.displayStartTime;
        const remaining = Math.max(0, this.minimumDisplayTime - elapsed);
        
        setTimeout(() => {
          this.isCompleted = true;
        }, this.progressDuration);
        
        setTimeout(() => this.hide(), remaining);
      }
    });
  }

  show() {
    this.isVisible = true;
    this.isCompleted = false;
    this.displayStartTime = Date.now();
  }

  hide() {
    this.isVisible = false;
  }
}
