import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private apiUrl = environment.apiUrl;

  private translationsSubject =
    new BehaviorSubject<Record<string, string>>({});

  translations$ = this.translationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  load(lang: 'pt-BR' | 'en-US') {
    localStorage.setItem('lang', lang);

    return this.http
      .get<Record<string, string>>(`${this.apiUrl}/api/resources/getAll`)
      .subscribe(res => {
        this.translationsSubject.next(res);
      });
  }

  get(key: string, dict: Record<string, string>): string {
    return dict[key] ?? key;
  }

  getByKey(key: string): Observable<string> {
    const params = new HttpParams().set('key', key);

    return this.http
      .get<Record<string, string>>(`${this.apiUrl}/api/resources/GetByName`, { params })
      .pipe(
        map(result => result[key] ?? key)
      );
  }
}

