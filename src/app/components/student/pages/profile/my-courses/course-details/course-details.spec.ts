import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCourseDetail } from './course-details';

describe('MyCourseDetail', () => {
  let component: MyCourseDetail;
  let fixture: ComponentFixture<MyCourseDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCourseDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCourseDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
