import { Injectable } from '@angular/core';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitMapper } from '../mapping/habit.mapper';
import { HabitRepositoryService } from '../../data/habit-repository.service';

@Injectable({
  providedIn: 'root'
})
export class HabitServiceService {

  constructor(private _habitRepository: HabitRepositoryService) { }

  public storeHabit(addHabitViewModel: HabitViewModel): void {
    let entity = HabitMapper.ToHabitEntity(addHabitViewModel);
    this._habitRepository.saveHabit(entity);
    // store it inside the indexedDb
  }
}
