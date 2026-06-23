import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianEventList } from './event-list';

describe('GuardianEventList', () => {
  let component: GuardianEventList;
  let fixture: ComponentFixture<GuardianEventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianEventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianEventList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
