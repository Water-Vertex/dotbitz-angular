import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAdd } from './role-add';

describe('RoleAdd', () => {
  let component: RoleAdd;
  let fixture: ComponentFixture<RoleAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
