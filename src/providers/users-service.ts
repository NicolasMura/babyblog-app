import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';  // Because Angular Observable doesn't have a toPromise operator

import { User } from '../models/user';
import { AuthService } from '../providers/auth-service';

// use the 'environment-dev' as the default import(!)
// See https://github.com/driftyco/ionic-app-scripts/issues/760
import { ENV } from '../config/environment-dev';

let BABYBLOG_USERS_URL_API = ENV.API_URL_API + 'users';

@Injectable()
export class UsersService {
  isLoggedin: boolean;
  token;
  users: User[];
  loggedUser: User;

  constructor(
    public http: Http,
    private authservice: AuthService
  ) {
    console.log('Hello UsersService Provider');
    this.isLoggedin = this.authservice.isLoggedin;
    this.token = this.authservice.token;

    // Get all users
    this.getAllUsers()
      .subscribe(users => {
        console.log('Users :');
        console.log(users);
        this.users = users;
    });
  }

  // Load all babyblog users
  getAllUsers(): Observable<User[]> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Authorization', 'Bearer ' + this.token);
    return this.http
      .get(BABYBLOG_USERS_URL_API, {headers: headers})
      .map(res => <User[]>res.json());
  }
  // getAllUsers(): Promise<User[]> {
  //   var headers = new Headers();
  //   this.authservice.loadUserCredentials();
  //   headers.append('Authorization', 'Bearer ' + this.token);
  //   return this.http
  //     .get(BABYBLOG_USERS_URL_API, {headers: headers})
  //     .toPromise()
  //     .then(res => res.json().data as User[])
  //     .catch(this.handleError);
  // }

  // Get a user
  getUser(id: number): Observable<User> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Authorization', 'Bearer ' + this.token);
    return this.http
      .get(`${BABYBLOG_USERS_URL_API}/${id}/`, {headers: headers})
      .map(res => <User>res.json());
  }

  // Find a post key inside an arraw of posts, given his id
  getLoggedUser(username) {
    let userKey;
    this.users.forEach(function(value, key) {
      if (value.username == username) {
        userKey = key;
      }
    });
    this.loggedUser = this.users[userKey];
    console.log('User trouvé (' + this.loggedUser.username + ') ! Dispo @ this.profile :');
    console.log(this.loggedUser);
    return this.loggedUser;
  }

  update(user) {
    let body = JSON.stringify({ "name": user.name, "email": user.email });
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Authorization', 'Bearer ' + this.token);
    return this.http
      .put(`${BABYBLOG_USERS_URL_API}/${user.id}/`, body, {headers: headers})
      .map(res => res.json());
      // .catch(this.handleError);
  }

  // private handleError(error: any): Promise<any> {
  //   console.error('An error occurred', error);  // for demo purpose only
  //   return Promise.reject(error.message || error);
  // }

}
