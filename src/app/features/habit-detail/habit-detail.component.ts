import { Component, Inject } from '@angular/core';
import { HabitCompletionService } from '../../core/services/habit-completion.service';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-habit-detail',
  imports: [RouterModule],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.css'
})
export class HabitDetailComponent {

  selectedHabitStreak: any = {}

  constructor(private _habitCompletionService: HabitCompletionService, @Inject(ActivatedRoute) private _routeActivate: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    let habitId: string = this._routeActivate.snapshot.params['Id'];
    this.selectedHabitStreak = await this._habitCompletionService.getSelectedHabitStreak(parseInt(habitId));
  }
}
