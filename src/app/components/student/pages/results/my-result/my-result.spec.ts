import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyResult } from './my-result';

describe('MyResult', () => {
  let component: MyResult;
  let fixture: ComponentFixture<MyResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
