import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileShow } from './profile-show';

describe('ProfileShow', () => {
  let component: ProfileShow;
  let fixture: ComponentFixture<ProfileShow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileShow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileShow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
