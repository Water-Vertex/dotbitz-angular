import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCourseDetail } from './course-detail';

describe('StudentCourseDetail', () => {
  let component: StudentCourseDetail;
  let fixture: ComponentFixture<StudentCourseDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCourseDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCourseDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
