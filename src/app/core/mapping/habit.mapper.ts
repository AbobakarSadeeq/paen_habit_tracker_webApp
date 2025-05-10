import { Habit } from "../models/entities/habit";
import { HabitViewModel } from "../../presentation/view-models/habit.view-model";

export abstract class HabitMapper {

  public static ToHabitEntity(viewModel: HabitViewModel): Habit {
    return {
      Id: viewModel.Id,
      name: viewModel.name,
      createdAt: viewModel.createdAt
    };
  }

  public static ToHabitViewModel(entity: Habit): HabitViewModel {
    return {
      Id: entity.Id,
      name: entity.name,
      createdAt: entity.createdAt
    };
  }
}

