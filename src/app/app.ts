import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  constructor() {}
}
