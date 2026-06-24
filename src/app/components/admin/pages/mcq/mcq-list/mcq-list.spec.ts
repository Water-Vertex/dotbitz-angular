import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McqList } from './mcq-list';

describe('McqList', () => {
  let component: McqList;
  let fixture: ComponentFixture<McqList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McqList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McqList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
