import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorEventList } from './event-list';

describe('InstructorEventList', () => {
  let component: InstructorEventList;
  let fixture: ComponentFixture<InstructorEventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorEventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorEventList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
