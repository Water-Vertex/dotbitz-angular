import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreRegistration } from './pre-registration';

describe('PreRegistration', () => {
  let component: PreRegistration;
  let fixture: ComponentFixture<PreRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
