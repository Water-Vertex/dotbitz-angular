import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleEdit } from './role-edit';

describe('RoleEdit', () => {
  let component: RoleEdit;
  let fixture: ComponentFixture<RoleEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
