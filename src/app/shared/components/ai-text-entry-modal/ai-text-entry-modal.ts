import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Base } from '../../../core/bases/base/base';
import { ResultEntity } from '../../../core/models/result-entity.model';

export interface AiTextEntryModalData {
  titleKey: string;
  hintKey: string;
  placeholderKey: string;
  parse: (text: string) => Observable<ResultEntity<unknown>>;
}

@Component({
  selector: 'app-ai-text-entry-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DragDropModule,
  ],
  templateUrl: './ai-text-entry-modal.html',
  styleUrls: ['./ai-text-entry-modal.scss', '../../../../styles/modal-register.scss'],
})
export class AiTextEntryModal extends Base {
  readonly maxLength = 4000;
  readonly data = inject<AiTextEntryModalData>(MAT_DIALOG_DATA);

  text = '';
  isLoading = false;

  private dialogRef = inject(MatDialogRef<AiTextEntryModal, unknown>);
  private toastr = inject(ToastrService);

  interpret() {
    const text = this.text.trim();

    if (!text || this.isLoading) return;

    this.isLoading = true;

    this.data.parse(text).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.isSuccess && res.value) {
          this.dialogRef.close(res.value);
          return;
        }

        this.toastr.warning(res.message);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
