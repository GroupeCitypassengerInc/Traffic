import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDeviceComponent } from './selected-device.component';

describe('SelectedDeviceComponent', () => {
  let component: SelectedDeviceComponent;
  let fixture: ComponentFixture<SelectedDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
