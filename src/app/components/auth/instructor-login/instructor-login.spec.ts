import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorLogin } from './instructor-login';

describe('InstructorLogin', () => {
  let component: InstructorLogin;
  let fixture: ComponentFixture<InstructorLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
