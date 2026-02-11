import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCurriculumAdd } from './course-curriculum-add';

describe('CourseCurriculumAdd', () => {
  let component: CourseCurriculumAdd;
  let fixture: ComponentFixture<CourseCurriculumAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCurriculumAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCurriculumAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
