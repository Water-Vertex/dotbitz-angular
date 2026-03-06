import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCheckout } from './student-checkout';

describe('StudentCheckout', () => {
  let component: StudentCheckout;
  let fixture: ComponentFixture<StudentCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCheckout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
