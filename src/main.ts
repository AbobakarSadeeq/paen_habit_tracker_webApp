import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '../src/app/main/app.config';
import { AppComponent } from '../src/app/main/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
