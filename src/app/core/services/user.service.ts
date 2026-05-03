import { CreateUserRequest } from './../models/users/create-user-request.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/users/user-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { map, Observable, of, shareReplay, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { BaseService } from '../bases/base/base-service';
import { UserAllDatasResponse } from '../models/users/user-all-datas-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  apiUrl = `${this.url}/users`;
  private user$?: Observable<UserAllDatasResponse>;

  create(user: CreateUserRequest): Observable<ResultEntity<UserResponse>> {
    return this.http.post<ResultEntity<UserResponse>>(this.apiUrl, user);
  }

  getUser(): Observable<UserAllDatasResponse> {

    if (!this.user$) {
      this.user$ = this.http
        .get<ResultEntity<UserAllDatasResponse>>(this.apiUrl)
        .pipe(
          map(res => {
            if (!res.isSuccess || !res.value) {
              throw new Error(res.message);
            }
            return res.value;
          }),
          shareReplay(1)
        );
    }

    return this.user$;
  }

  clearCache(): void {
    this.user$ = undefined;
  }
}
