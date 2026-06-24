import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponAdd } from './coupon-add';

describe('CouponAdd', () => {
  let component: CouponAdd;
  let fixture: ComponentFixture<CouponAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
