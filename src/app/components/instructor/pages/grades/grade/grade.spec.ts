import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Grade } from './grade';

describe('Grade', () => {
  let component: Grade;
  let fixture: ComponentFixture<Grade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Grade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Grade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
