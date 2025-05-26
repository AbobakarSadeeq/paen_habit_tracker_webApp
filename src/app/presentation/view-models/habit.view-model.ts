export interface HabitViewModel {
  Id?: number;
  name: string;
  color: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  isHabitDoneToday?:boolean;
}
