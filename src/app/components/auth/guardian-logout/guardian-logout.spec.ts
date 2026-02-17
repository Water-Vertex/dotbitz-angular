import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianLogout } from './guardian-logout';

describe('GuardianLogout', () => {
  let component: GuardianLogout;
  let fixture: ComponentFixture<GuardianLogout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianLogout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianLogout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
