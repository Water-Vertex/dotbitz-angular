import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../../services/student.service';
import { ToastService } from '../../../../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { Student } from '../../../../../models/student.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-instructor-student-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-list.html',
  styleUrls: ['./student-list.css']
})
export class InstructorStudentList implements OnInit, OnDestroy {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  totalItems: number = 0;
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

    this.studentService.getInstructorStudents(term).subscribe({
      next: (res) => {
        this.students = res.data || [];
        this.filteredStudents = [...this.students];
        this.totalItems = this.students.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.toast.error('Error', 'Failed to load students');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData(): void {
    this.loadStudents();
  }

  viewStudent(id?: number): void {
    if (id) {
      this.router.navigate(['/instructor/student/view', id]);
    }
  }

  

  trackById(index: number, item: Student): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
