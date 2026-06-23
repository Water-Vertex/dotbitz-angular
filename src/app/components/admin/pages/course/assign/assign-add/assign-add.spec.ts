import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAdd } from './assign-add';

describe('AssignAdd', () => {
  let component: AssignAdd;
  let fixture: ComponentFixture<AssignAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
