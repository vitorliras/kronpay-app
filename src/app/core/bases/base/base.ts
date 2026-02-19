import { inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

export abstract class Base {
  protected translationService = inject(TranslationService);

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
}
