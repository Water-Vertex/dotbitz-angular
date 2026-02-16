import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../../services/student.service';
import { ToastService } from '../../../../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { Student } from '../../../../../models/student.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-list.html',
  styleUrls: ['./student-list.css']
})
export class StudentList implements OnInit, OnDestroy {
  students: Student[] = [];
  searchControl = new FormControl('');
  isLoading = false;

  private destroy$ = new Subject<void>();

  private studentService = inject(StudentService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadStudents();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadStudents());
  }

  loadStudents(): void {
  this.isLoading = true;
  const term = this.searchControl.value || '';

  this.studentService.getStudents(term).subscribe({
    next: (res) => {
      this.students = res.data || []; // <-- FIXED: res.data instead of res
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.toast.error('Error', 'Failed to load students');
      this.isLoading = false;
    }
  });
}


  refreshData() {
    this.loadStudents();
  }

  deleteStudent(id?: number) {
    if (!id || !confirm('Are you sure you want to delete this student?')) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.toast.success('Deleted', 'Student deleted successfully');
        this.loadStudents();
      },
      error: () => this.toast.error('Error', 'Failed to delete student')
    });
  }

  trackById(index: number, item: Student): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
