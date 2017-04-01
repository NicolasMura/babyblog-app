import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppModule } from './app.module';

// use the 'environment-dev' as the default import(!)
// See https://github.com/driftyco/ionic-app-scripts/issues/760
import { ENV } from '../config/environment-dev';

if (ENV.PRODUCTION) {
  enableProdMode();
  console.log('Production mode activated');
}

platformBrowserDynamic().bootstrapModule(AppModule);
