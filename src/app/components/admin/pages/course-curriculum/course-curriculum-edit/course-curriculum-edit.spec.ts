import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCurriculumEdit } from './course-curriculum-edit';

describe('CourseCurriculumEdit', () => {
  let component: CourseCurriculumEdit;
  let fixture: ComponentFixture<CourseCurriculumEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCurriculumEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCurriculumEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
