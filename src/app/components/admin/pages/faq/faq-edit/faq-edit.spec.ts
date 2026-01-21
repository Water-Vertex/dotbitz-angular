import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqEdit } from './faq-edit';

describe('FaqEdit', () => {
  let component: FaqEdit;
  let fixture: ComponentFixture<FaqEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
