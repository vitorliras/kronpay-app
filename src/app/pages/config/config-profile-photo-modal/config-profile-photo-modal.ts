import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { Base } from '../../../core/bases/base/base';

const MAX_MODAL_SIZE = 800;
const MIN_MODAL_SIZE = 280;
const DEFAULT_MODAL_WIDTH = 420;
const DEFAULT_MODAL_HEIGHT = 320;

@Component({
  selector: 'app-config-profile-photo-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ImageCropperComponent],
  templateUrl: './config-profile-photo-modal.html',
  styleUrls: ['./config-profile-photo-modal.scss', '../../../../styles/modal-register.scss'],
})
export class ConfigProfilePhotoModal extends Base {
  private static readonly MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  private dialogRef = inject(MatDialogRef<ConfigProfilePhotoModal>);

  imageChangedEvent: Event | null = null;
  private croppedBlob: Blob | null = null;

  modalWidth = DEFAULT_MODAL_WIDTH;
  cropperHeight = DEFAULT_MODAL_HEIGHT;

  constructor() {
    super();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!ConfigProfilePhotoModal.ALLOWED_TYPES.includes(file.type)) {
      this.messageWarning('InvalidImageFormat');
      input.value = '';
      return;
    }

    if (file.size > ConfigProfilePhotoModal.MAX_UPLOAD_SIZE_BYTES) {
      this.messageWarning('ImageTooLarge');
      input.value = '';
      return;
    }

    this.croppedBlob = null;
    this.modalWidth = DEFAULT_MODAL_WIDTH;
    this.cropperHeight = DEFAULT_MODAL_HEIGHT;
    this.imageChangedEvent = event;
  }

  onImageLoaded(image: LoadedImage): void {
    this.modalWidth = this.clampSize(image.original.size.width);
    this.cropperHeight = this.clampSize(image.original.size.height);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedBlob = event.blob ?? null;
  }

  private clampSize(value: number): number {
    return Math.min(Math.max(value, MIN_MODAL_SIZE), MAX_MODAL_SIZE);
  }

  confirm(): void {
    if (!this.croppedBlob) return;

    const file = new File([this.croppedBlob], 'profile-photo.jpg', { type: 'image/jpeg' });
    this.dialogRef.close(file);
  }

  close(): void {
    this.dialogRef.close();
  }
}
