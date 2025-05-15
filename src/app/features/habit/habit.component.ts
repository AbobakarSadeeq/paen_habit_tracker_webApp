import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";
import { FormsModule } from '@angular/forms';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitServiceService } from '../../core/services/habit-service.service';
import { ColorPickerDirective } from 'ngx-color-picker';
import { HabitCompletionService } from '../../core/services/habit-completion.service';
import { DateTimePicker } from '../../shared/utils/dateTime-picker';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-habit',
  imports: [CommonModule, ContributionCalendarComponent, FormsModule, ColorPickerDirective, RouterModule],
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

  constructor(private _habitalService: HabitServiceService,
    private _habitalCompletionService: HabitCompletionService) { }

  async ngOnInit(): Promise<void> {
    this.selectedYearContributionGrid = 2025;

    this.habitList = await this._habitalService.getAllHabitsAsync();

    let startDate = `${this.selectedYearContributionGrid}-01-01`;
    let endDate = `${this.selectedYearContributionGrid}-12-31`;
    this.allContributionCountsAndWithTheirDatesData = await this._habitalCompletionService.getDataForMainContributionGridAsync(startDate, endDate);
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
      createdAt: new Date().toLocaleString(),
      isHabitDoneToday: false
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
      createdAt: this.habitList[indexInMemoryHabitList].createdAt,
      isHabitDoneToday: this.habitList[indexInMemoryHabitList].isHabitDoneToday
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

  // add habit_completion
  async onAddHabitToHabitCompletion(habitFKeyId: number): Promise<void> {
    await this._habitalCompletionService.addHabitCompletionAsync(habitFKeyId);
  }

  // delete habit_completion

  async onDeleteHabitToHabitCompletion(habitFKeyId: number): Promise<void> {
    await this._habitalCompletionService.deleteHabitCompletionAsync(habitFKeyId);
  }

  async toggleOfAddingAndDeletingHabitCompletion(event: any): Promise<void> {
    const isChecked = (event.target as HTMLInputElement).checked;
    const habitIdValue = event.target.value;
    const parseToIntOfHabitId = parseInt(habitIdValue);
    const todayDate = DateTimePicker.getLocalTodayDateOnly();
    if (isChecked) {
      await this.onAddHabitToHabitCompletion(parseToIntOfHabitId);
      this.allContributionCountsAndWithTheirDatesData = {
        ...this.allContributionCountsAndWithTheirDatesData,
        [todayDate]: (this.allContributionCountsAndWithTheirDatesData[todayDate] || 0) + 1
      };

    } else {
      await this.onDeleteHabitToHabitCompletion(parseToIntOfHabitId);
      this.allContributionCountsAndWithTheirDatesData = {
        ...this.allContributionCountsAndWithTheirDatesData,
        [todayDate]: (this.allContributionCountsAndWithTheirDatesData[todayDate] || 0) - 1
      };

    }
  }

}
