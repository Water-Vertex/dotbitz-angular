import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProgramaticSeoService, ProgramaticSeo } from '../../../../../../services/programatic-seo.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-programatic-seo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programatic-seo-list.html',
  styleUrls: ['./programatic-seo-list.css'],
})
export class ProgramaticSeoList implements OnInit, OnDestroy {
  programaticSeos: ProgramaticSeo[] = [];
  allProgramaticSeos: ProgramaticSeo[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  selectedFile: File | null = null;
  uploading = false;
  uploadSuccess = false;
  uploadMessage = '';
  deletingId: number | null = null;
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private programaticSeoService: ProgramaticSeoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRecords();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((searchText: string) => {
      this.filterRecords(searchText);
    });
  }

  getPreview(text: string | undefined | null, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  loadRecords(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.programaticSeoService.getAll().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.allProgramaticSeos = response.data || [];
          this.programaticSeos = [...this.allProgramaticSeos];
          this.totalItems = this.programaticSeos.length;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading records:', error);
        this.toast.error('Error', 'Failed to load records');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterRecords(searchText: string): void {
    if (!searchText || searchText.trim() === '') {
      this.programaticSeos = [...this.allProgramaticSeos];
    } else {
      const searchLower = searchText.toLowerCase().trim();
      this.programaticSeos = this.allProgramaticSeos.filter(record => {
        return (
          record.focus_keyword?.toLowerCase().includes(searchLower) ||
          record.h1_heading?.toLowerCase().includes(searchLower) ||
          record.content?.toLowerCase().includes(searchLower) ||
          record.id?.toString().includes(searchLower)
        );
      });
    }
    this.totalItems = this.programaticSeos.length;
    this.cdr.detectChanges();
  }

  refreshData(): void {
    this.searchTerm = '';
    this.loadRecords();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validExtensions = ['.csv', '.xls', '.xlsx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (validExtensions.includes(fileExt)) {
        this.selectedFile = file;
        this.uploadMessage = '';
      } else {
        this.toast.error('Invalid File', 'Please select valid CSV/Excel file');
        this.selectedFile = null;
        event.target.value = '';
      }
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.cdr.detectChanges();

    this.programaticSeoService.importCsv(this.selectedFile).subscribe({
      next: (response) => {
        if (response && response.success) {
          const { new: n, updated, skipped } = response.summary || { new: 0, updated: 0, skipped: 0 };

          if (n > 0) {
            this.toast.success('Success', `${n} New record(s) added successfully!`);
          }
          if (updated > 0) {
            this.toast.success('Updated', `${updated} Record(s) updated with new content.`);
          }
          if (skipped > 0) {
            this.toast.info('Already Present', `${skipped} Record(s) are already present.`);
          }

          this.selectedFile = null;
          const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          this.searchTerm = '';
          this.loadRecords();
        } else {
          this.toast.error('Import Failed', response?.message || 'Failed to import records');
        }
        this.uploading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.toast.error('Import Failed', error.error?.message || 'Failed to upload file');
        this.uploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editRecord(id: number): void {
    this.router.navigate(['/admin/programatic-seo/edit', id]);
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.deletingId = id;
      this.cdr.detectChanges();

      this.programaticSeoService.delete(id).subscribe({
        next: (response) => {
          if (response && response.success) {
            this.toast.success('Deleted!', 'Record deleted successfully!');
            this.loadRecords();
          } else {
            this.toast.error('Delete Failed', response?.message || 'Failed to delete record');
          }
          this.deletingId = null;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toast.error('Delete Failed', error.error?.message || 'Failed to delete record');
          this.deletingId = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  viewRecord(id: number): void {
    this.router.navigate(['/admin/programatic-seo/view', id]);
  }

  viewOnWebsite(pageSlug: string): void {
    const slug = pageSlug.toLowerCase().replace(/\s+/g, '-');
    window.open(`https://dotbitz.com/${slug}`, '_blank');
  }

  private showMessage(message: string, isSuccess: boolean): void {
    this.uploadMessage = message;
    this.uploadSuccess = isSuccess;
    setTimeout(() => {
      this.uploadMessage = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNewRecord(): void {
  this.router.navigate(['/admin/programatic-seo/add']);
}




}
