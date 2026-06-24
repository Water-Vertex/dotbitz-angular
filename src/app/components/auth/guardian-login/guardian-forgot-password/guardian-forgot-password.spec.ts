import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianForgotPassword } from './guardian-forgot-password';

describe('GuardianForgotPassword', () => {
  let component: GuardianForgotPassword;
  let fixture: ComponentFixture<GuardianForgotPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianForgotPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianForgotPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
