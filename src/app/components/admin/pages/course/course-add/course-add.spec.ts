import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAdd } from './course-add';

describe('CourseAdd', () => {
  let component: CourseAdd;
  let fixture: ComponentFixture<CourseAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
