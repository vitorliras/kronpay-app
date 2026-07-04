import { CreateUserRequest } from './../models/users/create-user-request.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models/users/user-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { BaseService } from '../bases/base/base-service';
import { UserAllDatasResponse } from '../models/users/user-all-datas-response.model';
import { ProfilePhotoResponse } from '../models/users/profile-photo-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  apiUrl = `${this.url}/users`;
  private refresh$ = new BehaviorSubject<void>(undefined);

  readonly user$: Observable<UserAllDatasResponse> = this.refresh$.pipe(
    switchMap(() => this.http.get<ResultEntity<UserAllDatasResponse>>(this.apiUrl)),
    map((res) => {
      if (!res.isSuccess || !res.value) {
        throw new Error(res.message);
      }
      return res.value;
    }),
    shareReplay(1),
  );

  create(user: CreateUserRequest): Observable<ResultEntity<UserResponse>> {
    return this.http.post<ResultEntity<UserResponse>>(this.apiUrl, user);
  }

  getUser(): Observable<UserAllDatasResponse> {
    return this.user$;
  }

  uploadPhoto(file: File): Observable<ResultEntity<ProfilePhotoResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ResultEntity<ProfilePhotoResponse>>(`${this.apiUrl}/uploadPhoto`, formData).pipe(
      tap((res) => {
        if (res.isSuccess) this.clearCache();
      }),
    );
  }

  removePhoto(): Observable<ResultEntity<ProfilePhotoResponse>> {
    return this.http.delete<ResultEntity<ProfilePhotoResponse>>(`${this.apiUrl}/removePhoto`).pipe(
      tap((res) => {
        if (res.isSuccess) this.clearCache();
      }),
    );
  }

  getPhotoBlob(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/photo`, { responseType: 'blob' });
  }

  clearCache(): void {
    this.refresh$.next();
  }
}
