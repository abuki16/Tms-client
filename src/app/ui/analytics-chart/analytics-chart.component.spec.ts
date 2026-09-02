import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsChartComponent } from './analytics-chart.component';

describe('AnalyticsChartComponent', () => {
  let component: AnalyticsChartComponent;
  let fixture: ComponentFixture<AnalyticsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsChartComponent);
    fixture.componentRef.setInput('data', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
