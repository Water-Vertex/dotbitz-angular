import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorResetPassword } from './instructor-reset-password';

describe('InstructorResetPassword', () => {
  let component: InstructorResetPassword;
  let fixture: ComponentFixture<InstructorResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorResetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorResetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
