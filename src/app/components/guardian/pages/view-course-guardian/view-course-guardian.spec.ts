import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCourseGuardian } from './view-course-guardian';

describe('ViewCourseGuardian', () => {
  let component: ViewCourseGuardian;
  let fixture: ComponentFixture<ViewCourseGuardian>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCourseGuardian]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCourseGuardian);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
