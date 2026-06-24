import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSchedule } from './class-schedule';

describe('ClassSchedule', () => {
  let component: ClassSchedule;
  let fixture: ComponentFixture<ClassSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassSchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
