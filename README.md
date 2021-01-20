# Baggage

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

## Project install

#### Install in Dev
Clone the [project](https://github.com/GhioRodolphe/baggage.git).

Run `npm install` in the project folder.

You can change many settings about `ng serve` and `ng build` in `angular.json` file.

You can change environnement variable in `src\environments\environment.prod.ts` for production environnement variable or `src\environments\environment.ts` for dev environnement variable.

#### Run serve in dev mode
Run `npm run start:fr` for development mode. If you would like to change the base href you can modify it in `/src/index.html:6`.

Navigate to `http://app.citypassenger.com:4200/baggage/<fr|en>`. The app will automatically reload if you change any of the source files.

#### Install in production
 ```bash
 npm install --production 
 ```

#### Run serve in production mode
Run `ng serve --host app.citypassenger.com --port 4200` for development mode. If you would like to change the base href you can modify it in `/src/index.html:6`.
See [ng serve options](https://angular.io/cli/serve).
Navigate to `http://app.citypassenger.com:4200/baggage/`. The app will automatically reload if you change any of the source files.

## Production build
Run `ng build --prod --localize` for a dev server. 

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
