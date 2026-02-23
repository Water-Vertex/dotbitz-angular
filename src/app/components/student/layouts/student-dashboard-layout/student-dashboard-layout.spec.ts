import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDashboardLayout } from './student-dashboard-layout';

describe('StudentDashboardLayout', () => {
  let component: StudentDashboardLayout;
  let fixture: ComponentFixture<StudentDashboardLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDashboardLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
