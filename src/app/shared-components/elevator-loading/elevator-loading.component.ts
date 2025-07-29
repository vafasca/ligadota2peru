import { Component, HostBinding, Input } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, Event } from '@angular/router';

@Component({
  selector: 'app-elevator-loading',
  templateUrl: './elevator-loading.component.html',
  styleUrls: ['./elevator-loading.component.css']
})
export class ElevatorLoadingComponent {
  message: string = 'CARGANDO TORNEO...';
}
