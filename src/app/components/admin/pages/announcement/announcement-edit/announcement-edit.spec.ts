import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementEdit } from './announcement-edit';

describe('AnnouncementEdit', () => {
  let component: AnnouncementEdit;
  let fixture: ComponentFixture<AnnouncementEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
