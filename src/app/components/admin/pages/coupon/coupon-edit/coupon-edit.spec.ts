import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponEdit } from './coupon-edit';

describe('CouponEdit', () => {
  let component: CouponEdit;
  let fixture: ComponentFixture<CouponEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
