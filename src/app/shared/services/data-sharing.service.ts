import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  constructor() { }


  showSpinnerSubject = new BehaviorSubject<boolean>(false);
  refreshHabitsAfterImport = new BehaviorSubject<boolean>(false);
  refreshHabitsOnRefreshBtn = new BehaviorSubject<boolean>(false);

}
