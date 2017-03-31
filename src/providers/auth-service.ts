import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AlertController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../models/user';
import { UsersService } from '../providers/users-service';

// use the 'environment-dev' as the default import(!)
// See https://github.com/driftyco/ionic-app-scripts/issues/760
import { ENV } from '../config/environment-dev';

@Injectable()
export class AuthService {
  babyblogUrlAuth = ENV.AUTH_URL;
  clientId = ENV.CLIENT_ID;
  grantTypePassword = ENV.GRANT_TYPE_PASSWORD;
  grantTypeRefresh = ENV.GRANT_TYPE_REFRESH;

  token: string = null;
  refreshToken: string = null;
  loggedUserUsername: string;
  isLoggedin: boolean = false;
  tokenStartDate: Date;
  users: User[];

  constructor(
    public http: Http,
    private alertCtrl: AlertController,
  ) {
    console.log('Hello AuthService Provider');
    this.http = http;
  }

  storeUserCredentials(username, isLoggedin, token, refreshToken, tokenStartDate) {
    window.localStorage.setItem('access_token', token);
    window.localStorage.setItem('refresh_token', refreshToken);
    window.localStorage.setItem('username', username);
    window.localStorage.setItem('is_loggedin', isLoggedin);
    window.localStorage.setItem('token_start_date', tokenStartDate);
    this.useCredentials(username, isLoggedin, token, refreshToken, tokenStartDate);
  }

  useCredentials(username, isLoggedin, token, refreshToken, tokenStartDate) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.isLoggedin = isLoggedin;
    this.loggedUserUsername = username;
    this.tokenStartDate = tokenStartDate;
  }

  loadUserCredentials() {
    var token = window.localStorage.getItem('access_token');
    var refreshToken = window.localStorage.getItem('refresh_token');
    var username = window.localStorage.getItem('username');
    var isLoggedin = window.localStorage.getItem('is_loggedin');
    var tokenStartDate = window.localStorage.getItem('token_start_date');
    this.useCredentials(username, isLoggedin, token, refreshToken, tokenStartDate);
  }

  destroyUserCredentials() {
    this.token = null;
    this.isLoggedin = false;
    this.loggedUserUsername = '';
    // Keep last connexion date and refresh token
    var tokenStartDateSave = this.tokenStartDate;
    var refreshTokenSave = this.refreshToken;
    window.localStorage.clear();
    window.localStorage.setItem('token_start_date', tokenStartDateSave.toString());
    window.localStorage.setItem('refresh_token', refreshTokenSave.toString());
  }

  authenticate(username, password) {
    var user = {
      'username': username,
      'password': password
    }
    var body = "client_id=" + this.clientId + "&grant_type=" + this.grantTypePassword + "&username=" + user.username + "&password=" + user.password;
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Accept','application/json');

    return new Promise(resolve => {
      this.http.post(`${this.babyblogUrlAuth}/token/`, body, {headers: headers})
        .subscribe(
          response => {
            // Store credentials
            console.log("Response authenticate :");
            console.log(response);
            var now = new Date();
            this.storeUserCredentials(user.username, true, response.json().access_token, response.json().refresh_token, now);

            resolve(true);
        },
        error => {
          if(error.status === 0) {
            console.log('ERREUR - CONNEXION REFUSED !');
            let prompt = this.alertCtrl.create({
              title: 'Erreur',
              message: "Oups... il semble que le serveur ne soit pas très en forme. Envoyez-nous un petit mail, nous le secouerons un peu.",
              buttons: [
                {
                  text: 'OK'
                }
              ]
            });
            prompt.present();
          } else {
            console.log('ERREUR - WRONG LOGIN / PASSWORD !');
            let prompt = this.alertCtrl.create({
              title: 'Erreur',
              message: "Oups... il semble que votre identifiant ou votre mot de passe soit incorrect.",
              buttons: [
                {
                  text: 'OK'
                }
              ]
            });
            prompt.present();
          }

          resolve(false);
        }
      );
    });
  }

  /* ------------------------------------------------------------
  Temp workaround for refreshing token
  Good practise would be to refresh only expired token
  Here, we check if token has expired time every a page is loaded
  ------------------------------------------------------------ */
  // Test to know if token has expired
  checkTokenValidity(whereami) {
    console.log('*** checkTokenValidity - ' + whereami + ' ***')
    var now = new Date();
    console.log("Now = " + now);
    var tokenStartDate = new Date(this.tokenStartDate);
    console.log("tokenStartDate = " + tokenStartDate);
    var delta = (now.getTime() - tokenStartDate.getTime())/1000;
    console.log("Delta in seconds (for info, token expire in 36000 seconds) :");
    console.log(delta);

    if (delta > 18000) {
      console.log("Token has expired --> get a new token");
      // console.log(this.refreshToken);
      this.getNewToken(this.refreshToken);
    }
  }

  getNewToken(refreshToken) {
    var body = "client_id=" + this.clientId + "&grant_type=" + this.grantTypeRefresh + "&refresh_token=" + refreshToken;
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Accept','application/json');

    return new Promise(resolve => {
      this.http.post(`${this.babyblogUrlAuth}/token/`, body, {headers: headers})
        .subscribe(
          response => {
            // Store credentials
            console.log("Response getNewToken :");
            console.log(response);
            var now = new Date();
            this.storeUserCredentials(this.loggedUserUsername, true, response.json().access_token, response.json().refresh_token, now);

            resolve(true);
        },
        error => {
          console.log("Error in getNewToken !");
          console.log(error);

          resolve(false);
        }
      );
    });
  }

  logout() {
    console.log('Logging out...');
    this.destroyUserCredentials();
  }

  // adduser(user) {
  //   var creds = "name=" + user.name + "&password=" + user.password;
  //   var headers = new Headers();
  //   headers.append('Content-Type', 'application/x-www-form-urlencoded');

  //   return new Promise(resolve => {
  //     this.http.post('http://localhost:3333/adduser', creds, {headers: headers}).subscribe(data => {
  //       if(data.json().success){
  //           resolve(true);
  //       }
  //       else
  //         resolve(false);
  //     });
  //   });
  // }

  // getinfo() {
  //   return new Promise(resolve => {
  //     var headers = new Headers();
  //     this.loadUserCredentials();
  //     console.log(this.token);
  //     headers.append('Authorization', 'Bearer ' +this.token);
  //     this.http.get('http://localhost:3333/getinfo', {headers: headers}).subscribe(data => {
  //       if(data.json().success)
  //         resolve(data.json());
  //       else
  //         resolve(false);
  //     });
  //   })
  // }


  // public login(credentials) {
  //   if (credentials.email === null || credentials.password === null) {
  //     return Observable.throw("Please insert credentials");
  //   } else {
  //     return Observable.create(observer => {
  //       // At this point make a request to your backend to make a real check!
  //       let access = (credentials.password === "pass" && credentials.email === "email");
  //       this.currentUser = new User('Simon', 'saimon@devdactic.com');
  //       observer.next(access);
  //       observer.complete();
  //     });
  //   }
  // }

  // public register(credentials) {
  //   if (credentials.email === null || credentials.password === null) {
  //     return Observable.throw("Please insert credentials");
  //   } else {
  //     // At this point store the credentials to your backend!
  //     return Observable.create(observer => {
  //       observer.next(true);
  //       observer.complete();
  //     });
  //   }
  // }

  // public getUserInfo() : User {
  //   return this.currentUser;
  // }

  // public logout() {
  //   return Observable.create(observer => {
  //     this.currentUser = null;
  //     observer.next(true);
  //     observer.complete();
  //   });
  // }
}
