import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitCompletionRepositoryService {


  constructor(private _dbContext: NgxIndexedDBService) { }

  async addHabitCompletionOnDbAsync(habitId: number): Promise<void> {
    await firstValueFrom(this._dbContext.add('habit_completions', {
      doneDate: new Date().toISOString().split('T')[0],
      habitId: habitId
    }));
  }

  async getHabitCompletionsFromDbAsync(startDate: string, endDate: string): Promise<any> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'doneDate',
      IDBKeyRange.bound(startDate, endDate)
    ));
  }

  async getHabitCompletionByHabitFkIdFromDbAsync(fKeyHabitId: number): Promise<any> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'habitId',
      IDBKeyRange.only(fKeyHabitId)
    ));
  }

  async deleteHabitCompletionByHabitFkIdFromDbAsync(fKeyHabitId: number): Promise<void> {
    return await firstValueFrom(this._dbContext.deleteAllByIndex(
      'habit_completions',
      'habitId',
      IDBKeyRange.only(fKeyHabitId)
    ));
  }


}
