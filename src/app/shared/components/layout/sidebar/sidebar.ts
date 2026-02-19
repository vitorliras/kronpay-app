import { Component, Input } from '@angular/core';
import { Base } from '../../../../core/bases/base/base';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})

export class Sidebar extends Base {
  isCollapsed = false;

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }
}

