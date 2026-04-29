import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAdd } from './settings-add';

describe('SettingsAdd', () => {
  let component: SettingsAdd;
  let fixture: ComponentFixture<SettingsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
