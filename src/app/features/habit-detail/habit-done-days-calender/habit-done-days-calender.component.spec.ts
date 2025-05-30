import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitDoneDaysCalenderComponent } from './habit-done-days-calender.component';

describe('HabitDoneDaysCalenderComponent', () => {
  let component: HabitDoneDaysCalenderComponent;
  let fixture: ComponentFixture<HabitDoneDaysCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitDoneDaysCalenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitDoneDaysCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
