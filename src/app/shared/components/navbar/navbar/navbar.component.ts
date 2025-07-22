import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { HabitCompletionService } from '../../../../core/services/habit-completion.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { DataSharingService } from '../../../services/data-sharing.service';
import { ImportHabitsDoneMessageComponent } from "../../import-habits-done-message/import-habits-done-message.component";
import { filter } from 'rxjs';
import { DropboxService } from '../../../../core/services/dropbox.service';
import { LocalImportExportJsonHabitFileService } from '../../../../core/services/local-import-export-json-habit-file.service';

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
    private _dropboxService: DropboxService,
    private _localImportExportJsonHabitFileService: LocalImportExportJsonHabitFileService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.getCurrentRouteLocationStatus();
    this.loadingSpinnerInitialize();
  }

  // -----------------------------------------------------------------

  // export-section
  async exportActionAccept(): Promise<void> {
    await this._localImportExportJsonHabitFileService.exportHabitJsonAsync();
    this.onCloseExportHabitModel();
  }

  openExportHabitModel(): void {
    this._bootstrapExportHabitModalInstance.show();
  }

  onCloseExportHabitModel(): void {
    this._bootstrapExportHabitModalInstance.hide();
  }


  // -----------------------------------------------------------------

  // import-section
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
        let resultFormated = this._localImportExportJsonHabitFileService.formatedToStoreHabitsAndItsCompletion(arrHabitsWithCompletions);
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

  checkIsUserAgreeToImportHabits(event: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.disableImportBtn = false;
    } else {
      this.disableImportBtn = true;
    }

  }

  async onAcceptActionImport(): Promise<void> {
    await this._localImportExportJsonHabitFileService.onImportHabitsConfirmAsync(this.importData);

    this.onCloseImportHabitModel();
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

  // -----------------------------------------------------------------

  // refresh habits on click
  refreshHabitsOnClick(): void {
    this._dataSharing.refreshHabitsOnRefreshBtn.next(true);
  }

  // -----------------------------------------------------------------

  // loading spinner initializing
  loadingSpinnerInitialize(): void {
    this._dataSharing.showSpinnerSubject.subscribe((value: boolean) => {
      if (!value) {
        setTimeout(() => {
          this.showSpinner = false;
        }, 500)
      }
      this.showSpinner = true;
    });
  }

  // -----------------------------------------------------------------

  // import and export models initializing
  ngAfterViewInit(): void {
    this._bootstrapImportHabitModalInstance = new bootstrap.Modal(this.importHabitModalRef.nativeElement);
    this._bootstrapExportHabitModalInstance = new bootstrap.Modal(this.exportHabitModal.nativeElement);
  }

  // -----------------------------------------------------------------

  // current location of route status
  getCurrentRouteLocationStatus(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
  }
}
