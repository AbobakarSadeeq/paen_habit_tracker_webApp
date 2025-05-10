import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('../features/habit/habit.component').then(m => m.HabitComponent) },
];
