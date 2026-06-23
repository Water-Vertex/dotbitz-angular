import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorForgotPassword } from './instructor-forgot-password';

describe('InstructorForgotPassword', () => {
  let component: InstructorForgotPassword;
  let fixture: ComponentFixture<InstructorForgotPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorForgotPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorForgotPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
