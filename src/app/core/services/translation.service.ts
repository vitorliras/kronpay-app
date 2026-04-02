import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfigService } from './config.service';
import { BaseService } from '../bases/base/base-service';

@Injectable({ providedIn: 'root' })
export class TranslationService extends BaseService {

  private translationsSubject = new BehaviorSubject<Record<string, string>>({});

  translations$ = this.translationsSubject.asObservable();

  load(lang: 'pt-BR' | 'en-US') {
    localStorage.setItem('lang', lang);
    var connection = localStorage.getItem('connection');

    if (!connection) {
      this.http
        .get<Record<string, string>>(`${this.url}/api/resources/getAll`)
        .pipe(
          tap((res) => {
            localStorage.setItem('connection', '');
            this.translationsSubject.next(res);
          }),

          catchError(() => {
            localStorage.setItem('connection', 'false');
            return of({});
          }),
        )
        .subscribe();
    }
  }
  get(key: string, dict: Record<string, string>): string {
    return dict[key] ?? key;
  }

  getByKey(key: string): Observable<string> {
    const params = new HttpParams().set('key', key);

    return this.http
      .get<Record<string, string>>(`${this.url}/api/resources/GetByName`, { params })
      .pipe(map((result) => result[key] ?? key));
  }
}
