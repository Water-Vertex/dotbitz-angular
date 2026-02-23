import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianCheckout } from './guardian-checkout';

describe('GuardianCheckout', () => {
  let component: GuardianCheckout;
  let fixture: ComponentFixture<GuardianCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianCheckout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
