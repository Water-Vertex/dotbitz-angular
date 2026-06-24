import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaticSeoAdd } from './programatic-seo-add';

describe('ProgramaticSeoAdd', () => {
  let component: ProgramaticSeoAdd;
  let fixture: ComponentFixture<ProgramaticSeoAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaticSeoAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaticSeoAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
