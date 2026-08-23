import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, of } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { AvatarCircular } from '../../../shared/components/avatar-circular/avatar-circular';
import { ConfigProfilePhotoModal } from '../../config/config-profile-photo-modal/config-profile-photo-modal';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreferenceResponse } from '../../../core/models/notifications/notification-preference-response.model';
import { GamificationService } from '../../../core/services/gamification/gamification.service';

@Component({
  selector: 'app-profile-user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule, AvatarCircular],
  templateUrl: './profile-user.html',
  styleUrls: ['./profile-user.scss', '../../../../styles/main.scss'],
})
export class ProfileUser extends Base implements OnInit {
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);
  private gamificationService = inject(GamificationService);

  user$ = this.userService.getUser();

  rankTier$: Observable<string | null> = this.gamificationService.getRank().pipe(
    map((res) => (res.isSuccess && res.value ? res.value.tier : null)),
    catchError(() => of(null)),
  );

  notificationPreferences: NotificationPreferenceResponse = {
    emailOnCritical: true,
    emailOnImportant: true,
    emailOnInformative: false,
  };

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getNotificationPreferences();
  }

  getNotificationPreferences(): void {
    this.notificationService.getPreferences().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.notificationPreferences = { ...res.value };
      }
      this.cdr.detectChanges();
    });
  }

  saveNotificationPreferences(): void {
    this.notificationService.updatePreferences(this.notificationPreferences).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
        } else {
          this.toastr.warning(res.message);
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message);
      },
    });
  }

  openChangePhotoModal() {
    const dialogRef = this.dialog.open(ConfigProfilePhotoModal);

    dialogRef.afterClosed().subscribe((file?: File) => {
      if (!file) return;

      this.userService.uploadPhoto(file).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message ?? 'Ocorreu um erro. Tente novamente.');
        },
      });
    });
  }

  removePhoto() {
    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe((result) => {
      if (!result) return;

      this.userService.removePhoto().subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message ?? 'Ocorreu um erro. Tente novamente.');
        },
      });
    });
  }
}
