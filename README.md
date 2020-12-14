# Bagage

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

## Project install

#### Install in Dev
Clone the [project](https://github.com/GhioRodolphe/bagage.git).

Run `npm install` in the project folder.

Change Prometheus's address in `/src/app/graph/graph.component.ts:50` and `/src/app/devices-table/devices-table.compponent.ts:65`.

Run `ng serve --base-href '/baggage/'` for development mode. If you would like to change the base href you can modify it in `/src/index.html:6`.
See [ng serve options](https://angular.io/cli/serve).

#### Install in production
 ```bash
 npm install --production 
 ```
 
## Development server

Run `ng serve --base-href '/bagage/'` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
