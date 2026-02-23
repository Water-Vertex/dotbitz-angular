import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCoursesGuardian } from './my-courses-guardian';

describe('MyCoursesGuardian', () => {
  let component: MyCoursesGuardian;
  let fixture: ComponentFixture<MyCoursesGuardian>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCoursesGuardian]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCoursesGuardian);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
