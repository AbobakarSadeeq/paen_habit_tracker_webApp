import { Injectable } from '@angular/core';
import { Habit } from '../core/models/entities/habit';

@Injectable({
  providedIn: 'root'
})
export class HabitRepositoryService {

  constructor() { }

  saveHabit(habitEntity: Habit) {
    // store data to indexedDb....
  }
}
