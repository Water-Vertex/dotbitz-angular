import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McqEdit } from './mcq-edit';

describe('McqEdit', () => {
  let component: McqEdit;
  let fixture: ComponentFixture<McqEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McqEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McqEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
