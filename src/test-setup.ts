
import { getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { beforeEach } from 'vitest';

// Initialize the Angular testing environment for Vitest
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Standalone components using RouterLink need the router's route context even
// when a test only verifies that the component can be created.
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideRouter([])],
  });
});
