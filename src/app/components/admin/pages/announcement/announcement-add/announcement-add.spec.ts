import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementAdd } from './announcement-add';

describe('AnnouncementAdd', () => {
  let component: AnnouncementAdd;
  let fixture: ComponentFixture<AnnouncementAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
