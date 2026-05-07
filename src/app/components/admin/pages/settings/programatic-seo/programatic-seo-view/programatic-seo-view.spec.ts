import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaticSeoView } from './programatic-seo-view';

describe('ProgramaticSeoView', () => {
  let component: ProgramaticSeoView;
  let fixture: ComponentFixture<ProgramaticSeoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaticSeoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaticSeoView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
