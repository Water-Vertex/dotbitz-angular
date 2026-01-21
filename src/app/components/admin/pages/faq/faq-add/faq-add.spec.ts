import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqAdd } from './faq-add';

describe('FaqAdd', () => {
  let component: FaqAdd;
  let fixture: ComponentFixture<FaqAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
