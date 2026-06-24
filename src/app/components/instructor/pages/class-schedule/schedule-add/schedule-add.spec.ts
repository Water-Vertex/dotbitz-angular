import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAdd } from './schedule-add';

describe('ScheduleAdd', () => {
  let component: ScheduleAdd;
  let fixture: ComponentFixture<ScheduleAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
