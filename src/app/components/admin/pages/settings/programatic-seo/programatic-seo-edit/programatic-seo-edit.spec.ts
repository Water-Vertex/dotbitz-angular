import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaticSeoEdit } from './programatic-seo-edit';

describe('ProgramaticSeoEdit', () => {
  let component: ProgramaticSeoEdit;
  let fixture: ComponentFixture<ProgramaticSeoEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaticSeoEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaticSeoEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
