import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignList } from './assign-list';

describe('AssignList', () => {
  let component: AssignList;
  let fixture: ComponentFixture<AssignList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
