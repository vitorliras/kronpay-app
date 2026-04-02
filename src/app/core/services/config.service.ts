import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Config } from '../models/config';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private settings!: Config;
  private http: HttpClient;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }
  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<Config>('assets/config/config.json')
    ).then((config) => {
      this.settings = config;
    });
  }

  get config(): Config {
    return this.settings;
  }
}
