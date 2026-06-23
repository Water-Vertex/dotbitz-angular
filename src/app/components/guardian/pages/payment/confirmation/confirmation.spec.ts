import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianConfirmation } from './confirmation';

describe('GuardianConfirmation', () => {
  let component: GuardianConfirmation;
  let fixture: ComponentFixture<GuardianConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
