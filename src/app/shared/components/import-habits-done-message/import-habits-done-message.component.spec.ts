import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportHabitsDoneMessageComponent } from './import-habits-done-message.component';

describe('ImportHabitsDoneMessageComponent', () => {
  let component: ImportHabitsDoneMessageComponent;
  let fixture: ComponentFixture<ImportHabitsDoneMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportHabitsDoneMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportHabitsDoneMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
