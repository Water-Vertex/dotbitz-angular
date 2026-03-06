import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCourseStudent } from './view-course-student';

describe('ViewCourseStudent', () => {
  let component: ViewCourseStudent;
  let fixture: ComponentFixture<ViewCourseStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCourseStudent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCourseStudent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
