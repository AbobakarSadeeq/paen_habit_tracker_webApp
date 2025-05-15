import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';
import { HabitCompletion } from '../core/models/entities/habit-completion';
import { DateTimePicker } from '../shared/utils/dateTime-picker';

@Injectable({
  providedIn: 'root'
})
export class HabitCompletionRepositoryService {

  constructor(private _dbContext: NgxIndexedDBService) { }

  async addHabitCompletionOnDbAsync(habitId: number): Promise<void> {
    await firstValueFrom(this._dbContext.add('habit_completions', {
      doneDate: DateTimePicker.getLocalTodayDateOnly(),
      // doneDate: '2025-05-14',
      habitId: habitId
    }));
  }

  async getHabitCompletionsByStartAndEndDatesFromDbAsync(startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'doneDate',
      IDBKeyRange.bound(startDate, endDate)
    ));
  }

  async getHabitCompletionListByHabitFkIdFromDbAsync(fKeyHabitId: number): Promise<HabitCompletion[]> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'habitId',
      IDBKeyRange.only(fKeyHabitId)
    ));
  }

  async deleteHabitCompletionByHabitFkAndTodayDateIdFromDbAsync(habitId: number): Promise<void> {
    let onlyTodayDateHabitCompletionList: HabitCompletion[] = await this.getHabitCompletionListFromDbOfTodayDateAsync();

    let findIndexOfTodayByDateDoneCompletionId = onlyTodayDateHabitCompletionList.findIndex(
      singleHabitCompletion => singleHabitCompletion.habitId === habitId
    );

    if (findIndexOfTodayByDateDoneCompletionId !== -1) {
      let completionHabitIdOfTodayDateThatSpecificHabitId = onlyTodayDateHabitCompletionList[findIndexOfTodayByDateDoneCompletionId].Id;

      return await firstValueFrom(
        this._dbContext.deleteByKey(
          'habit_completions',
          completionHabitIdOfTodayDateThatSpecificHabitId // Just the primary key value
        )
      );
    } else {
      throw new Error('No matching habit completion found for today and the given habitId.');
    }
  }

  async getHabitCompletionListFromDbOfTodayDateAsync(): Promise<HabitCompletion[]> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'doneDate',
      IDBKeyRange.only(DateTimePicker.getLocalTodayDateOnly())
    ));
  }

  // get the streak of the habit completion below methods.

  async getSingleHabitStreakHabitCompletionFromDbAsync(habitId: number): Promise<object> {
    return await firstValueFrom(new Observable<Object>((subscriber) => {
      let habitWithItsStreakResult = {
        habitId: habitId,
        streak: 0,
      };
      let localVariablesObj = { // here i have used the reference type and it works like c# ref.
        startStreakFromTodayDate: DateTimePicker.getLocalTodayDateOnly(),
        reducingOneDayDate: DateTimePicker.getLocalTodayDateOnly(),
        isTodayHabitCompletionCheckedYet: false,
        todayStreakDone: false,
        yestardayStreakDone: false,
      }

      this._dbContext.openCursorByIndex({
        storeName: 'habit_completions',
        indexName: 'habitId',
        query: IDBKeyRange.only(habitId),
        direction: 'prev' // decending order it first of habitCompletion of single habit and then get all data.
      }).subscribe({
        next: (cursor: any) => {
          if (cursor) {
            this._computingStreaks(cursor.value, habitWithItsStreakResult, localVariablesObj);
            cursor.continue();
          }
        },
        complete: () => {
          // Cursor iteration done
          console.log('cursor completed');
          subscriber.next(habitWithItsStreakResult);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    }));

  }



  _computingStreaks(reverseSingleHabitCompletionSingleRow: any, habitWithItsStreakResult: any, localVariablesObj: any): void {
    // let singleRow: any = cursor.value; // start from decsending order i mean from last row iteration
    let singleDayHabitCompletionRowFromDb: any = reverseSingleHabitCompletionSingleRow; // start from decsending order i mean from last row iteration
    if (!localVariablesObj.isTodayHabitCompletionCheckedYet) {
      const isTodayCurrentHabitCompletionFoundedOnDb = localVariablesObj.startStreakFromTodayDate == singleDayHabitCompletionRowFromDb.doneDate;
      if (isTodayCurrentHabitCompletionFoundedOnDb) {
        habitWithItsStreakResult.streak += 1;
        localVariablesObj.todayStreakDone = true;
      }
      // then ignore it and not consider to break the streak yet because there still a chance that user do it yestarday a task habit done.
      localVariablesObj.isTodayHabitCompletionCheckedYet = true;
    }


    //  start streak from yestarday.
    // yestarday must be present in habit completion and if not then it means streak breaked.
    // if it is present then streak will live.
    // if isItAssignDoneDateOfYestarday == true then it means we are on yestarday date start and checking it that is it streak alive yestarday
    let isItAssignDoneDateOfYestarday = singleDayHabitCompletionRowFromDb.doneDate != localVariablesObj.startStreakFromTodayDate;
    if (isItAssignDoneDateOfYestarday) {

      // get ready the date for consective from today dates.
      const reduceSingleDayFromPreviousReduceDate = new Date(localVariablesObj.reducingOneDayDate);
      reduceSingleDayFromPreviousReduceDate.setDate(reduceSingleDayFromPreviousReduceDate.getDate() - 1); // Reduce one day from previous
      localVariablesObj.reducingOneDayDate = reduceSingleDayFromPreviousReduceDate.toLocaleDateString('sv-SE');

      // if yestarday or yestarday - 1 and on... date found on db then it means streak is live
      if (localVariablesObj.reducingOneDayDate == singleDayHabitCompletionRowFromDb.doneDate) {
        habitWithItsStreakResult.streak = habitWithItsStreakResult.streak + 1;
      } else {
        // streak is going to break
        const completedDateOfHabit = new Date(singleDayHabitCompletionRowFromDb.doneDate);
        let daysGap = this._getDaysDifference(completedDateOfHabit.toLocaleDateString('sv-SE'), reduceSingleDayFromPreviousReduceDate.toLocaleDateString('sv-SE'));
        // daysGap if yestarday was not done the habit then make it 0
        // this below check is for today and yestarday only and if gap is larger then 1 of completion then auto it will return that habitStreak default value.
        if (daysGap == 1 && habitWithItsStreakResult.streak == 1) {

          // that means its yestarday done and today not yet done habit task so, still true
          if (localVariablesObj.todayStreakDone == false && habitWithItsStreakResult.streak == 1) {
            localVariablesObj.yestardayStreakDone = true;
          }

          if (!localVariablesObj.todayStreakDone && !localVariablesObj.yestardayStreakDone) {
            habitWithItsStreakResult.streak = 0;
          }

        }
        return;
      }
    }
  }

  _getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Get the difference in milliseconds
    const diffInMilliseconds = Math.abs(d2.getTime() - d1.getTime());

    // Convert milliseconds to days (milliseconds in a day = 86400000)
    const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);

    return diffInDays;
  }


}
