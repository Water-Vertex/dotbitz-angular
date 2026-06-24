import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentForgetPassword } from './student-forget-password';

describe('StudentForgetPassword', () => {
  let component: StudentForgetPassword;
  let fixture: ComponentFixture<StudentForgetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentForgetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentForgetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
