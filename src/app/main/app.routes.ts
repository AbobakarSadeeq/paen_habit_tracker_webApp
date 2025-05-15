import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('../features/habit/habit.component').then(m => m.HabitComponent) },
  { path: 'habit/:Id', loadComponent: () => import('../features/habit-detail/habit-detail.component').then(m => m.HabitDetailComponent) },
];
