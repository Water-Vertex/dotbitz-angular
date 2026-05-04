import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoSetting } from './seo-setting';

describe('SeoSetting', () => {
  let component: SeoSetting;
  let fixture: ComponentFixture<SeoSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoSetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
