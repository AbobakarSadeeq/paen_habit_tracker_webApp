import { Injectable } from '@angular/core';
import { Habit } from '../core/models/entities/habit';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitRepositoryService {

  constructor(private _dbContext: NgxIndexedDBService) { }

  async saveHabitOnDbAsync(habitEntity: Habit): Promise<Habit> {
    const storeData = await firstValueFrom(this._dbContext.add('habits', {
      name: habitEntity.name,
      color: habitEntity.color,
      createdAt: habitEntity.createdAt
    }));
    let result: Habit = {
      Id: storeData.id,
      name: storeData.name,
      color: storeData.color,
      createdAt: storeData.createdAt,
    }
    return result;
  }

  async getAllHabitsFromDbAsync(): Promise<Habit[]> {
    const habits = await firstValueFrom(this._dbContext.getAll<Habit>('habits'));
    return habits;
  }

}
