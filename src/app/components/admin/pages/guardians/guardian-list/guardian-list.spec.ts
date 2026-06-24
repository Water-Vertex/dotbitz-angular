import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianList } from './guardian-list';

describe('GuardianList', () => {
  let component: GuardianList;
  let fixture: ComponentFixture<GuardianList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
