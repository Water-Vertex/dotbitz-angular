import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentClassScheduleList } from './schedule-list';

describe('StudentClassScheduleList', () => {
  let component: StudentClassScheduleList;
  let fixture: ComponentFixture<StudentClassScheduleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentClassScheduleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentClassScheduleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
