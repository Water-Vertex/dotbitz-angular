import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEventList } from './event-list';

describe('StudentEventList', () => {
  let component: StudentEventList;
  let fixture: ComponentFixture<StudentEventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentEventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEventList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
