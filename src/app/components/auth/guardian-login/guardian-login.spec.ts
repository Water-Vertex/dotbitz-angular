import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianLogin } from './guardian-login';

describe('GuardianLogin', () => {
  let component: GuardianLogin;
  let fixture: ComponentFixture<GuardianLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
