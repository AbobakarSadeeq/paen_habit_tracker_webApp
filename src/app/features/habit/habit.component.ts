import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";
import { FormsModule } from '@angular/forms';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitServiceService } from '../../core/services/habit-service.service';
import { ColorPickerComponent, ColorPickerDirective } from 'ngx-color-picker';

declare var bootstrap: any;

@Component({
  selector: 'app-habit',
  imports: [CommonModule, ContributionCalendarComponent, FormsModule, ColorPickerDirective],
  templateUrl: './habit.component.html',
  styleUrl: './habit.component.css'
})
export class HabitComponent {

  @ViewChild('AddHabitModal') habitModalRef!: ElementRef;
  private _bootstrapModalInstance: any;

  @ViewChild('UpdateHabitModal') updateHabitModalRef!: ElementRef;
  private _bootstrapUpdateHabitModalInstance: any;
  selectedHabitId: number = -1;

  @ViewChild('DeleteHabitModal') deleteHabitModalRef!: ElementRef;
  private _bootstrapDeleteHabitModalInstance: any;


  allContributionCountsAndWithTheirDatesData: { [key: string]: number } = {};
  selectedYearContributionGrid: number = 0;
  newHabitValue: string = "";
  isNewHabitInputValidate: boolean = false;
  habitList: HabitViewModel[] = [];
  selectedColor: string = "";
  isColorSelectValidate: boolean = false;

  constructor(private _habitalService: HabitServiceService) { }

  async ngOnInit(): Promise<void> {

    this.habitList = await this._habitalService.getAllHabitsAsync();

    this.allContributionCountsAndWithTheirDatesData = {
      '2025-01-01': 1,
      '2025-01-02': 2,
      '2025-01-03': 3,
      '2025-01-04': 4,
      '2025-01-05': 5,
      '2025-01-06': 6,
      '2025-05-06': 2,
      '2025-01-08': 8,
      '2025-01-09': 9,
      '2025-05-10': 10
    };

    this.selectedYearContributionGrid = 2025;
  }

  ngAfterViewInit(): void {
    this._bootstrapModalInstance = new bootstrap.Modal(this.habitModalRef.nativeElement);
    this._bootstrapUpdateHabitModalInstance = new bootstrap.Modal(this.updateHabitModalRef.nativeElement);
    this._bootstrapDeleteHabitModalInstance = new bootstrap.Modal(this.deleteHabitModalRef.nativeElement);
  }


  // add habit model toggles and handlers
  async onAddHabit(): Promise<void> {
    if (!this.newHabitValue) {
      this.isNewHabitInputValidate = true;
      return;
    } else if (!this.selectedColor) {
      this.isNewHabitInputValidate = false;
      this.isColorSelectValidate = true;
      return;
    }

    let addHabitViewModel: HabitViewModel = {
      Id: 0,
      name: this.newHabitValue,
      color: this.selectedColor,
      createdAt: new Date().toLocaleString()
    };
    let addedHabitObj = await this._habitalService.storeHabitAsync(addHabitViewModel);
    this.habitList.push(addedHabitObj);

    this.onCloseHabitModel();
  }

  openAddHabitModel(): void {
    this._bootstrapModalInstance.show();
  }

  onCloseHabitModel(): void {
    this._bootstrapModalInstance.hide();
    this.isNewHabitInputValidate = false;
    this.isColorSelectValidate = false;
    this.newHabitValue = "";
    this.selectedColor = "";
  }

  // update habit model

  async onUpdateHabitModel(): Promise<void> {
    if (!this.newHabitValue) {
      this.isNewHabitInputValidate = true;
      return;
    } else if (!this.selectedColor) {
      this.isNewHabitInputValidate = false;
      this.isColorSelectValidate = true;
      return;
    }

    const indexInMemoryHabitList = this.habitList.findIndex(singleHabit => singleHabit.Id == this.selectedHabitId);
    if (indexInMemoryHabitList != -1) {
      this.habitList[indexInMemoryHabitList].name = this.newHabitValue;
      this.habitList[indexInMemoryHabitList].color = this.selectedColor;
    }

    let updateHabitViewModel: HabitViewModel = {
      Id: this.selectedHabitId,
      name: this.newHabitValue,
      color: this.selectedColor,
      createdAt: this.habitList[indexInMemoryHabitList].createdAt
    };


    this._habitalService.updateHabitsAsync(updateHabitViewModel);

    this.onCloseUpdateHabitModel();
  }

  openUpdateHabitModel(selectedHabit: HabitViewModel): void {
    this.selectedHabitId = selectedHabit.Id;
    this.selectedColor = selectedHabit.color;
    this.newHabitValue = selectedHabit.name;
    this._bootstrapUpdateHabitModalInstance.show();
  }

  onCloseUpdateHabitModel(): void {
    this._bootstrapUpdateHabitModalInstance.hide();
    this.isNewHabitInputValidate = false;
    this.isColorSelectValidate = false;
    this.newHabitValue = "";
    this.selectedColor = "";
    this.selectedHabitId = -1;
  }

  // delete habit model

  openDeleteHabitModel(): void {
    this._bootstrapUpdateHabitModalInstance.hide();
    this._bootstrapDeleteHabitModalInstance.show();
  }

  onCloseDeleteHabitModel(): void {
    this._bootstrapDeleteHabitModalInstance.hide();
    this.isNewHabitInputValidate = false;
    this.isColorSelectValidate = false;
    this.newHabitValue = "";
    this.selectedColor = "";
    this.selectedHabitId = -1;
  }


  async onDeleteHabitModel(): Promise<void> {
    const indexInMemoryHabitList = this.habitList.findIndex(singleHabit => singleHabit.Id == this.selectedHabitId);
    this.habitList.splice(indexInMemoryHabitList, 1);
    this._habitalService.deleteHabitAsync(this.selectedHabitId);
    this.onCloseDeleteHabitModel();
  }


}
