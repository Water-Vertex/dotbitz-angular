import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBills } from './my-bills';

describe('MyBills', () => {
  let component: MyBills;
  let fixture: ComponentFixture<MyBills>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBills]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBills);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
