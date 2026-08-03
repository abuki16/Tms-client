import { Component, viewChild, effect, inject } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { EnrollmentStore } from '../../store/enrollment.store';
import { Enrollment } from '../../models/enrollment.model';

@Component({
  selector: 'tms-enrollment-list',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.scss'
})
export class EnrollmentListComponent {
  store = inject(EnrollmentStore);
  displayedColumns = ['studentName', 'courseName', 'status', 'actions'];

  // MatTableDataSource bridges our store data into Material's rendering pipeline
  dataSource = new MatTableDataSource<Enrollment>();

  // viewChild.required() is the modern signal-based replacement for @ViewChild.
  // These are signals that update reactively when Angular resolves template queries.
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  constructor() {
    // Effect 1: Push store entities into the Material data source whenever they change.
    // Every time the store updates, this effect fires and the table re-renders.
    effect(() => {
      this.dataSource.data = this.store.entities();
    });

    // Effect 2: Wire paginator and sort controls reactively once queries are available.
    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });

    // Load enrollments on component creation
    this.store.loadEnrollments();
  }
}