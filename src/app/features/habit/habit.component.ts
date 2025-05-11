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


}
