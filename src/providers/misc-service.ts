import { Injectable } from '@angular/core';

@Injectable()
export class MiscService {

  constructor() {}

  // Find an object (eg. user, post, etc.) key inside an arraw of objects (of users, posts, etc.), given his id
  findObjectKey(objectId, objectList) {
    var objectKey = null;
    objectList.forEach(function(value, key) {
      if (value.id == objectId) {
        objectKey = key;
      }
    });
    return objectKey;
  }

  // Return a human readable date from a JSON datetime
  getHumanDate(jsonDate){
    var monthNames = [
      "janvier", "février", "mars",
      "avril", "mai", "juin", "juillet",
      "août", "setpembre", "octobre",
      "novembre", "décembre"
    ];

    var datetime = new Date(jsonDate);

    var day = datetime.getDate();
    var monthIndex = datetime.getMonth();
    var year = datetime.getFullYear();
    var humanDate = day + ' ' + monthNames[monthIndex] + ' ' + year;

    return humanDate;
  };

  // Return a human readable time from a JSON datetime
  getHumanTime(jsonDate){
    var datetime = new Date(jsonDate);

    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    if(minutes < 10) {
      var minutesStr = '0' + minutes;
    } else {
      var minutesStr = '' + minutes;
    }
    var humanTime = hours + 'h' + minutesStr;

    return humanTime;
  };
}
