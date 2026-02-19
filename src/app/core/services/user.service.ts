import { CreateUserRequest } from './../models/users/create-user-request.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/users/user-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  create(user: CreateUserRequest): Observable<ResultEntity<UserResponse>> {
    return this.http.post<ResultEntity<UserResponse>>(`${this.apiUrl}/users`, user);
  }
}
