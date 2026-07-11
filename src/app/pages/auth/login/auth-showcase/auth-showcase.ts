import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Base } from '../../../../core/bases/base/base';

@Component({
  selector: 'app-auth-showcase',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './auth-showcase.html',
  styleUrl: './auth-showcase.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShowcase extends Base {}
