import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaticSeoList } from './programatic-seo-list';

describe('ProgramaticSeoList', () => {
  let component: ProgramaticSeoList;
  let fixture: ComponentFixture<ProgramaticSeoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaticSeoList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaticSeoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
