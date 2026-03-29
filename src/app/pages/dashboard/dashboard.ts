import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Base } from '../../core/bases/base/base';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { PaymentMethodResponse } from '../../core/models/config/payment-method/payment-method.models';
import { Transaction } from '../../core/models/transaction/transaction.model';
import { CategoryService } from '../../core/services/category.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { TransactionService } from '../../core/services/transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  GetTransactionsByMonthRequest,
  GetTransactionsByYearRequest,
} from '../../core/models/transaction/transaction-request.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
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
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss', '../../../styles/main.scss'],
})
export class DashboardComponente extends Base implements OnInit {
  private categoryService = inject(CategoryService);
  private paymentMethodService = inject(PaymentMethodService);
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  annualSummary: any[] = [];

  categories: CategoryResponse[] = [];
  allowedExtensions = ['csv', 'ofx'];
  transactions: Transaction[] = [];
  transactionsYear: Transaction[] = [];

  paymentMethods: PaymentMethodResponse[] = [];

  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  currentYear = new Date().getFullYear();

  ExpenseTotal = 0;
  ExpensePaid = 0;
  ExpenseNotPaid = 0;
  IncomeTotal = 0;
  IncomeNotRecieve = 0;
  IncomeRecieve = 0;
  investment = 0;
  Result = 0;
  Total = 0;

  summaryStats = {
    bestMonth: 0,
    bestMonthValue: 0,

    worstMonth: 0,
    worstMonthValue: 0,

    maxIncome: 0,
    maxExpense: 0,

    positiveMonths: 0,
    negativeMonths: 0,
  };

  isLoading = false;

  totalSummary = {
    income: 0,
    expense: 0,
    investment: 0,
    result: 0,
  };

  public monthlyChartData: any;
  public monthlyChartOptions: any;

  public evolutionChartData: any;
  public evolutionChartOptions: any;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getDatas();
    this.applyFiltersMonth();
    this.applyFiltersYear();
  }

  public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        label: 'Resumo',
        data: [0, 0],
        backgroundColor: ['#4CAF50', '#F44336'],
        borderWidth: 0,
      },
    ],
  };

  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: '#fff',
        formatter: (value: number) => `${value}%`,
      },
    },
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Receitas',
        data: [],
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Despesas',
        data: [],
        backgroundColor: '#F44336',
      },
    ],
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  public pieChartPlugins = [ChartDataLabels];

  getDatas() {
    this.getCategories();
    this.getPaymentMethod();
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

  setMonth(month: number) {
    this.month = month;
    this.applyFiltersMonth();
  }

  setYear(year: number, isYear: boolean = false) {
    this.year = year;
    if (!isYear) {
      if (year > 1900 || year <= this.currentYear) this.applyFiltersMonth();
    } else {
      if (year > 1900 || year <= this.currentYear) this.applyFiltersYear();
    }
  }

  applyFiltersMonth() {
    let yearNumber = this.year;
    this.isLoading = true;
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
            this.transactions = [...res.value!];
            this.calculateSummary(this.transactions);
            this.isLoading = false;
            this.cdr.detectChanges();

            return;
          }
        }
        this.toastr.warning(res.message);
        this.transactions = [];
        this.calculateSummary(this.transactions);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
        this.isLoading = false;
      },
    );
  }

  applyFiltersYear() {
    let yearNumber = this.year;
    this.isLoading = true;

    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > this.currentYear) {
      yearNumber = this.currentYear;
      this.year = this.currentYear;
    }

    const request: GetTransactionsByYearRequest = {
      year: yearNumber,
    };

    this.transactionService.getAllByYear(request).subscribe(
      (res) => {
        if (res.isSuccess) {
          if (res.value && res.value.length > 0) {
            this.transactionsYear = [...res.value!];
            this.generateAnnualSummary();
            this.calculateTotals();
            this.calculateStats();
            this.buildMonthlyCharts();
            this.isLoading = false;
            this.cdr.detectChanges();

            return;
          }
        }
        this.toastr.warning(res.message);
        this.transactionsYear = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
        this.isLoading = false;
      },
    );
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
    this.Total = 0;

    this.Total = transactions.length;

    if (transactions.length > 0) {
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

    this.updateChart();
    this.updateBarChart();
  }

  roundUp(value: number): number {
    return Math.ceil(value * 100) / 100;
  }

  round2(value: number): number {
    return Number(value.toFixed(2));
  }

  updateChart() {
    const receitas = this.IncomeRecieve;
    const despesas = this.ExpensePaid;

    const total = receitas + despesas;

    if (total === 0) {
      this.pieChartData.datasets[0].data = [0, 0];
    } else {
      const receitaPercent = (receitas / total) * 100;
      const despesaPercent = (despesas / total) * 100;

      this.pieChartData.datasets[0].data = [
        this.round2(receitaPercent),
        this.round2(despesaPercent),
      ];
    }

    this.pieChartData = { ...this.pieChartData };
    this.cdr.detectChanges();
  }

  updateBarChart() {
    const daysInMonth = new Date(this.year, this.month, 0).getDate();

    const receitasPorDia: number[] = Array(daysInMonth).fill(0);
    const despesasPorDia: number[] = Array(daysInMonth).fill(0);

    this.transactions.forEach((t) => {
      const date = new Date(t.transactionDate);
      const day = date.getDate() - 1;

      if (t.codTypeTransaction === 'I') {
        receitasPorDia[day] += t.amount;
      }

      if (t.codTypeTransaction === 'E') {
        despesasPorDia[day] += t.amount;
      }
    });

    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: receitasPorDia.map((v) => this.round2(v)),
          backgroundColor: '#4CAF50',
        },
        {
          label: 'Despesas',
          data: despesasPorDia.map((v) => this.round2(v)),
          backgroundColor: '#F44336',
        },
      ],
    };

    this.cdr.detectChanges();
  }

  generateAnnualSummary() {
    const months = [
      { key: 1, label: 'JAN' },
      { key: 2, label: 'FEB' },
      { key: 3, label: 'MAR' },
      { key: 4, label: 'APR' },
      { key: 5, label: 'MAY' },
      { key: 6, label: 'JUN' },
      { key: 7, label: 'JUL' },
      { key: 8, label: 'AUG' },
      { key: 9, label: 'SEP' },
      { key: 10, label: 'OCT' },
      { key: 11, label: 'NOV' },
      { key: 12, label: 'DEC' },
    ];

    let accumulated = 0;

    this.annualSummary = months.map((m) => {
      const transactionsMonth = this.transactionsYear.filter((t) => {
        const date = new Date(t.transactionDate);
        return date.getMonth() + 1 === m.key;
      });

      let incomes = 0;
      let expenses = 0;
      let investiments = 0;

      transactionsMonth.forEach((t) => {
        if (t.codTypeTransaction === 'I') incomes += t.amount;
        if (t.codTypeTransaction === 'E') expenses += t.amount;
        if (t.codTypeTransaction === 'V') investiments += t.amount;
      });

      const resultado = incomes - expenses;
      accumulated += resultado;

      return {
        month: m.label,
        income: this.round2(incomes),
        expense: this.round2(expenses),
        investiment: this.round2(investiments),
        result: this.round2(resultado),
        accumulated: this.round2(accumulated),
      };
    });
  }

  getValueClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return '';
  }

  calculateTotals() {
    this.totalSummary = {
      income: 0,
      expense: 0,
      investment: 0,
      result: 0,
    };

    this.transactionsYear.forEach((t) => {
      switch (t.codTypeTransaction) {
        case 'I':
          this.totalSummary.income += t.amount;
          break;

        case 'E':
          this.totalSummary.expense += t.amount;
          break;

        case 'V':
          this.totalSummary.investment += t.amount;
          break;
      }
    });

    this.totalSummary.income = this.round2(this.totalSummary.income);
    this.totalSummary.expense = this.round2(this.totalSummary.expense);
    this.totalSummary.investment = this.round2(this.totalSummary.investment);

    this.totalSummary.result = this.totalSummary.income - this.totalSummary.expense;

    this.totalSummary.result = this.round2(this.totalSummary.result);
  }

  calculateStats() {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    let maxIncome = 0;
    let maxExpense = 0;

    this.transactionsYear.forEach((t) => {
      const month = new Date(t.transactionDate).getMonth();

      if (t.codTypeTransaction === 'I' && t.status === 'P') {
        months[month].income += t.amount;

        if (t.amount > maxIncome) {
          maxIncome = t.amount;
        }
      }

      if (t.codTypeTransaction === 'E' && t.status === 'P') {
        months[month].expense += t.amount;

        if (t.amount > maxExpense) {
          maxExpense = t.amount;
        }
      }
    });

    let bestMonth = 0;
    let bestValue = -Infinity;

    let worstMonth = 0;
    let worstValue = Infinity;

    let positive = 0;
    let negative = 0;

    months.forEach((m) => {
      const result = m.income - m.expense;

      if (result > 0) positive++;
      if (result < 0) negative++;

      if (result > bestValue) {
        bestValue = result;
        bestMonth = m.month;
      }

      if (result < worstValue) {
        worstValue = result;
        worstMonth = m.month;
      }
    });

    this.summaryStats = {
      bestMonth,
      bestMonthValue: this.round2(bestValue),

      worstMonth,
      worstMonthValue: this.round2(worstValue),

      maxIncome: this.round2(maxIncome),
      maxExpense: this.round2(maxExpense),

      positiveMonths: positive,
      negativeMonths: negative,
    };
  }

  getMonthLabel(month: number, t: any): string {
    const map: any = {
      1: t['JAN'],
      2: t['FEB'],
      3: t['MAR'],
      4: t['APR'],
      5: t['MAY'],
      6: t['JUN'],
      7: t['JUL'],
      8: t['AUG'],
      9: t['SEP'],
      10: t['OCT'],
      11: t['NOV'],
      12: t['DEC'],
    };

    return map[month] ?? '-';
  }

  buildMonthlyCharts() {
    this.translations$.pipe(take(1)).subscribe((t) => {
      const incomeByMonth = Array(12).fill(0);
      const expenseByMonth = Array(12).fill(0);
      const investmentByMonth = Array(12).fill(0);

      this.transactionsYear.forEach((t) => {
        const month = new Date(t.transactionDate).getMonth();

        if (t.codTypeTransaction === 'I' && t.status === 'P') {
          incomeByMonth[month] += t.amount;
        }

        if (t.codTypeTransaction === 'E' && t.status === 'P') {
          expenseByMonth[month] += t.amount;
        }

        if (t.codTypeTransaction === 'V') {
          investmentByMonth[month] += t.amount;
        }
      });

      const labels = [
        t['JAN'],
        t['FEB'],
        t['MAR'],
        t['APR'],
        t['MAY'],
        t['JUN'],
        t['JUL'],
        t['AUG'],
        t['SEP'],
        t['OCT'],
        t['NOV'],
        t['DEC'],
      ];

      this.monthlyChartData = {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: incomeByMonth.map((v) => this.round2(v)),
            backgroundColor: '#4CAF50',
          },
          {
            label: 'Despesas',
            data: expenseByMonth.map((v) => this.round2(v)),
            backgroundColor: '#F44336',
          },
        ],
      };

      this.monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `R$ ${value}`,
            },
          },
        },
      };

      this.evolutionChartData = {
        labels,
        datasets: [
          {
            label: 'Investimentos',
            data: investmentByMonth.map((v) => this.round2(v)),
            backgroundColor: '#3498db',
          },
        ],
      };

      this.evolutionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number) => `R$ ${value}`,
            },
          },
        },
      };
    });
  }
}
