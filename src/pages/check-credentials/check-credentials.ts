import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { AuthService }   from '../../providers/auth-service';
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-check-credentials',
  templateUrl: 'check-credentials.html'
})
export class CheckCredentialsPage {

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {
    // Disable menu
    this.menuCtrl.enable(false);
  }

  ionViewDidLoad() {
    console.log('Hello CheckCredentialsPage !');
  }

  ionViewWillEnter() {
    console.log('On va arriver sur CheckCredentialsPage !');
    this.authService.loadUserCredentials();
    var token = this.authService.token;
    var refreshToken = this.authService.refreshToken;
    var isLoggedin = this.authService.isLoggedin;
    var username = this.authService.loggedUserUsername;
    var tokenStartDate = this.authService.tokenStartDate;

    // Redirect if user already have credentials (à déplacer ?)
    if(!isLoggedin){
      console.log('*** User has NO credentials --> redirect to login page ***');
      this.navCtrl.setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
    }
    else {
      console.log('*** User HAS credentials --> check token + redirect to home page ***');
      // Check token validity, refresh if needed
      this.authService.checkTokenValidity('LoginPage');
      this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'forward'});
    }
  }

}
