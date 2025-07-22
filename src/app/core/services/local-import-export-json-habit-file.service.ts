import { Injectable } from '@angular/core';
import { DataSharingService } from '../../shared/services/data-sharing.service';
import { HabitCompletionService } from './habit-completion.service';
import { HabitService } from './habit.service';

@Injectable({
  providedIn: 'root'
})
export class LocalImportExportJsonHabitFileService {

  constructor(private _habitService: HabitService,
    private _habitalCompletionService: HabitCompletionService,
    private _dataSharing: DataSharingService) { }

  // export

  async exportHabitJsonAsync(): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);
    // get only habits
    let allHabitListForExportingFormat: any[] = await this._habitService.getAllHabitsForExportingJsonFileAsync();
    // each habitId will be having ascending wise habitId
    let assignNumberInOrderWiseToHabit: { [key: number]: number } = {};
    let currentId = 1;
    allHabitListForExportingFormat.forEach(singleHabit => {
      if (assignNumberInOrderWiseToHabit[singleHabit.Id] == undefined) {
        assignNumberInOrderWiseToHabit[singleHabit.Id] = currentId;
        currentId++
      }
    });

    let allHabitsCompletionListForExportingFormat = await this._habitalCompletionService.getAllHabitsCompleteionForExportingJsonFileAsync(assignNumberInOrderWiseToHabit);
    let exportJsonFileFormateOfHabitsStore: any[] = [];
    allHabitListForExportingFormat.forEach(singleHabit => {
      exportJsonFileFormateOfHabitsStore.push(
        {
          'habitId': allHabitsCompletionListForExportingFormat?.[singleHabit.Id][0]['habitId'],
          'name': singleHabit.name,
          'color': singleHabit.color,
          'description': singleHabit.description,
          'imageUrl': singleHabit.imageUrl,
          'createdAt': singleHabit.createdAt,
          'habitCompletions': allHabitsCompletionListForExportingFormat?.[singleHabit.Id][0]['doneDate'] ?? []
        }
      );
    });

    this._downloadJsonFile(exportJsonFileFormateOfHabitsStore);
    this._dataSharing.showSpinnerSubject.next(false);
  }

  private _downloadJsonFile(data: any): void {
    const today = new Date();
    const dateTime = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}_${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}`;
    const convertToString = JSON.stringify(data);
    const blob = new Blob([convertToString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dateTime}_PaenHabit.json`; // fileName
    a.click();
    URL.revokeObjectURL(url);
  }

  // import

  formatedToStoreHabitsAndItsCompletion(arrHabitsWithCompletions: any[]): any {
    let result: any = {
      'habits': [],
      'habitCompletions': [],
      'isFileInCorrectFormat': false
    }

    for (var singleHabitWithItsCompletions of arrHabitsWithCompletions) {
      let singleHabit = {
        'name': singleHabitWithItsCompletions['name'],
        'color': singleHabitWithItsCompletions['color'],
        'description': singleHabitWithItsCompletions['description'],
        'imageUrl': singleHabitWithItsCompletions['imageUrl'],
        'createdAt': singleHabitWithItsCompletions['createdAt'],
      }

      if (singleHabit.name == undefined || singleHabit.color == undefined || singleHabit.createdAt == undefined) {
        return result;
      }

      let mappedForToStoreInDbFormat: any[] = singleHabitWithItsCompletions['habitCompletions'].map((date: string) => ({
        doneDate: date,
        habitId: singleHabitWithItsCompletions['habitId'],
      }));

      let habitCompletions = [...result['habitCompletions'], ...mappedForToStoreInDbFormat];
      result['habits'].push(singleHabit);
      result['habitCompletions'] = habitCompletions;
    }
    result['isFileInCorrectFormat'] = true;
    return result;
  }

  async onImportHabitsConfirmAsync(importData: any): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);
    let resultFormated = importData;
    // remove data from tables
    await this._habitService.resetHabitAsync();
    await this._habitalCompletionService.resetHabitCompletionAsync();

    // stored data in bulk inside habit and return their primary keys where does it stored.
    let primaryKeysStored = await this._habitService.bulkSaveHabitsAsync(resultFormated.habits);

    // first any value of primary key == 1, second any value of primary key == 2
    let habitNumberCompletionWise = 1;
    for (var singleHabitCompletion of resultFormated['habitCompletions']) {
      if (singleHabitCompletion['habitId'] == habitNumberCompletionWise) {
        singleHabitCompletion['habitId'] = primaryKeysStored[habitNumberCompletionWise - 1]; // assign primary key value here of to that habit completion where it equals to habitId
      } else {
        habitNumberCompletionWise = singleHabitCompletion['habitId'];
        singleHabitCompletion['habitId'] = primaryKeysStored[habitNumberCompletionWise - 1]
      }
    }
    await this._habitalCompletionService.bulkSaveHabitsCompletionAsync(resultFormated.habitCompletions);
    this._dataSharing.showSpinnerSubject.next(false);
    this._dataSharing.refreshHabitsAfterImport.next(true);
  }


}
