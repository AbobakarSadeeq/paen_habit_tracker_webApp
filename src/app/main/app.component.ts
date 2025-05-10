import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/components/navbar/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'paen_habit_tracker_webApp';

  gotoHome(): void {


  }
}
