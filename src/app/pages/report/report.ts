import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
import { BaseChartDirective } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OnlyNumbersDirective } from '../../shared/directives/only-numbers.directive';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { BR_DATE_FORMATS } from '../transaction/transaction-dialog/transaction-dialog';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { Transaction } from '../../core/models/transaction/transaction.model';
import { CategoryService } from '../../core/services/category.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { TransactionService } from '../../core/services/transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { GetTransactionsByDatesRequest } from '../../core/models/transaction/transaction-request.model';
import { take } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-report',
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
    BaseChartDirective,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    OnlyNumbersDirective,
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter },
  ],
  templateUrl: './report.html',
  styleUrls: ['./report.scss', '../../../styles/main.scss'],
})
export class ReportComponent extends Base implements OnInit {
  @ViewChild('exportArea') exportArea!: ElementRef;

  private categoryService = inject(CategoryService);
  private paymentMethodService = inject(PaymentMethodService);
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = false;

  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  year2: number = new Date().getFullYear();
  currentYear = new Date().getFullYear();
  tab = 'expense';

  categories: CategoryResponse[] = [];
  transactions: Transaction[] = [];
  transactionsFilter: Transaction[] = [];

  startDateExpense: Date = new Date();
  endDateExpense: Date = new Date();

  expenseTotal = 0;
  transactionTotal = 0;
  average = 0;
  highestCategory = '';
  valueHighestCategory = 0;
  percentHighestCategory = 0;

  report: {
    categoryId: string;
    name: string;
    value: number;
    percent: number;
  }[] = [];

  reportTable: {
    categoryId: string;
    name: string;
    value: number;
    percent: number;
    highestAmount: number;
    lowestAmount: number;
  }[] = [];

  //expense chart
  pieChartLabels: string[] = [];
  pieChartType: 'doughnut' = 'doughnut';
  pieChartColors: string[] = ['#890000', '#de16f9', '#f2ff00', '#00ff5e', '#0062ff', '#9ca3af'];
  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: this.pieChartColors,
      },
    ],
  };

  pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  barChartType: 'bar' = 'bar';

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  ngOnInit(): void {
    this.startDateExpense.setDate(this.endDateExpense.getDate() - 90);
    this.isLoading = true;
    this.getTransactionsByDates();
    this.getCategories();
    this.loadExpense();
  }

  getCategories() {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.categories = res.value!;
      }
    });
  }

  onTabChange(event: any) {
    switch (event.index) {
      case 0:
        this.tab = 'expense';
        this.loadExpense();
        break;
      case 1:
        this.tab = 'income';
        this.loadIncome();
        break;
      case 2:
        this.tab = 'investment';
        this.loadInvestment();
        break;
      case 3:
        this.loadComparison();
        break;
      case 4:
        this.loadCashFlow();
        break;
    }
  }

  getTransactionsByDates() {
    if (this.endDateExpense && this.startDateExpense > this.endDateExpense)
      this.messageWarning('Date');

    this.startDateExpense.setHours(0, 0, 0, 0);
    this.endDateExpense.setHours(23, 59, 0, 0);

    const request: GetTransactionsByDatesRequest = {
      startDate: this.startDateExpense,
      endDate: this.endDateExpense,
    };

    this.transactionService.getAllByDates(request).subscribe(
      (res) => {
        if (res.isSuccess) {
          if (res.value) this.transactions = res.value;

          this.loadExpense();
        } else {
          this.toastr.warning(res.message);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastr.error(error.message);
      },
    );
  }

  changeDate(date: Date, start: boolean) {
    this.isLoading = true;
    if (start) this.startDateExpense = date;
    else this.endDateExpense = date;

    this.getTransactionsByDates();
  }

  exportPDF() {
    let element = this.exportArea.nativeElement;

    if(this.tab ===  'expense')
       element = this.exportArea.nativeElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save(`${this.buildFileName()}.pdf`);
    });
  }

  private buildFileName(): string {
    const formatDate = (date: Date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return `${day}-${month}-${year}`;
    };

    const start = formatDate(this.startDateExpense);
    const end = formatDate(this.endDateExpense);

    return `report-${this.tab}-${start}_to_${end}`;
  }

  loadExpense() {
    this.translations$.pipe(take(1)).subscribe((t) => {
      const transactionsExpense = this.transactions.filter((t) => t.codTypeTransaction === 'E');

      this.transactionTotal = transactionsExpense.length;

      this.expenseTotal = transactionsExpense.reduce((sum, t) => sum + t.amount, 0);

      this.average = this.transactionTotal > 0 ? this.expenseTotal / this.transactionTotal : 0;

      const categoryMap: Record<string, number> = {};

      const categoryDetailsMap: Record<
        string,
        {
          total: number;
          values: number[];
        }
      > = {};

      transactionsExpense.forEach((t) => {
        const categoryKey = t.categoryId ?? '0';

        if (!categoryMap[categoryKey]) {
          categoryMap[categoryKey] = 0;
        }

        categoryMap[categoryKey] += t.amount;

        if (!categoryDetailsMap[categoryKey]) {
          categoryDetailsMap[categoryKey] = {
            total: 0,
            values: [],
          };
        }

        categoryDetailsMap[categoryKey].total += t.amount;
        categoryDetailsMap[categoryKey].values.push(t.amount);
      });

      let maxCategoryId = '';
      let maxValue = 0;

      for (const categoryId in categoryMap) {
        if (categoryMap[categoryId] > maxValue) {
          maxValue = categoryMap[categoryId];
          maxCategoryId = categoryId;
        }
      }

      const category = this.categories.find((c) => c.id === Number(maxCategoryId));

      this.highestCategory = category ? category.description : '';
      this.valueHighestCategory = maxValue;
      this.percentHighestCategory =
        this.expenseTotal > 0 ? (maxValue / this.expenseTotal) * 100 : 0;

      this.expenseTotal = this.round(this.expenseTotal);
      this.average = this.round(this.average);
      this.valueHighestCategory = this.round(this.valueHighestCategory);
      this.percentHighestCategory = this.round(this.percentHighestCategory);

      const categoryArray = Object.keys(categoryMap).map((categoryId) => {
        const category = this.categories.find((c) => c.id === Number(categoryId));

        return {
          categoryId,
          name: category ? category.description : 'Sem categoria',
          value: categoryMap[categoryId],
        };
      });

      categoryArray.sort((a, b) => b.value - a.value);

      const top5 = categoryArray.slice(0, 5);

      const others = categoryArray.slice(5);
      const othersTotal = others.reduce((sum, c) => sum + c.value, 0);

      const finalCategories = [...top5];

      if (othersTotal > 0) {
        finalCategories.push({
          categoryId: 'others',
          name: t['Others'],
          value: othersTotal,
        });
      }

      this.pieChartData = {
        labels: finalCategories.map((c) => c.name),
        datasets: [
          {
            data: finalCategories.map((c) => this.round(c.value)),
            backgroundColor: this.pieChartColors,
          },
        ],
      };

      this.report = finalCategories.map((c) => ({
        ...c,
        percent: this.expenseTotal > 0 ? this.round((c.value / this.expenseTotal) * 100) : 0,
      }));

      this.reportTable = Object.keys(categoryDetailsMap).map((categoryId) => {
        const category = this.categories.find((c) => c.id === Number(categoryId));

        const values = categoryDetailsMap[categoryId].values;

        const total = categoryDetailsMap[categoryId].total;
        const highest = values.length ? Math.max(...values) : 0;
        const lowest = values.length ? Math.min(...values) : 0;

        return {
          categoryId,
          name: category ? category.description : 'Sem categoria',
          value: this.round(total),
          percent: this.expenseTotal > 0 ? this.round((total / this.expenseTotal) * 100) : 0,
          highestAmount: this.round(highest),
          lowestAmount: this.round(lowest),
        };
      });

      this.reportTable.sort((a, b) => b.value - a.value);

      this.buildExpenseEvolutionChart(transactionsExpense);

      this.cdr.detectChanges();
    });
  }

  buildExpenseEvolutionChart(transactionsExpense: any[]) {
    const monthCategoryMap: Record<string, Record<string, number>> = {};

    transactionsExpense.forEach((t) => {
      const date = new Date(t.transactionDate);

      const month = date.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });

      const categoryId = t.categoryId ?? '0';

      if (!monthCategoryMap[month]) {
        monthCategoryMap[month] = {};
      }

      if (!monthCategoryMap[month][categoryId]) {
        monthCategoryMap[month][categoryId] = 0;
      }

      monthCategoryMap[month][categoryId] += t.amount;
    });

    const months = Object.keys(monthCategoryMap);

    const datasets = this.report.map((category, index) => {
      return {
        label: category.name,
        data: months.map((month) => {
          const monthData = monthCategoryMap[month];

          // 🔹 OUTROS
          if (category.categoryId === 'others') {
            let total = 0;

            Object.keys(monthData).forEach((catId) => {
              const existsInTop = this.report.find((c) => c.categoryId == catId);

              if (!existsInTop) {
                total += monthData[catId];
              }
            });

            return this.round(total);
          }

          return this.round(monthData[category.categoryId] || 0);
        }),
        backgroundColor: this.pieChartColors[index],
      };
    });

    this.barChartData = {
      labels: months,
      datasets,
    };
  }

  loadIncome() {}
  loadComparison() {}
  loadInvestment() {}
  loadCashFlow() {}
}
