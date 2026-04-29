import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuardianService } from '../../../../services/guardian.service';
import { ClassScheduleService } from '../../../../services/classschedule.service';

@Component({
  selector: 'app-class-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-schedule.html',
  styleUrl: './class-schedule.css',
})
export class GuardianClassSchedule implements OnInit {
  students: any[] = [];
  selectedStudentId: any = null;
  schedules: any[] = [];
  loading: boolean = false;
  studentsLoading: boolean = false;  // new
  expandedIndex: number | null = null;

  constructor(
    private guardianService: GuardianService,
    private scheduleService: ClassScheduleService,
    private cdr: ChangeDetectorRef   // inject CDR
  ) {}

  ngOnInit(): void {
    this.loadMyStudents();
  }

  loadMyStudents() {
    this.studentsLoading = true;
    this.guardianService.getGuardianStudents().subscribe({
      next: (res) => {
        this.students = res.students || [];
        this.studentsLoading = false;
        this.cdr.detectChanges();  // force view update
      },
      error: (err) => {
        console.error('Error loading students', err);
        this.studentsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onStudentChange() {
    this.expandedIndex = null;
    this.schedules = [];

    if (!this.selectedStudentId || this.selectedStudentId === 'null') return;

    this.loading = true;
    this.cdr.detectChanges();  // show loader immediately

    this.scheduleService.getGuardianStudentSchedules(this.selectedStudentId).subscribe({
      next: (res) => {
        this.schedules = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();  // force render schedules without needing a click
      },
      error: (err) => {
        console.error('Error loading schedules', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSchedule(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
    this.cdr.detectChanges();
  }

  trackByScheduleId(index: number, item: any): number {
    return item.id ?? index;
  }

  isToday(day: string): boolean {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return day.toLowerCase() === today;
  }
}