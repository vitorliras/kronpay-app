import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { OnlyNumbersDirective } from '../../shared/directives/only-numbers.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { Base } from '../../core/bases/base/base';
import { MatSelectModule } from '@angular/material/select';
import { BankService } from '../../core/services/bank.service';
import { Bank } from '../../core/models/bank/bank';
import { CreditCardService } from '../../core/services/credit-card.service';
import {
  CreateCreditCardRequest,
  CreditCardResponse,
  UpdateCreditCardRequest,
} from '../../core/models/credit-card/credit-card';

@Component({
  selector: 'app-credit-card',
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    OnlyNumbersDirective,
    MatTooltip,
    MatProgressSpinnerModule,
    MatSortModule,
  ],
  templateUrl: './credit-card.html',
  styleUrls: ['./credit-card.scss', '../../../styles/main.scss'],
})
export class CreditCardComponent extends Base implements OnInit {
  banks: Bank[] = [];

  isLoading = false;

  selectedBank: Bank | null = null;

  cardName = '';
  closingDay = 6;
  limit = 0;
  dueDay = 0;
  mustEdit = false;

  searchBank = '';

  filteredBanks: Bank[] = [];
  cards: CreditCardResponse[] = [];
  card!: CreditCardResponse;

  private bankService = inject(BankService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private creditCardService = inject(CreditCardService);

  cardColumns = ['description', 'bank', 'closingDay', 'dueDay', 'limit', 'actions'];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getBanks();
    this.getCards();
  }

  getBanks() {
    this.isLoading = true;

    this.bankService.getAll().subscribe(
      (res) => {
        if (res.isSuccess) {
          this.banks = res.value ?? [];
          this.isLoading = false;
          this.filteredBanks = [...this.banks];
          this.cdr.detectChanges();
        }
      },
      (error) => {
        this.isLoading = false;
        console.error(error);
      },
    );
  }

  getCards() {
    this.isLoading = true;

    this.creditCardService.getAll().subscribe(
      (res) => {
        if (res.isSuccess) {
          this.cards = res.value ?? [];
          this.isLoading = false;
          console.log(this.cards);
          this.cdr.detectChanges();
        }
      },
      (error) => {
        this.isLoading = false;
        console.error(error);
      },
    );
  }

  nameBank(id: number): string {
    let name = this.banks.filter((x) => x.id == id)[0].name;
    return name;
  }

  clearSearch() {
    this.searchBank = '';
    this.filterBanks();
  }

  filterBanks(): void {
    const term = this.searchBank.toLowerCase().trim();
    this.filteredBanks = this.banks.filter((bank) => bank.name.toLowerCase().includes(term));
  }

  onBankChange() {
    this.calculateDueDate();
  }

  getBankColor(bank: Bank): string {
    if (!bank?.primaryColor) return '#495d88';

    return bank.primaryColor.startsWith('#') ? bank.primaryColor : `#${bank.primaryColor}`;
  }

  lightenColor(id: number, percent: number = 70): string {
    let color = this.banks.filter((x) => x.id == id)[0].primaryColor;
    if (!color) color = '#ccc';
    const num = parseInt(color.replace('#', ''), 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));

    return `rgb(${r}, ${g}, ${b})`;
  }

  calculateDueDate() {
    const base = Number(this.closingDay || 0);

    this.dueDay = base + 6;

    if (this.dueDay > 31) {
      this.dueDay = this.dueDay - 31;
    }
  }

  save() {
    if (!this.selectedBank) {
      this.toastr.warning('Selecione um banco');
      return;
    }

    if (!this.cardName) {
      this.toastr.warning('Nome do cartão é obrigatório');
      return;
    }

    if (!this.limit || this.limit <= 0) {
      this.toastr.warning('Limite do cartão é obrigatório');
      return;
    }

    if (!this.dueDay || this.dueDay <= 0) {
      this.toastr.warning('Vencimento do cartão é obrigatório');
      return;
    }

    if (!this.closingDay || this.closingDay <= 0) {
      this.toastr.warning('Dia do fechamento do cartão é obrigatório');
      return;
    }

    if (this.dueDay > 31 || this.closingDay > 31) {
      this.toastr.warning('Os dias citados não podem ser maiores que 31');
      return;
    }
    this.isLoading = true;

    if (this.mustEdit) {
      const payload: UpdateCreditCardRequest = {
        id: this.card.id,
        bankId: this.selectedBank.id,
        description: this.cardName,
        closingDay: this.closingDay,
        dueDay: this.dueDay,
        creditLimit: this.limit,
      };

      this.creditCardService.update(payload).subscribe(
        (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getCards();
          }
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error(error);
        },
      );
    } else {
      const payload: CreateCreditCardRequest = {
        bankId: this.selectedBank.id,
        description: this.cardName,
        closingDay: this.closingDay,
        dueDay: this.dueDay,
        creditLimit: this.limit,
      };

      this.creditCardService.create(payload).subscribe(
        (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getCards();
          }
        },
        (error) => {
          this.isLoading = false;
          console.error(error);
        },
      );
    }
  }

  add() {
    this.selectedBank = null;
    this.searchBank = '';
    this.cardName = '';
    this.closingDay = 0;
    this.dueDay = 6;
    this.limit = 0;
    this.mustEdit = false;
  }

  edit(card: CreditCardResponse) {
    const bank = this.banks.filter((x) => x.id == card.bankId)[0];
    this.selectedBank = bank;
    this.searchBank = '';
    this.cardName = card.description;
    this.closingDay = card.closingDay;
    this.dueDay = card.dueDay;
    this.limit = card.creditLimit;
    this.mustEdit = true;
  }

  delete(card: CreditCardResponse) {}
}
