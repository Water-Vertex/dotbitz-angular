import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentResetPassword } from './student-reset-password';

describe('StudentResetPassword', () => {
  let component: StudentResetPassword;
  let fixture: ComponentFixture<StudentResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentResetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentResetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
