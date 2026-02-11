import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCurriculumList } from './course-curriculum-list';

describe('CourseCurriculumList', () => {
  let component: CourseCurriculumList;
  let fixture: ComponentFixture<CourseCurriculumList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCurriculumList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCurriculumList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
