import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianScheduleList } from './schedule-list';

describe('ScheduleList', () => {
  let component: GuardianScheduleList;
  let fixture: ComponentFixture<GuardianScheduleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianScheduleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianScheduleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
