import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogEdit } from './blog-edit';

describe('BlogEdit', () => {
  let component: BlogEdit;
  let fixture: ComponentFixture<BlogEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
