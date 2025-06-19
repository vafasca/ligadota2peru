import { Component } from '@angular/core';
import { ConnectionService } from './modules/auth/services/connection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ligadota2peru';
  constructor(private connectionService: ConnectionService) {}
}
