import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { HabitCompletionService } from '../../../../core/services/habit-completion.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { DataSharingService } from '../../../services/data-sharing.service';
import { ImportHabitsDoneMessageComponent } from "../../import-habits-done-message/import-habits-done-message.component";
import { filter } from 'rxjs';
import { DropboxUploadServiceService } from '../../../../core/services/dropbox-upload-service.service';

declare var bootstrap: any;


@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, SpinnerComponent, ImportHabitsDoneMessageComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true,
})

export class NavbarComponent {
  showSpinner = false;

  currentUrl = '';

  @ViewChild('ImportHabitModal') importHabitModalRef!: ElementRef;
  private _bootstrapImportHabitModalInstance: any;

  @ViewChild('ExportHabitModal') exportHabitModal!: ElementRef;
  private _bootstrapExportHabitModalInstance: any;
  showImportDoneMessage: boolean = false;


  constructor(private _habitService: HabitService,
    private _habitalCompletionService: HabitCompletionService,
    private _dataSharing: DataSharingService,
    private _dropboxService: DropboxUploadServiceService,
    private router: Router) {
  }

  ngOnInit(): void {
    console.log("hi how are you i am fine and you!");
    // when navigation is end then assign the url to the currentUrl property on navbar and navbar view is static thats why adding everytime when navigation end.
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
        console.log(event.url);
      });

    this._loadingSpinnerInitialize();
    this.initializeDropboxSignIn();
  }

  initializeDropboxSignIn(): void {

    this._dropboxService.abcRequest().subscribe((value: any) => {
      console.log(value);
      console.log('asdnsjakdnsajkd');
    });

    // this.getAuthUrl();
  }

  getAuthUrl() {
    // this.dbxMain?.usersGetCurrentAccount()
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });

    // this.dbxMain?.filesListFolder({ path: '' })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });
  }

  _loadingSpinnerInitialize(): void {
    this._dataSharing.showSpinnerSubject.subscribe((value: boolean) => {
      if (!value) {
        setTimeout(() => {
          this.showSpinner = false;
        }, 500)
      }
      this.showSpinner = true;
    });
  }

  ngAfterViewInit(): void {
    this._bootstrapImportHabitModalInstance = new bootstrap.Modal(this.importHabitModalRef.nativeElement);
    this._bootstrapExportHabitModalInstance = new bootstrap.Modal(this.exportHabitModal.nativeElement);

  }

  // export code

  async exportHabitJson(): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);
    // get only habits
    let allHabitListForExportingFormat: any[] = await this._habitService.getAllHabitsForExportingJsonFileAsync();
    // each habitId will be having ascending wise habitId
    let assignNumberInOrderWiseToHabit: { [key: number]: number } = {};
    let currentId = 1;
    allHabitListForExportingFormat.forEach(singleHabit => {
      if (assignNumberInOrderWiseToHabit[singleHabit.Id] == undefined) {
        assignNumberInOrderWiseToHabit[singleHabit.Id] = currentId;
        currentId++
      }
    });

    let allHabitsCompletionListForExportingFormat = await this._habitalCompletionService.getAllHabitsCompleteionForExportingJsonFileAsync(assignNumberInOrderWiseToHabit);
    let exportJsonFileFormateOfHabitsStore: any[] = [];
    allHabitListForExportingFormat.forEach(singleHabit => {
      exportJsonFileFormateOfHabitsStore.push(
        {
          'habitId': allHabitsCompletionListForExportingFormat?.[singleHabit.Id][0]['habitId'],
          'name': singleHabit.name,
          'color': singleHabit.color,
          'description': singleHabit.description,
          'imageUrl': singleHabit.imageUrl,
          'createdAt': singleHabit.createdAt,
          'habitCompletions': allHabitsCompletionListForExportingFormat?.[singleHabit.Id][0]['doneDate'] ?? []
        }
      );
    });

    this._downloadJsonFile(exportJsonFileFormateOfHabitsStore);
    this._dataSharing.showSpinnerSubject.next(false);
    this.onCloseExportHabitModel();

  }

  _downloadJsonFile(data: any): void {
    const today = new Date();
    const dateTime = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}_${today.getHours().toString().padStart(2, '0')}-${today.getMinutes().toString().padStart(2, '0')}`;
    const convertToString = JSON.stringify(data);
    const blob = new Blob([convertToString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dateTime}_PaenHabit.json`; // fileName
    a.click();
    URL.revokeObjectURL(url);
  }

  openExportHabitModel(): void {
    this._bootstrapExportHabitModalInstance.show();
  }

  onCloseExportHabitModel(): void {
    this._bootstrapExportHabitModalInstance.hide();
  }

  // -----------------------------------------------------------------


  // import code

  isItImportFileIsInvalid: boolean = false;
  disableImportBtn = true;
  showConfirmationToAddImportHabits = false;
  importData: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  async onFileSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      console.log('No file selected.');
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrHabitsWithCompletions = JSON.parse(reader.result as string);
        let resultFormated = this._formatedToStoreHabitsAndItsCompletion(arrHabitsWithCompletions);
        if (!resultFormated['isFileInCorrectFormat']) {
          this.isItImportFileIsInvalid = true;
          this.showConfirmationToAddImportHabits = false;
          this.disableImportBtn = true;
          return;
        } else {
          this.isItImportFileIsInvalid = false;
          this.showConfirmationToAddImportHabits = true;
        }

        this.importData = resultFormated;

      } catch (err) {
        this.isItImportFileIsInvalid = true;
        console.error('Error parsing JSON:', err);
      }
    };

    reader.onerror = () => {
      console.error('File reading error:', reader.error);
    };

    reader.readAsText(file);
  }

  _formatedToStoreHabitsAndItsCompletion(arrHabitsWithCompletions: any[]): any {
    let result: any = {
      'habits': [],
      'habitCompletions': [],
      'isFileInCorrectFormat': false
    }

    for (var singleHabitWithItsCompletions of arrHabitsWithCompletions) {
      let singleHabit = {
        'name': singleHabitWithItsCompletions['name'],
        'color': singleHabitWithItsCompletions['color'],
        'description': singleHabitWithItsCompletions['description'],
        'imageUrl': singleHabitWithItsCompletions['imageUrl'],
        'createdAt': singleHabitWithItsCompletions['createdAt'],
      }

      if (singleHabit.name == undefined || singleHabit.color == undefined || singleHabit.createdAt == undefined) {
        return result;
      }

      let mappedForToStoreInDbFormat: any[] = singleHabitWithItsCompletions['habitCompletions'].map((date: string) => ({
        doneDate: date,
        habitId: singleHabitWithItsCompletions['habitId'],
      }));

      let habitCompletions = [...result['habitCompletions'], ...mappedForToStoreInDbFormat];
      result['habits'].push(singleHabit);
      result['habitCompletions'] = habitCompletions;
    }
    result['isFileInCorrectFormat'] = true;
    return result;
  }

  // on import model

  checkIsUserAgreeToImportHabits(event: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.disableImportBtn = false;
    } else {
      this.disableImportBtn = true;
    }

  }

  openImportHabitModel(): void {
    this._bootstrapImportHabitModalInstance.show();
  }

  onCloseImportHabitModel(): void {
    this._bootstrapImportHabitModalInstance.hide();
    this.isItImportFileIsInvalid = false;
    this.disableImportBtn = true;
    this.showConfirmationToAddImportHabits = false;
    this.fileInput.nativeElement.value = '';

  }

  async onImportHabitsConfirm(): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);
    let resultFormated = this.importData;
    // remove data from tables
    await this._habitService.resetHabitAsync();
    await this._habitalCompletionService.resetHabitCompletionAsync();

    // stored data in bulk inside habit and return their primary keys where does it stored.
    let primaryKeysStored = await this._habitService.bulkSaveHabitsAsync(resultFormated.habits);

    // first any value of primary key == 1, second any value of primary key == 2
    let habitNumberCompletionWise = 1;
    for (var singleHabitCompletion of resultFormated['habitCompletions']) {
      if (singleHabitCompletion['habitId'] == habitNumberCompletionWise) {
        singleHabitCompletion['habitId'] = primaryKeysStored[habitNumberCompletionWise - 1]; // assign primary key value here of to that habit completion where it equals to habitId
      } else {
        habitNumberCompletionWise = singleHabitCompletion['habitId'];
        singleHabitCompletion['habitId'] = primaryKeysStored[habitNumberCompletionWise - 1]
      }
    }
    await this._habitalCompletionService.bulkSaveHabitsCompletionAsync(resultFormated.habitCompletions);
    this._dataSharing.showSpinnerSubject.next(false);
    this.onCloseImportHabitModel();
    this._dataSharing.refreshHabitsAfterImport.next(true);


    setTimeout(() => {
      this.showImportDoneMessage = true;
    }, 1000)

    setTimeout(() => {
      this.showImportDoneMessage = false;
      this._navigateOnImportToHome();
    }, 4000)

  }

  _navigateOnImportToHome(): void {
    // here when import is done then navigate to home page for to prevent errors.
    if (this.currentUrl.startsWith('/habit')) {
      console.log('imported new data and navigated to home successful!');
      this.router.navigate(['']);
    }
  }

  // -----------------------------------------------------------------

  // refresh habits on click

  refreshHabitsOnClick(): void {
    this._dataSharing.refreshHabitsOnRefreshBtn.next(true);
  }
}
