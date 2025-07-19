import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AppDbContext } from '../data/db-context/app-db-context';
import { provideIndexedDb } from 'ngx-indexed-db';
import { provideHttpClient, withFetch } from '@angular/common/http';

const context = new AppDbContext();

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideIndexedDb(context.dbConfig()), provideHttpClient()]
};
