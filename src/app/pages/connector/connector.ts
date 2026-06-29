import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Base } from '../../core/bases/base/base';
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
import { ApiBankService } from '../../core/services/api-bank.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectorsResponse } from '../../core/models/bank/connectors-response-dto';
import { Connector } from '../../core/models/bank/connector-dto';
import { PluggyConnect } from 'pluggy-connect-sdk';

@Component({
  selector: 'app-connector',
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
    MatProgressSpinnerModule,
    MatSortModule,
  ],
  templateUrl: './connector.html',
  styleUrls: ['./connector.scss', '../../../styles/main.scss'],
})
export class ConnectorComponent extends Base implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getConnector();
  }

  page = 1;
  pageSize = 12;

  paginatedBanks: any[] = [];
  allBanks: Connector[] = [];
  mainBanks: Connector[] = [];
  orderedBanks: Connector[] = [];
  searchTerm = '';
  filteredBanks: Connector[] = [];

  totalPages = 1;

  isLoading = false;
  bank!: ConnectorsResponse;

  private apiBankService = inject(ApiBankService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  getConnector() {
    this.isLoading = true;

    this.apiBankService.getBanks().subscribe((res) => {
      this.bank = res;

      this.allBanks = res.results;

      this.mainBanks = this.getMainBanks(res.results);

      this.orderedBanks = [
        ...this.mainBanks,
        ...this.allBanks.filter((b) => !this.mainBanks.includes(b)),
      ];

      this.totalPages = Math.ceil(this.orderedBanks.length / this.pageSize);

      this.setPage(1);

      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  onSearchTransactions(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    this.searchTerm = value;

    const baseList = this.orderedBanks;

    this.filteredBanks = baseList.filter((b) => b.name.toLowerCase().includes(value));

    this.totalPages = Math.ceil(this.filteredBanks.length / this.pageSize);

    this.setPage(1);
  }

  getMainBanks(banks: any[]) {
    const mainIdsPluggyNames = [
      { id: 601, nome: 'Itaú' },
      { id: 611, nome: 'Banco do Brasil' },
      { id: 603, nome: 'Bradesco' },
      { id: 219, nome: 'Caixa Economica Federal' },
      { id: 608, nome: 'Santander' },
      { id: 612, nome: 'Nubank' },
      { id: 215, nome: 'Inter' },
      { id: 626, nome: 'C6 Bank' },
      { id: 214, nome: 'BTG Pactual' },
      { id: 661, nome: 'Sicredi' },
      { id: 689, nome: 'Neon' },
      { id: 206, nome: 'Mercado Pago' },
    ];

    const mainIds = mainIdsPluggyNames.map((b) => b.id);

    const main = banks.filter((b) => mainIds.includes(b.id));

    const rest = banks.filter((b) => !mainIds.includes(b.id));

    return [...main, ...rest];
  }

  setPage(page: number) {
    this.page = page;

    const source = this.searchTerm ? this.filteredBanks : this.orderedBanks;

    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedBanks = source.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.setPage(this.page + 1);
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.setPage(this.page - 1);
    }
  }

  selectBank(bank: Connector) {
    this.apiBankService.getToken().subscribe((res) => {
      const pluggyConnect = new PluggyConnect({
        connectToken: res.accessToken,
        connectorIds: [bank.id],

        onSuccess: (itemData: any) => {
          console.log('Conta conectada', itemData);

          // itemData.item.id
          // itemData.connector.id

          this.toastr.success('Banco conectado com sucesso');
        },

        onError: (error: any) => {
          console.error(error);
          this.toastr.error('Erro ao conectar banco');
        },

        onClose: () => {
          console.log('Usuário fechou');
        },
      });

      pluggyConnect.init();
    });
  }
}
