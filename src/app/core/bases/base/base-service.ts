import { inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

export abstract class BaseService {
  protected configService = inject(ConfigService);
  private httpClient = inject(HttpClient);
  private toastrBase = inject(ToastrService);

  protected get url(): string {
    return this.configService.config.apiUrl;
  }

  protected get headers(): Record<string, string> {
    return this.configService.config.headers;
  }

  protected get http() {
    return this.httpClient;
  }

  protected messageWarning(msg: string) {
    this.toastrBase.warning(msg);
  }
}
