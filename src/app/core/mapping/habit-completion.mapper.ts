import { HabitCompletionViewModel } from "../../presentation/view-models/habit-completion.view-model";
import { HabitCompletion } from "../models/entities/habit-completion";

export abstract class HabitCompletionMapper {

  public static ToHabitCompletionEntity(viewModel: HabitCompletionViewModel): HabitCompletion {
    return {
      Id: viewModel.Id,
      doneDate: viewModel.doneDate,
      habitId: viewModel.habitId
    };
  }

  public static ToHabitCompletionViewModel(entity: HabitCompletion): HabitCompletionViewModel {
    return {
      Id: entity.Id,
      doneDate: entity.doneDate,
      habitId: entity.habitId
    };
  }

  public static ToListHabitCompletionViewModel(habitCompletionList: HabitCompletion[]): HabitCompletionViewModel[] {
    return habitCompletionList.map(singleHabitCompletion =>
      this.ToHabitCompletionViewModel(singleHabitCompletion)
    );
  }
}
