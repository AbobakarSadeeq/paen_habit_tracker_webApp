import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'paen_habit_tracker_webApp';

  gotoHome(): void {


  }
}
