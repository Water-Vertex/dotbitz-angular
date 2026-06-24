import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAdd } from './blog-add';

describe('BlogAdd', () => {
  let component: BlogAdd;
  let fixture: ComponentFixture<BlogAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
