import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoSettingsAdd } from './seo-settings-add';

describe('SeoSettingsAdd', () => {
  let component: SeoSettingsAdd;
  let fixture: ComponentFixture<SeoSettingsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoSettingsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoSettingsAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
