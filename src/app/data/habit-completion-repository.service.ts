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
      // doneDate: '2025-05-16',
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

  async getSelectedHabitContributionDataFromDbByHabitIdAndSelectedYearAsync(habitId: number, yearSelected: string): Promise<{ [key: string]: number }> {
    return await firstValueFrom(new Observable<{ [key: string]: number }>((subscriber) => {
      let selectedHabitWithTheirDatesContribution: { [key: string]: number } = {};
      let currentYear = new Date().getFullYear().toString();
      let isSelectedYearIterationDone = false;
      this._dbContext.openCursorByIndex({
        storeName: 'habit_completions',
        indexName: 'habitId',
        query: IDBKeyRange.only(habitId),
        direction: 'prev' // decending order it first of habitCompletion of single habit and then get all data.
      }).subscribe({
        next: (cursor: any) => {
          if (!cursor) return;

          let singleRow = cursor.value;
          if (yearSelected == currentYear) { // current year iteration.

            if (singleRow.doneDate.startsWith(yearSelected)) { // if year is current found on db then it means
              selectedHabitWithTheirDatesContribution[singleRow.doneDate] = 1;
              cursor.continue(); // Continue only if matched
            } else {
              // Stop the iteration manually by calling subscriber.complete()
              subscriber.next(selectedHabitWithTheirDatesContribution);
              subscriber.complete();
              return;
            }

          } else {
            // if selected year founded like 2023 then below condition will become true
            // if current year is not equal to selected year then start the iteration from that year and cancel when it become - 1
            if (singleRow.doneDate.startsWith(yearSelected)) { // first it will iterate till current year is completed.
              selectedHabitWithTheirDatesContribution[singleRow.doneDate] = 1;
              cursor.continue(); // Continue only if matched
              isSelectedYearIterationDone = true; // here i make it already that if value not founded then on next else stop iteration.
            } else {
              // when that yearSelected Founded on db and then not found again then it means its iteration is done isSelectedYearIterationDone will become true
              if (!isSelectedYearIterationDone) {
                if ((parseInt(yearSelected) - parseInt(currentYear)) > 0) {
                  // if yearSelected like 2023 and current is 2025 year then check the difference is it in positive value or more then 0 then it means still dont drop the cursor and we didnt have reached to selected year iteration.
                  cursor.continue(); // Continue only if matched
                }
              }

              // Stop the iteration manually by calling subscriber.complete() and when isSelectedYearIterationDone become true
              if (isSelectedYearIterationDone) {
                subscriber.next(selectedHabitWithTheirDatesContribution);
                subscriber.complete();
                return;
              }
            }

          }

        },
        complete: () => {
          // Cursor iteration done
          console.log('cursor completed of single habit contribution data');
          subscriber.next(selectedHabitWithTheirDatesContribution);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });

    }));
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
        isItStreakStopIncreasing: false
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

            // stop cursor when streak not further going and if i dont stop it then it will iterate last year as well which is inefficent.
            if (localVariablesObj.isItStreakStopIncreasing) {
              subscriber.next(habitWithItsStreakResult);
              subscriber.complete();
              return;
            }

            cursor.continue();
          }
        },
        complete: () => {
          // Cursor iteration done
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
        // streak here will become stop and not will go furthor more
        const completedDateOfHabit = new Date(singleDayHabitCompletionRowFromDb.doneDate);
        let daysGap = this._getDaysDifference(completedDateOfHabit.toLocaleDateString('sv-SE'), reduceSingleDayFromPreviousReduceDate.toLocaleDateString('sv-SE'));
        // daysGap if yestarday was not done the habit then make it 0
        // this below check is for today and yestarday only and if gap is larger then 1 of completion then auto it will return that habitStreak default value.
        if (daysGap == 1 && habitWithItsStreakResult.streak == 1) {

          // that means its yestarday done and today not yet done habit task so, still true and streak make it alive and check if its yestarday - 1 also checked or not
          if (localVariablesObj.todayStreakDone == false && habitWithItsStreakResult.streak == 1) {
            localVariablesObj.yestardayStreakDone = true;
            return;
          }

          if (!localVariablesObj.todayStreakDone && !localVariablesObj.yestardayStreakDone) {
            habitWithItsStreakResult.streak = 0;
          }

        }
        localVariablesObj.isItStreakStopIncreasing = true;
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
