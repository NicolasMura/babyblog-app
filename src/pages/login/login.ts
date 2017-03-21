import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, MenuController } from 'ionic-angular';

import { AuthService }   from '../../providers/auth-service';
import { HomePage } from '../home/home';
import { User } from '../../models/user';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loading: Loading;

  user: {
    username: '',
    password: ''
  }

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private menuCtrl: MenuController
  ) {
    // Disable menu
    this.menuCtrl.enable(false);
  }

  ionViewDidLoad() {
    console.log('Hello LoginPage !');
  }

  onPageWillLeave() {
    // Enable menu
    this.menuCtrl.enable(true);
  }

  login(username, password) {
    username = (username === undefined) ? '' : username;
    this.authService.authenticate(username.trim(), password)
      .then(success => {
        if(success) {
          console.log('Login Success !');
          this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'forward'});
        }
      });
  }

  // signup() {
  //   this.navCtrl.push(Signup);
  // }

  // public login() {
  //   this.showLoading()
  //   this.auth.login(this.registerCredentials).subscribe(allowed => {
  //     if (allowed) {
  //       setTimeout(() => {
  //       this.loading.dismiss();
  //       this.nav.setRoot(HomePage)
  //       });
  //     } else {
  //       this.showError("Access Denied");
  //     }
  //   },
  //   error => {
  //     this.showError(error);
  //   });
  // }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Connexion en cours...'
    });
    this.loading.present();
  }

  showError(text) {
    setTimeout(() => {
      this.loading.dismiss();
    });

    let alert = this.alertCtrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
}
