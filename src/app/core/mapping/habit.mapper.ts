import { Habit } from "../models/entities/habit";
import { HabitViewModel } from "../../presentation/view-models/habit.view-model";

export abstract class HabitMapper {

  public static ToHabitEntity(viewModel: HabitViewModel): Habit {
    return {
      Id: viewModel.Id,
      name: viewModel.name,
      color: viewModel.color,
      createdAt: viewModel.createdAt
    };
  }

  public static ToHabitViewModel(entity: Habit, isHabitDoneToday: boolean): HabitViewModel {
    return {
      Id: entity.Id,
      name: entity.name,
      color: entity.color,
      createdAt: entity.createdAt,
      isHabitDoneToday: isHabitDoneToday
    };
  }

  public static ToListHabitViewModel(habitList: Habit[], isHabitDoneToday: boolean): HabitViewModel[] {
    return habitList.map(habit =>
      this.ToHabitViewModel(habit, isHabitDoneToday)
    );
  }

}

