import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { StatusBar, Splashscreen } from 'ionic-native';

import { CheckCredentialsPage } from '../pages/check-credentials/check-credentials';
import { HomePage } from '../pages/home/home';
import { NewPostPage } from '../pages/new-post/new-post';
import { ProfilePage } from '../pages/profile/profile';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make CheckCredentialsPage the root (or first) page
  rootPage: any = CheckCredentialsPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Babyblog - The Wall', component: HomePage },
      { title: 'Je participe !', component: NewPostPage },
      { title: 'Mon beau profil', component: ProfilePage },
    ];
    this.pages[0]['icon'] = 'home';
    this.pages[1]['icon'] = 'chatbubbles';
    this.pages[2]['icon'] = 'person';
  }

  ionViewDidLoad() {
    console.log('Hello Home !');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
