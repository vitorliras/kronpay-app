import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit, viewChild } from '@angular/core';
import { Base } from '../../core/bases/base/base';
import { CategoryService } from '../../core/services/category.service';
import { CategoryItemService } from '../../core/services/category.-item.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CategoryItemResponse } from '../../core/models/config/category-item/category-item-response.model';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { PaymentMethodResponse } from '../../core/models/config/payment-method/payment-method.models';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { OnlyNumbersDirective } from '../../shared/directives/only-numbers.directive';
import { TransactionService } from '../../core/services/transaction.service';
import {
  ChangeStatusTransactionRangeRequest,
  ChangeStatusTransactionRequest,
  CreateTransactionRequest,
  DeactivateTransactionSelectRequest,
  DeleteTransactionRequest,
  GetTransactionsByMonthRequest,
  ImportTransactionsFormRequest,
  TransactionRangeRequest,
  UpdateTransactionRequest,
  UpdtadeRangeTransaction,
  UpdtadeRangeTransactionItem,
} from '../../core/models/transaction/transaction-request.model';
import { Transaction } from '../../core/models/transaction/transaction.model';
import { Paginator } from '../../shared/ui/paginator';
import { TransactionDialogComponente } from './transaction-dialog/transaction-dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ImportedTransactionResponse,
  ImportTransactionsResponse,
} from '../../core/models/transaction/transaction-response.model';

@Component({
  selector: 'app-transaction',
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
    OnlyNumbersDirective,
    MatTooltip,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: Paginator,
    },
  ],
  templateUrl: './transaction.html',
  styleUrls: ['./transaction.scss', '../../../styles/main.scss'],
})
export class TransactionComponente extends Base implements OnInit {
  readonly paginatorTransaction = viewChild.required<MatPaginator>('paginatorTransaction');
  activeTab: 'categories' | 'subcategories' | 'payments' = 'categories';

  transactionColumns: string[] = [
    'select',
    'date',
    'description',
    'type',
    'category',
    'subcategory',
    'paymentMethod',
    'amount',
    'installment',
    'status',
    'actions',
  ];

  transactionAttachColumns: string[] = [
    'date',
    'description',
    'type',
    'category',
    'subcategory',
    'paymentMethod',
    'amount',
    // 'installment',
    'status',
    'actions',
  ];

  isLoading = false;
  isAttaching = false;
  preview = false;

  ExpenseTotal = 0;
  ExpensePaid = 0;
  ExpenseNotPaid = 0;
  IncomeTotal = 0;
  IncomeNotRecieve = 0;
  IncomeRecieve = 0;
  investment = 0;
  Result = 0;

  currentYear = new Date().getFullYear();

  transactions: Transaction[] = [];
  transactionsFilter: Transaction[] = [];
  transactionsFilterDataSource = new MatTableDataSource<Transaction>([]);
  selectionTransactions = new SelectionModel<Transaction>(true, []);

  transactionsAttach: ImportedTransactionResponse[] = [];
  transactionsAttachFilter: ImportedTransactionResponse[] = [];
  transactionsAttachFilterDataSource = new MatTableDataSource<ImportedTransactionResponse>([]);
  selectionTransactionsAttach = new SelectionModel<ImportedTransactionResponse>(true, []);

  categories: CategoryResponse[] = [];
  allowedExtensions = ['csv', 'ofx'];

  subcategories: CategoryItemResponse[] = [];

  paymentMethods: PaymentMethodResponse[] = [];

  private categoryService = inject(CategoryService);
  private categoryItemService = inject(CategoryItemService);
  private paymentMethodService = inject(PaymentMethodService);
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  searchTerm = '';
  typeFilter: 'I' | 'E' | 'V' | null = null;
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getDatas();
    this.applyFilters();
  }

  getDatas() {
    this.getCategories();
    this.getPaymentMethod();
    this.getSubCategories();
  }

  getCategories() {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.categories = res.value!;
      }
    });
  }

  getPaymentMethod() {
    this.paymentMethodService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.paymentMethods = res.value!;
      }
    });
  }

  getSubCategories() {
    this.categoryItemService.getAllByUser().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.subcategories = res.value!;
      }
    });
  }

  applyFilters() {
    let yearNumber = this.year;

    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > this.currentYear) {
      yearNumber = this.currentYear;
      this.year = this.currentYear;
    }

    const request: GetTransactionsByMonthRequest = {
      month: this.month,
      year: yearNumber,
    };

    this.transactionService.getAllByMonth(request).subscribe(
      (res) => {
        if (res.isSuccess) {
          if (res.value && res.value.length > 0) {
            this.transactions = res.value!;
            this.transactionsFilterDataSource.data = [...this.transactions];
            this.transactionsFilterDataSource.paginator = this.paginatorTransaction();
            this.calculateSummary(this.transactions);
            if (this.typeFilter) this.setType(this.typeFilter);
            return;
          }
        }
        this.toastr.warning(res.message);
        this.transactionsFilterDataSource.data = [];
        this.ExpenseTotal = 0;
        this.ExpensePaid = 0;
        this.ExpenseNotPaid = 0;
        this.IncomeTotal = 0;
        this.IncomeRecieve = 0;
        this.IncomeNotRecieve = 0;
        this.investment = 0;
        this.Result = 0;
      },
      (error) => {
        console.log(error);
      },
    );
  }

  roundUp(value: number): number {
    return Math.ceil(value * 100) / 100;
  }

  round2(value: number): number {
    return Number(value.toFixed(2));
  }

  calculateSummary(transactions: Transaction[]) {
    this.ExpenseTotal = 0;
    this.ExpensePaid = 0;
    this.ExpenseNotPaid = 0;

    this.IncomeTotal = 0;
    this.IncomeRecieve = 0;
    this.IncomeNotRecieve = 0;

    this.investment = 0;
    this.Result = 0;

    transactions.forEach((t) => {
      switch (t.codTypeTransaction) {
        case 'E':
          this.ExpenseTotal += t.amount;

          if (t.status === 'P') this.ExpensePaid += t.amount;
          else this.ExpenseNotPaid += t.amount;

          break;

        case 'I':
          this.IncomeTotal += t.amount;

          if (t.status === 'P') this.IncomeRecieve += t.amount;
          else this.IncomeNotRecieve += t.amount;

          break;

        case 'V':
          this.investment += t.amount;
          break;
      }
    });

    this.ExpenseTotal = this.round2(this.ExpenseTotal);
    this.ExpensePaid = this.round2(this.ExpensePaid);
    this.ExpenseNotPaid = this.round2(this.ExpenseNotPaid);

    this.IncomeTotal = this.round2(this.IncomeTotal);
    this.IncomeRecieve = this.round2(this.IncomeRecieve);
    this.IncomeNotRecieve = this.round2(this.IncomeNotRecieve);

    this.investment = this.round2(this.investment);

    this.Result = this.IncomeRecieve - this.ExpensePaid;
    this.Result = this.round2(this.Result);
  }

  setTab(tab: any) {
    this.activeTab = tab;
  }

  setType(type: 'I' | 'E' | 'V' | null) {
    this.typeFilter = type;
    if (this.isAttaching) {
      this.applyFiltersAttachTypes();
    }
    this.applyFiltersTypes();
  }

  applyFiltersTypes() {
    let filtered = [...this.transactions];

    if (this.typeFilter) {
      filtered = filtered.filter((c) => c.codTypeTransaction === this.typeFilter);
    }

    this.transactionsFilterDataSource.data = filtered;
    this.transactionsFilterDataSource.paginator = this.paginatorTransaction();
  }

  applyFiltersAttachTypes() {
    let filtered = [...this.transactionsAttach];

    if (this.typeFilter) {
      filtered = filtered.filter((c) => c.type === this.typeFilter);
    }

    this.transactionsAttachFilterDataSource.data = filtered;
  }

  setMonth(month: number) {
    this.month = month;
    this.applyFilters();
  }

  setYear(year: number) {
    this.year = year;
    if (year > 1900 || year <= this.currentYear) this.applyFilters();
  }

  OpenModalTransaction(transaction?: Transaction) {
    const dialogRef = this.dialog.open(TransactionDialogComponente, {
      disableClose: true,
      data: {
        transaction: transaction,
        categories: this.categories,
        subCategories: this.subcategories,
        paymentMethods: this.paymentMethods,
        width: '650',
      },
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          this.isLoading = true;
          if (transaction) {
            const request: UpdateTransactionRequest = {
              id: result.id,
              description: result.description,
              amount: result.amount,
              transactionDate: result.transactionDate,
              updateGroup: result.updateGroup,
              status: transaction.status,
              categoryId: result.categoryId,
              categoryItemId: result.subCategoryId,
            };
            this.transactionService.update(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  const date = new Date(request.transactionDate);
                  this.year = date.getFullYear();
                  this.month = date.getMonth() + 1;
                  this.applyFilters();
                  this.typeFilter = null;
                } else this.toastr.warning(res.message);

                this.isLoading = false;
              },
              (error) => {
                console.error(error);
              },
            );
          } else {
            const request: CreateTransactionRequest = {
              amount: result.amount,
              description: result.description,
              transactionDate: result.transactionDate,
              codTypeTransaction: result.typeTransaction,
              recurrenceType: result.recurrenceType,
              installments: result.installments ?? 1,
              categoryId: result.categoryId,
              categoryItemId: result.subCategoryId,
              idMethodPayment: result.paymentMethodId,
              endDate: result.endDate,
            };
            this.transactionService.create(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  const date = new Date(request.transactionDate);
                  this.year = date.getFullYear();
                  this.month = date.getMonth() + 1;
                  this.applyFilters();
                  this.typeFilter = null;
                } else this.toastr.warning(res.message);

                this.isLoading = false;

                this.OpenModalTransaction();
              },
              (error) => {
                console.error(error);
                this.isLoading = false;
              },
            );
          }
        }
      },
      (error) => {
        console.error(error);
      },
    );
  }

  deleteTransaction(event: any, group: boolean = false) {
    this.confirmModal(
      'Delete',
      !group ? 'AreYouSureRemoveData' : 'AreYouSureRemoveDataGroup',
      'Yes',
      'No',
      '380',
      'help_outline',
    ).subscribe((result) => {
      if (!result) return;
      const request: DeleteTransactionRequest = {
        transactionId: event.id,
        deleteGroup: group,
        fromDate: event.transactionDate,
      };

      this.transactionService.delete(request).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            const date = new Date(event.transactionDate);
            this.year = date.getFullYear();
            this.month = date.getMonth() + 1;
            this.applyFilters();
            this.typeFilter = null;
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error);
        },
      });
    });
  }

  deleteSelectTransactions() {
    if (this.selectionTransactions.isEmpty()) {
      this.messageWarning('SelectAtLeastOneItemToBeRemoved');
      return;
    }
    this.confirmModal(
      'Delete',
      'AreYouSureRemoveDataGroup',
      'Yes',
      'No',
      '380',
      'help_outline',
    ).subscribe((result) => {
      if (!result) return;

      const transactions: DeactivateTransactionSelectRequest = {
        transactions: this.selectionTransactions.selected.map((t) => ({
          id: t.id,
        })),
      };

      this.transactionService.deleteRange(transactions).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.applyFilters();
            this.typeFilter = null;
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error);
        },
      });
    });
  }

  onSearchTransactions(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchText = input.value.trim().toLowerCase();
    let filtered = [...this.transactions];
    if (this.typeFilter) {
      filtered = filtered.filter((c) => c.codTypeTransaction === this.typeFilter);
    }
    if (searchText) {
      filtered = filtered.filter((c) => c.description.toLowerCase().includes(searchText));
    }
    this.transactionsFilterDataSource.data = filtered;
    this.transactionsFilterDataSource.paginator = this.paginatorTransaction();

    if (this.isAttaching) {
      const input = event.target as HTMLInputElement;
      const searchText = input.value.trim().toLowerCase();
      let filtered = [...this.transactionsAttach];
      if (this.typeFilter) {
        filtered = filtered.filter((c) => c.type === this.typeFilter);
      }
      if (searchText) {
        filtered = filtered.filter((c) => c.description.toLowerCase().includes(searchText));
      }
      this.transactionsAttachFilterDataSource.data = filtered;
      this.transactionsAttachFilterDataSource.paginator = this.paginatorTransaction();
    }
  }

  onStatusChange(row: Transaction) {
    const request: ChangeStatusTransactionRequest = {
      id: row.id,
      status: row.status,
    };

    this.transactionService.changeStatus(request).subscribe((res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message);
        this.transactionsFilterDataSource.data = [...this.transactionsFilterDataSource.data];
        this.calculateSummary(this.transactions);
        return;
      }
      this.toastr.warning(res.message);
    });
  }

  changeStatusSelected(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    if (!newStatus || this.selectionTransactions.isEmpty()) {
      return;
    }
    const itens: ChangeStatusTransactionRequest[] = [];

    this.selectionTransactions.selected.forEach((row) => {
      row.status = newStatus;
      const item: ChangeStatusTransactionRequest = {
        id: row.id,
        status: newStatus,
      };
      itens.push(item);
    });

    const request: ChangeStatusTransactionRangeRequest = {
      transactions: itens,
    };

    this.transactionService.changeRangeStatus(request).subscribe((res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message);
        this.transactionsFilterDataSource.data = [...this.transactionsFilterDataSource.data];
        this.calculateSummary(this.transactions);

        return;
      }

      this.toastr.warning(res.message);
      this.applyFilters();
    });

    this.selectionTransactions.clear();

    select.value = '';
  }

  getCategoryDescription(row?: any): string | null {
    const id = row.categoryId;

    return this.categories.find((c) => c.id === id)?.description ?? '-';
  }

  getSubCategoryDescription(row?: any): string | null {
    const id = row.categorItemyId;

    return this.subcategories.find((s) => s.id === id)?.description ?? null;
  }

  getPaymentMethodDescription(row?: any): string | null {
    const id = row.idPaymentMethod;
    if (!id) return null;

    return this.paymentMethods.find((p) => p.id === id)?.description ?? null;
  }

  getStatusLabel(statusCode: string): string {
    const statusMap: Record<string, string> = {
      O: 'Open',
      P: 'Paid',
      C: 'Canceled',
      E: 'Expired',
    };

    return statusMap[statusCode] ?? '-';
  }

  getRowStatusClass(status: string) {
    return {
      'row-paid': status === 'P',
      'row-expired': status === 'E',
      'row-open': status === 'O',
    };
  }

  getTypeLabel(type: string, t: any) {
    if (type === 'I') return t['Income'];
    if (type === 'E') return t['Expense'];
    return t['Investment'];
  }

  toggleRow(row: any) {
    this.selectionTransactions.toggle(row);
  }

  isAllSelected(): boolean {
    const numSelected = this.selectionTransactions.selected.length;
    const numRows = this.transactionsFilterDataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  isSomeSelected(): boolean {
    const numSelected = this.selectionTransactions.selected.length;
    const numRows = this.transactionsFilterDataSource.data.length;
    return numSelected > 0 && numSelected < numRows;
  }

  masterToggle(event: any) {
    if (event.checked) {
      this.selectionTransactions.select(...this.transactionsFilterDataSource.data);
    } else {
      this.selectionTransactions.clear();
    }
  }

  isDragging = false;

  attachTransactions(file: File) {
    this.confirmModal('Atention', 'DoYouWantToView', 'Yes', 'No', '380', 'help_outline').subscribe(
      (resultPreview) => {
        this.preview = resultPreview;

        this.confirmModal(
          'Atentition',
          'DoYouWantToUseAi',
          'Yes',
          'No',
          '380',
          'help_outline',
        ).subscribe((resultAi) => {
          const request: ImportTransactionsFormRequest = {
            file: file,
            preview: this.preview,
            useAi: resultAi,
          };

          this.transactionService.import(request).subscribe(
            (res) => {
              this.isLoading = true;

              if (res.isSuccess) {
                this.isAttaching = true;
                this.typeFilter = null;

                const transactions: ImportedTransactionResponse[] = (
                  res.value?.transactions ?? []
                ).map((t) => ({
                  ...t,
                  transactionDate: t.transactionDate ? new Date(t.transactionDate) : new Date(),
                }));

                this.transactionsAttach = transactions;
                this.transactionsAttachFilterDataSource.data = [...transactions];
              } else {
                this.toastr.warning(res.message);
              }
              this.isLoading = false;
            },
            (error) => {
              this.toastr.error(error);
            },
          );
        });
      },
    );
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    if (!this.isValidFile(file)) {
      this.messageWarning('AllowedFiles');
      return;
    }

    this.attachTransactions(file);
    console.log('Arquivo selecionado:', file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];

      if (!this.isValidFile(file)) {
        this.messageWarning('AllowedFiles');
        return;
      }

      this.attachTransactions(file);
    }
  }

  isValidFile(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return this.allowedExtensions.includes(extension ?? '');
  }

  getCategoriesByType(type: string) {
    if (!type) return [];
    return this.categories.filter((c) => c.codTypeTransaction === type);
  }

  getSubcategoriesByCategory(categoryId: number | null) {
    if (!categoryId) return [];
    return this.subcategories.filter((s) => s.categoryId === categoryId);
  }

  onTypeChange(row: any) {
    row.categoryId = null;
    row.categoryItemId = null;
  }

  onCategoryChange(row: any) {
    row.categoryItemId = null;
  }

  saveAttach() {
    const hasInvalid = this.transactionsAttachFilterDataSource.data.some(
      (t) => !t.description?.trim() || !t.transactionDate || !t.type || !t.paymentMethod,
    );

    if (hasInvalid) {
      this.toastr.warning('Existem transações com campos obrigatórios não preenchidos.');
      return;
    }

    if (this.preview) {
      const transactions: Transaction[] = this.transactionsAttach.map((t) => ({
        id: t.id ?? 0,
        userId: 0,
        amount: t.amount,
        transactionDate: t.transactionDate,
        description: t.description,
        codTypeTransaction: t.type,
        status: t.status,
        categoryId: t.categoryId ?? null,
        categoryItemId: t.categoryItemId ?? null,
        installments: null,
        installmentsText: null,
        idPaymentMethod: t.paymentMethod,
        transactionGroupId: t.transactionGroupId ?? null,
        typeGroup: null,
        createdAt: new Date(),
      }));

      const request: TransactionRangeRequest = {
        transactions: transactions,
      };

      this.cancelAttach();

      this.transactionService.createRange(request).subscribe(
        (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.typeFilter = null;
            this.applyFilters();
            this.cancelAttach();
          } else {
            this.toastr.warning(res.message);
          }
        },
        (error) => {
          console.error(error);
        },
      );
    } else {
      const transactions: UpdtadeRangeTransactionItem[] = this.transactionsAttach.map((t) => ({
        id: t.id!,
        amount: t.amount,
        transactionDate: t.transactionDate,
        description: t.description,
        codTypeTransaction: t.type,
        status: t.status,
        categoryId: t.categoryId ?? null,
        categoryItemId: t.categoryItemId ?? null,
        idPaymentMethod: t.paymentMethod ?? null,
      }));

      const request: UpdtadeRangeTransaction = {
        transactions: transactions,
      };

      this.cancelAttach();

      this.transactionService.UpdateRange(request).subscribe(
        (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.typeFilter = null;
            this.applyFilters();
            this.cancelAttach();
          } else {
            this.toastr.warning(res.message);
          }
        },
        (error) => {
          console.error(error);
        },
      );
    }
  }

  cancelAttach() {
    this.transactionsAttachFilterDataSource.data = [];
    this.transactionsAttach = [];
    this.preview = false;
    this.isAttaching = false;
    this.isDragging = false;
  }

  deleteTransactionAttach(row: any) {
    this.confirmModal(
      'Delete',
      'AreYouSureRemoveData',
      'Yes',
      'No',
      '380',
      'help_outline',
    ).subscribe((result) => {
      if (result) {
        this.transactionsAttach = this.transactionsAttach.filter((t) => t !== row);

        const data = this.transactionsAttachFilterDataSource.data.filter((t) => t !== row);
        this.transactionsAttachFilterDataSource.data = data;

        if (!this.preview) {
          const request: DeleteTransactionRequest = {
            transactionId: row.id,
            deleteGroup: false,
            fromDate: row.transactionDate,
          };

          this.transactionService.delete(request).subscribe({
            next: (res) => {
              if (res.isSuccess) {
                this.toastr.success(res.message);
                const date = new Date(row.transactionDate);
                this.year = date.getFullYear();
                this.month = date.getMonth() + 1;
                this.applyFilters();
                this.typeFilter = null;
              } else {
                this.toastr.warning(res.message);
              }
            },
            error: (err) => {
              this.toastr.error(err.error);
            },
          });
        }
      }
    });
  }
}
