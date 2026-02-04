import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAdd } from './policy-add';

describe('PolicyAdd', () => {
  let component: PolicyAdd;
  let fixture: ComponentFixture<PolicyAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
