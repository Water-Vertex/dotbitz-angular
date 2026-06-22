import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramaticSeoService, ProgramaticSeo } from '../../../../../../services/programatic-seo.service';
import { ToastService } from '../../../../../../services/toast.service';
@Component({
  selector: 'app-programatic-seo-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programatic-seo-edit.html',
  styleUrl: './programatic-seo-edit.css',
})
export class ProgramaticSeoEdit implements OnInit {
  record: ProgramaticSeo | null = null;
  loading = true;
  saving = false;
  message = '';
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programaticSeoService: ProgramaticSeoService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService  // ← Add ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadRecord(Number(id));
    } else {
      this.toast.error('Error', 'No record ID found');  // ← Toaster error
      this.router.navigate(['/admin/programatic-seo/list']);
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.programaticSeoService.getById(id).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.record = response.data;
          this.cdr.detectChanges();
        } else {
          this.toast.error('Not Found', 'Record not found');  // ← Toaster error
          setTimeout(() => this.goBack(), 2000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading record:', error);
        this.toast.error('Error', 'Failed to load record');  // ← Toaster error
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

 saveRecord(): void {
    if (!this.record || !this.record.id) return;

    this.saving = true;
    this.programaticSeoService.update(this.record.id, this.record).subscribe({
        next: (response) => {
            if (response.success) {
                this.showMessage('✅ Record saved successfully!', true);
                setTimeout(() => {
                    this.goBack();
                }, 2000);
            } else {
                this.showMessage(response.message || 'Save failed', false);
                this.saving = false;
            }
        },
        error: (error) => {
            console.error('Error saving record:', error);
            this.showMessage(error.error?.message || 'Failed to save record', false);
            this.saving = false;
        }
    });
}

goBack(): void {
   
    this.router.navigate(['/admin/programatic-seo']);
}

  private showMessage(message: string, isSuccess: boolean): void {
    this.message = message;
    this.isSuccess = isSuccess;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.message = '';
      this.cdr.detectChanges();
    }, 4000);
  }
}