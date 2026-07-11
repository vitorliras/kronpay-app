import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
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
import { CreditCardService } from '../../core/services/credit-card.service';
import { CardInvoiceService } from '../../core/services/card-invoice.service';
import { CreditCardResponse } from '../../core/models/credit-card/credit-card';
import {
  CardInvoiceResponse,
  CreditCardSummaryResponse,
} from '../../core/models/card/card-invoice';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { GetTransactionsByDatesRequest } from '../../core/models/transaction/transaction-request.model';
import { forkJoin, take } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { TourAnchorDirective } from '../../shared/directives/tour-anchor.directive';
import { TourService } from '../../core/services/tour/tour.service';
import { REPORT_TOUR_STEPS } from '../../core/services/tour/tour-steps/report-tour-steps';

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
    MatSelectModule,
    BaseChartDirective,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TourAnchorDirective,
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
  private creditCardService = inject(CreditCardService);
  private cardInvoiceService = inject(CardInvoiceService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private tourService = inject(TourService);

  polylineDesc1 = '0,20 20,15 40,18 60,10 80,12 100,5';

  isLoading: boolean = false;

  tab = 'Expense';
  selectedTabIndex = 0;
  title = 'ExpenseReport';
  subTitle = 'SubtitleExpenseRepot';
  categories: CategoryResponse[] = [];
  transactionsCompare1: Transaction[] = [];
  transactionsCompare2: Transaction[] = [];
  transactions: Transaction[] = [];
  transactionsFilter: Transaction[] = [];
  currentYear = new Date().getFullYear();

  startDate: Date = new Date();
  endDate: Date = new Date();

  amountTotal = 0;
  transactionTotal = 0;
  average = 0;
  highestCategory = '';
  valueHighestCategory = 0;
  percentHighestCategory = 0;

  amountExpenseTotalMonth1 = 0;
  amountIncomeTotalMonth1 = 0;
  InvestmentTotalMonth1 = 0;
  amountTotalMonth1 = 0;
  amountExpenseTotalMonth2 = 0;
  amountIncomeTotalMonth2 = 0;
  InvestmentTotalMonth2 = 0;
  amountTotalMonth2 = 0;
  compareExpense = 0;
  compareIncome = 0;
  compareInvestment = 0;
  compareTotal = 0;

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

  expenseCategoryCompare: {
    categoryId: number;
    category: string;
    month1Amount: number;
    month2Amount: number;
    variation: number;
  }[] = [];

  incomeCategoryCompare: {
    categoryId: number;
    category: string;
    month1Amount: number;
    month2Amount: number;
    variation: number;
  }[] = [];

  icon = 'attach_money';

  pieChartLabels: string[] = [];
  pieChartType: 'doughnut' = 'doughnut';
  pieChartColorsExpense: string[] = [
    '#f42b15',
    '#ffd220',
    '#ad5732',
    '#ffb17d',
    '#6b3933',
    '#bdc3c7',
  ];
  pieChartColorsIncome: string[] = [
    '#2ee87b',
    '#11b997',
    '#24aa53',
    '#52ffdc',
    '#748b4e',
    '#bdc3c7',
  ];
  pieChartColorsInvestment: string[] = [
    '#109bff',
    '#6f18a4',
    '#0800f3',
    '#dd8dff',
    '#3e658a',
    '#bdc3c7',
  ];
  pieChartColors: string[] = ['#de3232', '#de16f9', '#f2ff00', '#00ff5e', '#0062ff', '#9ca3af'];
  pieChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: this.getCurrentPieColors(),
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

  months = [
    { value: 1, label: 'JAN' },
    { value: 2, label: 'FEB' },
    { value: 3, label: 'MAR' },
    { value: 4, label: 'APR' },
    { value: 5, label: 'MAY' },
    { value: 6, label: 'JUN' },
    { value: 7, label: 'JUL' },
    { value: 8, label: 'AUG' },
    { value: 9, label: 'SEP' },
    { value: 10, label: 'OCT' },
    { value: 11, label: 'NOV' },
    { value: 12, label: 'DEC' },
  ];

  descMonth1 = '';
  descMonth2 = '';

  month1 = new Date().getMonth() + 1;
  year1 = new Date().getFullYear();

  month2 = new Date().getMonth();
  year2 = new Date().getFullYear();

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

  compareBarChartType: 'bar' = 'bar';

  compareBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  compareBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        top: 12,
      },
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            return `R$ ${context.raw}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: '#4b5563',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: '#eef2f7',
        },

        border: {
          display: false,
        },

        ticks: {
          color: '#6b7280',

          callback: (value: any) => `R$ ${value}`,

          font: {
            size: 11,
          },
        },
      },
    },
  };

  distributionChartType: 'doughnut' = 'doughnut';

  distributionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: '78%',

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: false,
      },
    },
  };

  incomeDistributionChartData: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [100, 0],
        backgroundColor: ['#22c55e', '#dcfce7'],
        borderWidth: 0,
      },
    ],
  };

  expenseDistributionChartData: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [100, 0],
        backgroundColor: ['#ef4444', '#fee2e2'],
        borderWidth: 0,
      },
    ],
  };

  investmentDistributionChartData: ChartData<'doughnut'> = {
    datasets: [
      {
        data: [100, 0],
        backgroundColor: ['#3b82f6', '#dbeafe'],
        borderWidth: 0,
      },
    ],
  };

  ccCards: CreditCardResponse[] = [];
  ccSummaries = new Map<number, CreditCardSummaryResponse>();
  ccInvoicesByCard = new Map<number, CardInvoiceResponse[]>();
  ccAvailableYears: number[] = [];
  ccYear: number = new Date().getFullYear();
  ccCardId: number | null = null;
  ccLoaded = false;

  ccTotalInvoices = 0;
  ccMonthlyAverage = 0;
  ccLimitTotal = 0;
  ccUsedTotal = 0;
  ccAvailableTotal = 0;
  ccUtilizationPct = 0;
  ccOverdueCount = 0;
  ccOverdueValue = 0;
  ccPaidCount = 0;
  ccOpenCount = 0;
  ccTrendPct = 0;

  ccLimitRows: { name: string; used: number; limit: number; percent: number }[] = [];
  ccRanking: {
    name: string;
    total: number;
    limit: number;
    available: number;
    utilization: number;
    overdue: number;
  }[] = [];
  ccByCardLegend: { name: string; value: number; percent: number; color: string }[] = [];
  ccCategoryLegend: { name: string; value: number; percent: number; color: string }[] = [];

  ccPalette = [
    '#1b3c88',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#14b8a6',
    '#ec4899',
    '#6366f1',
    '#94a3b8',
  ];

  ccEvolutionChartType: 'bar' = 'bar';
  ccEvolutionChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ccEvolutionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `R$ ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4b5563', font: { size: 12, weight: 500 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#eef2f7' },
        border: { display: false },
        ticks: { color: '#6b7280', callback: (value: any) => `R$ ${value}`, font: { size: 11 } },
      },
    },
  };

  ccByCardChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  ccCategoryChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  };
  ccStatusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }],
  };

  ccDoughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: R$ ${context.raw}`,
        },
      },
    },
  };

  ccRankingColumns = ['name', 'total', 'limit', 'available', 'utilization', 'overdue'];

  ngOnInit(): void {
    this.startDate.setDate(this.endDate.getDate() - 90);
    this.isLoading = true;
    this.getTransactionsByDates();
    this.getCategories();
    this.load();

    this.activatedRoute.queryParamMap.subscribe((params) => {
      if (params.get('tour') === 'true') {
        this.tourService.start(REPORT_TOUR_STEPS);
      }
    });
  }

  getCategories() {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.categories = res.value!;
      }
    });
  }

  onTabChange(event: any) {
    this.selectedTabIndex = event.index;

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
        this.loadCreditCard();
        break;
    }
  }

  getTransactionsByDates() {
    if (this.endDate && this.startDate > this.endDate) {
      this.messageWarning('EndDateIsLaterThanStartDate');
      return;
    }

    this.startDate.setHours(0, 0, 0, 0);
    this.endDate.setHours(23, 59, 0, 0);

    const request: GetTransactionsByDatesRequest = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.transactionService.getAllByDates(request).subscribe(
      (res) => {
        if (res.isSuccess) {
          if (res.value) this.transactions = res.value;

          if (
            this.selectedTabIndex == 0 ||
            this.selectedTabIndex == 1 ||
            this.selectedTabIndex == 2
          )
            this.load();
        } else {
          this.toastr.warning(res.message);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.isLoading = false;
        console.error(error);
      },
    );
  }

  changeDate(date: Date, start: boolean) {
    this.isLoading = true;
    if (start) this.startDate = date;
    else this.endDate = date;

    this.getTransactionsByDates();
  }

  exportPDF() {
    let element = this.exportArea.nativeElement;

    if (this.tab === 'expense') element = this.exportArea.nativeElement;

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

    const start = formatDate(this.startDate);
    const end = formatDate(this.endDate);

    return `report-${this.tab}-${start}_to_${end}`;
  }

  load() {
    this.translations$.pipe(take(1)).subscribe((t) => {
      let transactionsExpense = [...this.transactions];

      if (this.selectedTabIndex == 0)
        transactionsExpense = this.transactions.filter((t) => t.codTypeTransaction === 'E');

      if (this.selectedTabIndex == 1)
        transactionsExpense = this.transactions.filter((t) => t.codTypeTransaction === 'I');

      if (this.selectedTabIndex == 2)
        transactionsExpense = this.transactions.filter((t) => t.codTypeTransaction === 'V');

      this.transactionTotal = transactionsExpense.length;

      this.amountTotal = transactionsExpense.reduce((sum, t) => sum + t.amount, 0);

      this.average = this.transactionTotal > 0 ? this.amountTotal / this.transactionTotal : 0;

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
      this.percentHighestCategory = this.amountTotal > 0 ? (maxValue / this.amountTotal) * 100 : 0;

      this.amountTotal = this.round(this.amountTotal);
      this.average = this.round(this.average);
      this.valueHighestCategory = this.round(this.valueHighestCategory);
      this.percentHighestCategory = this.round(this.percentHighestCategory);

      const categoryArray = Object.keys(categoryMap).map((categoryId) => {
        const category = this.categories.find((c) => c.id === Number(categoryId));

        return {
          categoryId,
          name: category ? category.description : t['NoCategory'],
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
            backgroundColor: this.getCurrentPieColors(),
          },
        ],
      };

      this.report = finalCategories.map((c) => ({
        ...c,
        percent: this.amountTotal > 0 ? this.round((c.value / this.amountTotal) * 100) : 0,
      }));

      this.reportTable = Object.keys(categoryDetailsMap).map((categoryId) => {
        const category = this.categories.find((c) => c.id === Number(categoryId));

        const values = categoryDetailsMap[categoryId].values;

        const total = categoryDetailsMap[categoryId].total;
        const highest = values.length ? Math.max(...values) : 0;
        const lowest = values.length ? Math.min(...values) : 0;

        return {
          categoryId,
          name: category ? category.description : t['NoCategory'],
          value: this.round(total),
          percent: this.amountTotal > 0 ? this.round((total / this.amountTotal) * 100) : 0,
          highestAmount: this.round(highest),
          lowestAmount: this.round(lowest),
        };
      });

      this.reportTable.sort((a, b) => b.value - a.value);

      this.buildExpenseEvolutionChart(transactionsExpense);

      this.cdr.detectChanges();
    });
  }

  load2() {}

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
        backgroundColor: this.getCurrentPieColors()[index],
      };
    });

    this.barChartData = {
      labels: months,
      datasets,
    };
  }

  loadExpense() {
    this.title = 'ExpenseReport';
    this.subTitle = 'SubtitleExpenseRepot';
    this.tab = 'Expense';
    this.icon = 'attach_money';
    this.load();
  }

  loadIncome() {
    this.title = 'IncomeReport';
    this.subTitle = 'SubtitleIncomeReport';
    this.tab = 'Income';
    this.icon = 'account_balance_wallet';

    this.load();
  }

  loadInvestment() {
    this.title = 'InvestmentReport';
    this.subTitle = 'SubtitleInvestmentReport';
    this.tab = 'Investment';
    this.icon = 'trending_up';
    this.load();
  }

  loadComparison() {
    this.icon = 'compare_arrows';
    this.title = 'Comparison';
    this.subTitle = 'SubtitleComparison';
    this.tab = 'Comparison';
    this.setLastMonthComparison();
  }

  loadCashFlow() {
    this.icon = 'show_chart';
  }

  loadCreditCard() {
    this.title = 'CreditCardReport';
    this.subTitle = 'SubtitleCreditCardReport';
    this.tab = 'CreditCard';
    this.icon = 'credit_card';

    if (this.ccLoaded) {
      this.aggregateCreditCard();
      return;
    }
    this.loadCreditCardData();
  }

  private loadCreditCardData() {
    this.isLoading = true;

    this.creditCardService.getAll().subscribe({
      next: (res) => {
        const cards = res.isSuccess ? (res.value ?? []) : [];
        this.ccCards = cards;

        if (!cards.length) {
          this.ccLoaded = true;
          this.isLoading = false;
          this.resetCreditCardAggregates();
          this.cdr.detectChanges();
          return;
        }

        const calls: any[] = [];
        cards.forEach((c) => {
          calls.push(this.cardInvoiceService.getSummary(c.id));
          calls.push(this.cardInvoiceService.getByCard(c.id));
        });

        forkJoin(calls).subscribe({
          next: (results: any[]) => {
            cards.forEach((c, i) => {
              const summaryRes = results[i * 2];
              const invoicesRes = results[i * 2 + 1];

              if (summaryRes?.isSuccess && summaryRes.value) {
                this.ccSummaries.set(c.id, summaryRes.value);
              }
              this.ccInvoicesByCard.set(
                c.id,
                invoicesRes?.isSuccess ? (invoicesRes.value ?? []) : [],
              );
            });

            const years = new Set<number>();
            this.ccInvoicesByCard.forEach((list) =>
              list.forEach((inv) => years.add(inv.referenceYear)),
            );
            this.ccAvailableYears = Array.from(years).sort((a, b) => b - a);

            if (this.ccAvailableYears.length && !this.ccAvailableYears.includes(this.ccYear)) {
              this.ccYear = this.ccAvailableYears[0];
            }

            this.ccLoaded = true;
            this.isLoading = false;
            this.aggregateCreditCard();
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  aggregateCreditCard() {
    this.translations$.pipe(take(1)).subscribe((t) => {
      const cards = this.ccCardId
        ? this.ccCards.filter((c) => c.id === this.ccCardId)
        : this.ccCards;

      const rows: { card: CreditCardResponse; inv: CardInvoiceResponse }[] = [];
      cards.forEach((c) => {
        (this.ccInvoicesByCard.get(c.id) ?? [])
          .filter((inv) => inv.referenceYear === this.ccYear)
          .forEach((inv) => rows.push({ card: c, inv }));
      });

      this.ccTotalInvoices = this.round(rows.reduce((s, r) => s + r.inv.totalAmount, 0));

      const monthsWith = new Set(
        rows.filter((r) => r.inv.totalAmount > 0).map((r) => r.inv.referenceMonth),
      );
      this.ccMonthlyAverage = this.round(
        monthsWith.size ? this.ccTotalInvoices / monthsWith.size : 0,
      );

      this.ccLimitTotal = 0;
      this.ccUsedTotal = 0;
      this.ccAvailableTotal = 0;
      cards.forEach((c) => {
        const s = this.ccSummaries.get(c.id);
        if (s) {
          this.ccLimitTotal += s.creditLimit;
          this.ccUsedTotal += s.usedAmount;
          this.ccAvailableTotal += s.availableAmount;
        }
      });
      this.ccLimitTotal = this.round(this.ccLimitTotal);
      this.ccUsedTotal = this.round(this.ccUsedTotal);
      this.ccAvailableTotal = this.round(this.ccAvailableTotal);
      this.ccUtilizationPct =
        this.ccLimitTotal > 0 ? this.round((this.ccUsedTotal / this.ccLimitTotal) * 100) : 0;

      this.ccOverdueCount = 0;
      this.ccOverdueValue = 0;
      this.ccPaidCount = 0;
      this.ccOpenCount = 0;
      let openValue = 0;
      let paidValue = 0;
      rows.forEach((r) => {
        if (this.isCcOverdue(r.inv)) {
          this.ccOverdueCount++;
          this.ccOverdueValue += r.inv.totalAmount;
        } else if (r.inv.status === 'P') {
          this.ccPaidCount++;
          paidValue += r.inv.totalAmount;
        } else {
          this.ccOpenCount++;
          openValue += r.inv.totalAmount;
        }
      });
      this.ccOverdueValue = this.round(this.ccOverdueValue);

      this.ccStatusChartData = {
        labels: [t['Paid'], t['Open'], t['Overdue']],
        datasets: [
          {
            data: [this.round(paidValue), this.round(openValue), this.ccOverdueValue],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderWidth: 0,
          },
        ],
      };

      const monthTotals: number[] = new Array(12).fill(0);
      rows.forEach((r) => {
        monthTotals[r.inv.referenceMonth - 1] += r.inv.totalAmount;
      });
      this.ccEvolutionChartData = {
        labels: this.months.map((m) => t[m.label]),
        datasets: [
          {
            label: t['TotalInvoices'],
            data: monthTotals.map((v) => this.round(v)),
            backgroundColor: '#1b3c88',
            borderRadius: 6,
            maxBarThickness: 34,
          },
        ],
      };

      const monthsPresent = monthTotals
        .map((v, i) => ({ m: i + 1, v }))
        .filter((x) => x.v > 0);
      if (monthsPresent.length >= 2) {
        const last = monthsPresent[monthsPresent.length - 1].v;
        const prev = monthsPresent[monthsPresent.length - 2].v;
        this.ccTrendPct = this.round(this.calculatePercentage(prev, last));
      } else {
        this.ccTrendPct = 0;
      }

      const byCard = cards
        .map((c, idx) => {
          const total = rows
            .filter((r) => r.card.id === c.id)
            .reduce((s, r) => s + r.inv.totalAmount, 0);
          return {
            name: c.description,
            value: this.round(total),
            color: this.ccPalette[idx % this.ccPalette.length],
          };
        })
        .filter((x) => x.value > 0)
        .sort((a, b) => b.value - a.value);

      const byCardTotal = byCard.reduce((s, c) => s + c.value, 0);
      this.ccByCardLegend = byCard.map((c) => ({
        name: c.name,
        value: c.value,
        percent: byCardTotal > 0 ? this.round((c.value / byCardTotal) * 100) : 0,
        color: c.color,
      }));
      this.ccByCardChartData = {
        labels: byCard.map((c) => c.name),
        datasets: [{ data: byCard.map((c) => c.value), backgroundColor: byCard.map((c) => c.color) }],
      };

      this.ccLimitRows = cards
        .map((c) => {
          const s = this.ccSummaries.get(c.id);
          const limit = s?.creditLimit ?? c.creditLimit ?? 0;
          const used = s?.usedAmount ?? 0;
          return {
            name: c.description,
            used: this.round(used),
            limit: this.round(limit),
            percent: limit > 0 ? this.round((used / limit) * 100) : 0,
          };
        })
        .sort((a, b) => b.percent - a.percent);

      this.ccRanking = cards
        .map((c) => {
          const s = this.ccSummaries.get(c.id);
          const total = rows
            .filter((r) => r.card.id === c.id)
            .reduce((sum, r) => sum + r.inv.totalAmount, 0);
          const overdue = rows.filter((r) => r.card.id === c.id && this.isCcOverdue(r.inv)).length;
          const limit = s?.creditLimit ?? c.creditLimit ?? 0;
          const used = s?.usedAmount ?? 0;
          return {
            name: c.description,
            total: this.round(total),
            limit: this.round(limit),
            available: this.round(s?.availableAmount ?? 0),
            utilization: limit > 0 ? this.round((used / limit) * 100) : 0,
            overdue,
          };
        })
        .sort((a, b) => b.total - a.total);

      this.loadCcCategories(
        rows.map((r) => r.inv),
        t,
      );
      this.cdr.detectChanges();
    });
  }

  private loadCcCategories(invoices: CardInvoiceResponse[], t: any) {
    const target = invoices.filter((inv) => inv.totalAmount > 0);

    if (!target.length) {
      this.ccCategoryLegend = [];
      this.ccCategoryChartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
      this.cdr.detectChanges();
      return;
    }

    forkJoin(target.map((inv) => this.cardInvoiceService.getItems(inv.id))).subscribe({
      next: (results) => {
        const map: Record<string, number> = {};
        results.forEach((res) => {
          if (res.isSuccess && res.value) {
            res.value.forEach((it) => {
              if (it.status === 'C') return;
              const key = it.categoryDescription || t['NoCategory'];
              map[key] = (map[key] ?? 0) + it.amount;
            });
          }
        });

        const arr = Object.keys(map)
          .map((k) => ({ name: k, value: this.round(map[k]) }))
          .sort((a, b) => b.value - a.value);

        const top = arr.slice(0, 6);
        const others = arr.slice(6);
        const othersTotal = others.reduce((s, c) => s + c.value, 0);
        if (othersTotal > 0) top.push({ name: t['Others'], value: this.round(othersTotal) });

        const total = top.reduce((s, c) => s + c.value, 0);
        this.ccCategoryLegend = top.map((c, i) => ({
          name: c.name,
          value: c.value,
          percent: total > 0 ? this.round((c.value / total) * 100) : 0,
          color: this.ccPalette[i % this.ccPalette.length],
        }));
        this.ccCategoryChartData = {
          labels: top.map((c) => c.name),
          datasets: [
            {
              data: top.map((c) => c.value),
              backgroundColor: top.map((_, i) => this.ccPalette[i % this.ccPalette.length]),
            },
          ],
        };
        this.cdr.detectChanges();
      },
    });
  }

  isCcOverdue(inv: CardInvoiceResponse): boolean {
    if (inv.status === 'P') return false;
    const due = new Date(inv.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  onCcYearChange() {
    this.aggregateCreditCard();
  }

  onCcCardChange() {
    this.aggregateCreditCard();
  }

  clearCcFilters() {
    this.ccCardId = null;
    this.ccYear = this.ccAvailableYears[0] ?? new Date().getFullYear();
    this.aggregateCreditCard();
  }

  isCcFilterActive(): boolean {
    const defaultYear = this.ccAvailableYears[0] ?? new Date().getFullYear();
    return this.ccCardId !== null || this.ccYear !== defaultYear;
  }

  private resetCreditCardAggregates() {
    this.ccTotalInvoices = 0;
    this.ccMonthlyAverage = 0;
    this.ccLimitTotal = 0;
    this.ccUsedTotal = 0;
    this.ccAvailableTotal = 0;
    this.ccUtilizationPct = 0;
    this.ccOverdueCount = 0;
    this.ccOverdueValue = 0;
    this.ccPaidCount = 0;
    this.ccOpenCount = 0;
    this.ccTrendPct = 0;
    this.ccLimitRows = [];
    this.ccRanking = [];
    this.ccByCardLegend = [];
    this.ccCategoryLegend = [];
    this.ccEvolutionChartData = { labels: [], datasets: [] };
    this.ccByCardChartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    this.ccCategoryChartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    this.ccStatusChartData = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
  }

  getCurrentPieColors(): string[] {
    switch (this.selectedTabIndex) {
      case 0:
        return this.pieChartColorsExpense;
      case 1:
        return this.pieChartColorsIncome;
      default:
        return this.pieChartColorsInvestment;
    }
  }

  getColors(index: number): string {
    switch (index) {
      case 1:
        return '#f88b8bbb';
      case 2:
        return '#fe1818be';
      case 3:
        return '#abfb93ba';
      case 4:
        return '#19ff3cb7';
      case 5:
        return '#76aaffba';
      case 6:
        return '#dc87fdba';
      case 7:
        return '#b701ffba';
      default:
        return '';
    }
  }

  validateYear(field: 'year1' | 'year2') {
    const currentYear = new Date().getFullYear();

    if (this[field] < 2000) this[field] = 2000;
    if (this[field] > currentYear) this[field] = currentYear;

    if (this.validateCompare()) this.compare();
  }

  validateMonth(field: 'month1' | 'month2', isOne: boolean) {
    const month = this.months.filter((x) => x.value == this[field])[0].label;

    if (isOne) this.descMonth1 = month;
    else this.descMonth2 = month;

    if (this.validateCompare()) this.compare();
  }

  validateCompare(): boolean {
    if (this.month1 && this.month2 && this.year1 && this.year2) return true;
    return false;
  }

  setLastMonthComparison() {
    const now = new Date();

    this.month2 = now.getMonth() + 1;
    this.year2 = now.getFullYear();

    this.month1 = now.getMonth();
    this.year1 = now.getFullYear();

    if (this.month1 === 0) {
      this.month1 = 12;
      this.year1--;
    }
    const month = this.months.filter((x) => x.value == this.month1)[0].label;
    const month2 = this.months.filter((x) => x.value == this.month2)[0].label;

    this.descMonth1 = month;
    this.descMonth2 = month2;

    this.compare();
  }

  compare() {
    if (!this.month1 || !this.year1 || !this.month2 || !this.year2) return;

    const start1 = new Date(this.year1, this.month1 - 1, 1);
    const end1 = new Date(this.year1, this.month1, 0);

    const start2 = new Date(this.year2, this.month2 - 1, 1);
    const end2 = new Date(this.year2, this.month2, 0);

    this.startDate = start1;
    this.endDate = end2;

    start1.setHours(0, 0, 0, 0);
    end1.setHours(23, 59, 59, 999);

    start2.setHours(0, 0, 0, 0);
    end2.setHours(23, 59, 59, 999);

    this.isLoading = true;

    const request1 = {
      startDate: start1,
      endDate: end1,
    };

    const request2 = {
      startDate: start2,
      endDate: end2,
    };

    forkJoin([
      this.transactionService.getAllByDates(request1),
      this.transactionService.getAllByDates(request2),
    ]).subscribe({
      next: ([res1, res2]) => {
        if (res1.isSuccess && res1.value) {
          this.transactionsCompare1 = res1.value;
        }

        if (res2.isSuccess && res2.value) {
          this.transactionsCompare2 = res2.value;
        }

        this.loadCompare();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  loadCompare() {
    this.translations$.pipe(take(1)).subscribe((t) => {
      const month1 = this.calculateTotals(this.transactionsCompare1);
      const month2 = this.calculateTotals(this.transactionsCompare2);

      this.amountExpenseTotalMonth1 = this.round(month1.expense);
      this.amountIncomeTotalMonth1 = this.round(month1.income);
      this.InvestmentTotalMonth1 = this.round(month1.investment);
      this.amountTotalMonth1 = this.round(month1.total);

      this.amountExpenseTotalMonth2 = this.round(month2.expense);
      this.amountIncomeTotalMonth2 = this.round(month2.income);
      this.InvestmentTotalMonth2 = this.round(month2.investment);
      this.amountTotalMonth2 = this.round(month2.total);

      this.compareExpense = this.round(this.calculatePercentage(month1.expense, month2.expense));
      this.compareIncome = this.round(this.calculatePercentage(month1.income, month2.income));
      this.compareInvestment = this.round(
        this.calculatePercentage(month1.investment, month2.investment),
      );

      this.compareTotal = this.round(this.calculatePercentage(month1.total, month2.total));

      this.compareBarChartData = {
        labels: [t['Income'], t['Expense'], t['Investment']],

        datasets: [
          {
            label: `${this.descMonth1}/${this.year1}`,
            data: [
              this.amountIncomeTotalMonth1,
              this.amountExpenseTotalMonth1,
              this.InvestmentTotalMonth1,
            ],
            backgroundColor: ['#86d97f', '#ff5c5c', '#4f7cff'],
            borderRadius: 6,
          },

          {
            label: `${this.descMonth2}/${this.year2}`,
            data: [
              this.amountIncomeTotalMonth2,
              this.amountExpenseTotalMonth2,
              this.InvestmentTotalMonth2,
            ],
            backgroundColor: ['#c7efc3', '#ff9d9d', '#a9c2ff'],
            borderRadius: 6,
          },
        ],
      };

      this.incomeDistributionChartData = {
        datasets: [
          {
            data: [this.amountIncomeTotalMonth2, this.amountIncomeTotalMonth1],
            backgroundColor: ['#22c55e', '#bbf7d0'],
            borderWidth: 0,
          },
        ],
      };

      this.expenseDistributionChartData = {
        datasets: [
          {
            data: [this.amountExpenseTotalMonth2, this.amountExpenseTotalMonth1],
            backgroundColor: ['#ef4444', '#fecaca'],
            borderWidth: 0,
          },
        ],
      };

      this.investmentDistributionChartData = {
        datasets: [
          {
            data: [this.InvestmentTotalMonth2, this.InvestmentTotalMonth1],
            backgroundColor: ['#3b82f6', '#bfdbfe'],
            borderWidth: 0,
          },
        ],
      };

      this.expenseCategoryCompare = this.buildCategoryComparison(
        this.transactionsCompare1,
        this.transactionsCompare2,
        'E',
        t,
      );

      this.incomeCategoryCompare = this.buildCategoryComparison(
        this.transactionsCompare1,
        this.transactionsCompare2,
        'I',
        t,
      );

      this.cdr.detectChanges();
    });
  }

  private buildCategoryComparison(
    month1Transactions: Transaction[],
    month2Transactions: Transaction[],
    type: string,
    translate: any,
  ): any[] {
    const map = new Map<number, any>();

    month1Transactions
      .filter((t) => t.codTypeTransaction === type)
      .forEach((t) => {
        const categoryId = t.categoryId ?? 0;

        const categoryDescription =
          this.categories.find((c) => c.id === categoryId)?.description || translate['NoCategory'];

        if (!map.has(categoryId)) {
          map.set(categoryId, {
            categoryId: categoryId,
            category: categoryDescription,
            month1Amount: 0,
            month2Amount: 0,
            variation: 0,
          });
        }

        const item = map.get(categoryId)!;
        item.month1Amount += t.amount;
      });

    month2Transactions
      .filter((t) => t.codTypeTransaction === type)
      .forEach((t) => {
        const categoryId = t.categoryId ?? 0;

        const categoryDescription =
          this.categories.find((c) => c.id === categoryId)?.description || translate['NoCategory'];

        if (!map.has(categoryId)) {
          map.set(categoryId, {
            categoryId: categoryId,
            category: categoryDescription,
            month1Amount: 0,
            month2Amount: 0,
            variation: 0,
          });
        }

        const item = map.get(categoryId)!;
        item.month2Amount += t.amount;
      });

    map.forEach((item) => {
      item.month1Amount = this.round(item.month1Amount);
      item.month2Amount = this.round(item.month2Amount);
      item.variation = this.round(item.month1Amount - item.month2Amount);
    });

    const result = Array.from(map.values());

    result.sort((a, b) => b.month1Amount + b.month2Amount - (a.month1Amount + a.month2Amount));

    const limit = type === 'E' ? 9 : 4;

    const topItems = result.slice(0, limit);

    const others = result.slice(limit);

    if (others.length > 0) {
      const othersItem = {
        categoryId: 0,
        category: translate['Others'],
        month1Amount: 0,
        month2Amount: 0,
        variation: 0,
      };

      others.forEach((item) => {
        othersItem.month1Amount += item.month1Amount;
        othersItem.month2Amount += item.month2Amount;
        othersItem.variation += item.variation;
      });

      othersItem.month1Amount = this.round(othersItem.month1Amount);
      othersItem.month2Amount = this.round(othersItem.month2Amount);
      othersItem.variation = this.round(othersItem.variation);

      topItems.push(othersItem);
    }

    return topItems;
  }

  calculateTotals(transactions: Transaction[]) {
    let expense = 0;
    let income = 0;
    let investment = 0;

    transactions.forEach((t) => {
      switch (t.codTypeTransaction) {
        case 'E':
          expense += t.amount;
          break;
        case 'I':
          income += t.amount;
          break;
        case 'V':
          investment += t.amount;
          break;
      }
    });

    return {
      expense,
      income,
      investment,
      total: income - expense,
    };
  }

  calculatePercentage(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  getPercent(value: number, value2: number): number {
    const some = value + value2;

    if (some === 0) return 0;

    return this.round((value / some) * 100);
  }
}
