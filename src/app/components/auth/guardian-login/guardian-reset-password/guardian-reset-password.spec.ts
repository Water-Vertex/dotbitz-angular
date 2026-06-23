import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianResetPassword } from './guardian-reset-password';

describe('GuardianResetPassword', () => {
  let component: GuardianResetPassword;
  let fixture: ComponentFixture<GuardianResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianResetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianResetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
