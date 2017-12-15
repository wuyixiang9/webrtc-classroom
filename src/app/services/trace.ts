import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

const debug = require('debug')('trace');

@Injectable()
export default class TraceService {
  trace(...args) {
    console.log('[trace] ', ...args)
  }
}