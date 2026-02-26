import { inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';

export abstract class BaseComponentes {
  protected translationService = inject(TranslationService);
  private toastrBase = inject(ToastrService);

  currentLang: 'pt-BR' | 'en-US' =
    (localStorage.getItem('lang') as 'pt-BR' | 'en-US') ?? 'pt-BR';

  translations$ = this.translationService.translations$;

  constructor() {
    this.translationService.load(this.currentLang);
  }

  changeLang(lang: 'pt-BR' | 'en-US') {
    if (this.currentLang === lang) return;

    this.currentLang = lang;
    this.translationService.load(lang);
    localStorage.setItem('lang', lang);
  }

  messageSucess(code: string){
     this.translations$
    .pipe(take(1))
    .subscribe(t => {
      this.toastrBase.success(t[code]);
    });
  }

   messageWarning(code: string){
     this.translations$
    .pipe(take(1))
    .subscribe(t => {
      this.toastrBase.warning(t[code]);
    });
  }

   messageError(code: string){
     this.translations$
    .pipe(take(1))
    .subscribe(t => {
      this.toastrBase.error(t[code]);
    });
  }

   messageInfo(code: string){
     this.translations$
    .pipe(take(1))
    .subscribe(t => {
      this.toastrBase.info(t[code]);
    });
  }


}
