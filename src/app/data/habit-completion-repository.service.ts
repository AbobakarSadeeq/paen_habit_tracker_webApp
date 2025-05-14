import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';

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

  async getHabitCompletionListFromDbOfTodayDateAsync(): Promise<any> {
    return await firstValueFrom(this._dbContext.getAllByIndex(
      'habit_completions',
      'doneDate',
      IDBKeyRange.only(new Date().toISOString().split('T')[0])
    ));
  }

  async getListOfHabitCompletionStreakFromDbAsync(): Promise<void> {
    let habitWithItsStreak = [];
    // find the streak of date on habit completion.
    // start from today date and still today start date is not found on completion then its fine and ignore it.
    // last date should be there 100% if not then streak is over.
    const currentDate = new Date().toISOString().split('T')[0];


    this._dbContext.openCursorByIndex({
      storeName: 'habit_completions',
      indexName: 'habitId',
      query: IDBKeyRange.bound('22', '23'),
      direction: 'prev'
    }).subscribe((cursor) => {
      let singleRow: any = cursor.value;


      console.log(cursor.value);
      habitWithItsStreak.push({
        'habitId': singleRow.habitId,
        'streak': 1,
      });
      cursor.continue();
      console.log(habitWithItsStreak);

    });


    console.log('abcdefg');
    // get all those and thenn iterrrate on it
  }

  // async getSingleOfHabitCompletionStreakFromDbAsync(habitId: string): Observable<any> {

  //   let habitWithItsStreak = {
  //     'habitId': habitId,
  //     'streak': 0
  //   };;
  //   const startStreakFromTodayDate = new Date().toISOString().split('T')[0];
  //   let reducingOneDayDate = new Date().toISOString().split('T')[0];
  //   let isTodayHabitCompletionCheckedYet = false;


  //  return  this._dbContext.openCursorByIndex({
  //     storeName: 'habit_completions',
  //     indexName: 'habitId',
  //     query: IDBKeyRange.only(habitId),
  //     direction: 'prev'
  //   }).subscribe((cursor) => {
  //     let singleRow: any = cursor.value;
  //     console.log(singleRow);
  //     cursor.continue();
  //   });





  getSingleOfHabitCompletionStreakFromDbAsync(habitId: string): Observable<any> {
    let habitWithItsStreakResult = {
      'habitId': habitId,
      'streak': 0
    };

    const startStreakFromTodayDate = new Date().toISOString().split('T')[0];
    let reducingOneDayDate = new Date().toISOString().split('T')[0];
    let isTodayHabitCompletionCheckedYet = false;

    return new Observable<any>((subscriber) => {
      this._dbContext.openCursorByIndex({
        storeName: 'habit_completions',
        indexName: 'habitId',
        query: IDBKeyRange.only(habitId),
        direction: 'prev'
      }).subscribe({
        next: (cursor) => {




          let singleRow: any = cursor.value; // start from decsending order i mean from last row iteration
          if (!isTodayHabitCompletionCheckedYet) {
            const isTodayCurrentHabitCompletionFoundedOnDb = startStreakFromTodayDate == singleRow.doneDate;
            if (isTodayCurrentHabitCompletionFoundedOnDb) {
              habitWithItsStreakResult.streak = habitWithItsStreakResult.streak + 1;
            }
            // then ignore it and not consider to break the streak yet because there still a chance that user do it
            isTodayHabitCompletionCheckedYet = true;
          }


          //  start streak from yestarday.
          // yestarday must be present in habit completion and if not then it means streak breaked.
          // if it is present then streak will live.
          if (singleRow.doneDate != startStreakFromTodayDate) {
            const reduceSingleDayFromPreviousReduceDate = new Date(reducingOneDayDate);
            reduceSingleDayFromPreviousReduceDate.setDate(reduceSingleDayFromPreviousReduceDate.getDate() - 1); // Reduce one day from previous
            reducingOneDayDate = reduceSingleDayFromPreviousReduceDate.toISOString().split('T')[0];
            if (reducingOneDayDate == singleRow.doneDate) {
              habitWithItsStreakResult.streak = habitWithItsStreakResult.streak + 1;

            } else {
              // streak breaked so, it will become zero
              const completedDateOfHabit = new Date(singleRow.doneDate);
              let daysGap = this._getDaysDifference(completedDateOfHabit.toISOString().split('T')[0], reduceSingleDayFromPreviousReduceDate.toISOString().split('T')[0]);
              if (daysGap > 0) {
                habitWithItsStreakResult.streak = 0;
              }
              return;
            }
          }


















          cursor.continue();









        },
        complete: () => {
          subscriber.next(habitWithItsStreakResult);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }

  testingTheStreak(completedHabitDates: any[]): void {
    let habitWithItsStreakResult = {
      'habitId': 0,
      'streak': 0
    };

    const startStreakFromTodayDate = new Date().toISOString().split('T')[0];
    let reducingOneDayDate = new Date().toISOString().split('T')[0];
    let isTodayHabitCompletionCheckedYet = false;
    let todayStreakDone = false;
    let yestardayStreakDone = false;
    for (var cursor of completedHabitDates) {

      // let singleRow: any = cursor.value; // start from decsending order i mean from last row iteration
      let singleRow: any = cursor; // start from decsending order i mean from last row iteration
      if (!isTodayHabitCompletionCheckedYet) {
        const isTodayCurrentHabitCompletionFoundedOnDb = startStreakFromTodayDate == singleRow.doneDate;
        if (isTodayCurrentHabitCompletionFoundedOnDb) {
          habitWithItsStreakResult.streak += 1;
          todayStreakDone = true;
        } else {
          // No record for today, but don't break the streak yet
          todayStreakDone = false;
        }
        // then ignore it and not consider to break the streak yet because there still a chance that user do it
        isTodayHabitCompletionCheckedYet = true;
      }


      //  start streak from yestarday.
      // yestarday must be present in habit completion and if not then it means streak breaked.
      // if it is present then streak will live.
      if (singleRow.doneDate != startStreakFromTodayDate) {
        const reduceSingleDayFromPreviousReduceDate = new Date(reducingOneDayDate);
        reduceSingleDayFromPreviousReduceDate.setDate(reduceSingleDayFromPreviousReduceDate.getDate() - 1); // Reduce one day from previous
        reducingOneDayDate = reduceSingleDayFromPreviousReduceDate.toISOString().split('T')[0];
        // if yestarday date found on db then it means streak is live
        if (reducingOneDayDate == singleRow.doneDate) {
          habitWithItsStreakResult.streak = habitWithItsStreakResult.streak + 1;


        } else {
          // streak breaked so, it will become zero
          const completedDateOfHabit = new Date(singleRow.doneDate);
          let daysGap = this._getDaysDifference(completedDateOfHabit.toISOString().split('T')[0], reduceSingleDayFromPreviousReduceDate.toISOString().split('T')[0]);
          // daysGap if yestarday was not done the habit then make it 0
          // this below check is for today and yestarday only and if gap is larger then 1 of completion then auto it will return that habitStreak default value.
          if (daysGap == 1 && habitWithItsStreakResult.streak == 1) {

            // that means its yestarday done and today not yet done habit task so, still true
            if (todayStreakDone == false && habitWithItsStreakResult.streak == 1) {
              yestardayStreakDone = true;
            }

            if (!todayStreakDone && !yestardayStreakDone) {
              habitWithItsStreakResult.streak = 0;
            }

          }
          break;
        }
      }

    };

    console.log(habitWithItsStreakResult);

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
