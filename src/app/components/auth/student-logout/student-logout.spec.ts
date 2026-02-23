import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLogout } from './student-logout';

describe('StudentLogout', () => {
  let component: StudentLogout;
  let fixture: ComponentFixture<StudentLogout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLogout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLogout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
