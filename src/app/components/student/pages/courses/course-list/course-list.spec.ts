import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCourseList } from './course-list';

describe('StudentCourseList', () => {
  let component: StudentCourseList;
  let fixture: ComponentFixture<StudentCourseList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCourseList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCourseList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
