import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, take } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Base } from '../../core/bases/base/base';
import { PlanningService } from '../../core/services/planning.service';
import { CategoryService } from '../../core/services/category.service';
import { CreditCardService } from '../../core/services/credit-card.service';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { CreditCardResponse } from '../../core/models/credit-card/credit-card';
import { PlannedCommitmentResponse } from '../../core/models/planning/planned-commitment-response.model';
import { FinancialProjectionResponse } from '../../core/models/planning/financial-projection-response.model';
import { SimulatePurchaseRequest } from '../../core/models/planning/simulate-purchase-request.model';
import { PurchaseSimulationResponse } from '../../core/models/planning/purchase-simulation-response.model';
import { MonthlyViabilityComparisonRequest } from '../../core/models/planning/monthly-viability-comparison-request.model';
import { MonthViabilityResponse } from '../../core/models/planning/month-viability-response.model';
import { ViabilityFindingResponse } from '../../core/models/planning/viability-finding-response.model';
import { ProjectionMonthResponse } from '../../core/models/planning/projection-month-response.model';
import { PlanningCommitmentModal } from './planning-commitment-modal/planning-commitment-modal';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  templateUrl: './planning.html',
  styleUrls: ['./planning.scss', '../../../styles/planning.scss'],
})
export class PlanningComponent extends Base implements OnInit {
  private planningService = inject(PlanningService);
  private categoryService = inject(CategoryService);
  private creditCardService = inject(CreditCardService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  commitments: PlannedCommitmentResponse[] = [];
  categories: CategoryResponse[] = [];
  cards: CreditCardResponse[] = [];
  isLoading = false;

  projection: FinancialProjectionResponse | null = null;
  isLoadingProjection = false;
  horizonMonths = 12;
  safetyReserve: number | null = null;
  horizonOptions = [6, 12, 24];

  simAmount: number | null = null;
  simDate = new Date().toISOString().substring(0, 10);
  simInstallment = false;
  simInstallmentsCount = 3;
  simCreditCardId: number | null = null;
  simulation: PurchaseSimulationResponse | null = null;
  comparison: MonthViabilityResponse[] = [];
  isSimulating = false;

  lineChartType: 'line' = 'line';
  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  simChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#4b5563' } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: R$ ${c.parsed.y}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
      y: {
        grid: { color: '#eef2f7' },
        border: { display: false },
        ticks: { color: '#6b7280', callback: (v: any) => `R$ ${v}`, font: { size: 11 } },
      },
    },
  };

  ngOnInit(): void {
    this.loadCategories();
    this.loadCards();
    this.loadCommitments();
    this.loadProjection();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess) this.categories = res.value ?? [];
    });
  }

  loadCards(): void {
    this.creditCardService.getAll().subscribe((res) => {
      if (res.isSuccess) this.cards = res.value ?? [];
    });
  }

  loadCommitments(): void {
    this.isLoading = true;
    this.planningService.getCommitments().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.commitments = res.isSuccess ? (res.value ?? []) : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadProjection(): void {
    this.isLoadingProjection = true;
    this.planningService.getProjection(this.horizonMonths, this.safetyReserve).subscribe({
      next: (res) => {
        this.isLoadingProjection = false;
        this.projection = res.isSuccess ? (res.value ?? null) : null;
        if (this.projection) {
          if (this.safetyReserve == null) this.safetyReserve = this.projection.safetyReserve;
          this.lineChartData = this.buildChart(this.projection);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProjection = false;
      },
    });
  }

  onParamsChange(): void {
    this.loadProjection();
    if (this.simulation) this.simulate();
  }

  setInstallment(value: boolean): void {
    this.simInstallment = value;
    this.cdr.detectChanges();
    if (this.simulation) this.simulate();
  }

  simulate(): void {
    if (!this.simAmount || this.simAmount <= 0) {
      this.messageWarning('InvalidAmount');
      return;
    }

    const count = this.simInstallment ? this.simInstallmentsCount || 1 : 0;

    const request: SimulatePurchaseRequest = {
      amount: this.simAmount,
      purchaseDate: this.simDate,
      installment: this.simInstallment,
      installmentsCount: count,
      creditCardId: this.simCreditCardId,
      horizonMonths: this.horizonMonths,
      safetyReserve: this.safetyReserve,
    };

    const comparison: MonthlyViabilityComparisonRequest = {
      amount: this.simAmount,
      installment: this.simInstallment,
      installmentsCount: count,
      creditCardId: this.simCreditCardId,
      horizonMonths: this.horizonMonths,
      safetyReserve: this.safetyReserve,
    };

    this.isSimulating = true;
    forkJoin([
      this.planningService.simulatePurchase(request),
      this.planningService.getViabilityComparison(comparison),
    ]).subscribe({
      next: ([simRes, compRes]) => {
        this.isSimulating = false;
        this.simulation = simRes.isSuccess ? (simRes.value ?? null) : null;
        this.comparison = compRes.isSuccess ? (compRes.value?.months ?? []) : [];
        if (this.simulation) {
          if (this.safetyReserve == null) this.safetyReserve = this.simulation.safetyReserve;
          this.simChartData = this.buildChart(this.simulation);
        }
        if (!simRes.isSuccess) this.toastr.warning(simRes.message);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSimulating = false;
      },
    });
  }

  private buildChart(
    source: FinancialProjectionResponse | PurchaseSimulationResponse,
  ): ChartData<'line'> {
    const labels = source.months.map((m) => `${this.pad(m.month)}/${String(m.year).slice(2)}`);
    const probable = source.months.map((m) => this.round(m.probableClosing));
    const predicted = source.months.map((m) => this.round(m.predictedClosing));

    let data: ChartData<'line'> = { labels: [], datasets: [] };

    this.translations$.pipe(take(1)).subscribe((t) => {
      const datasets: ChartData<'line'>['datasets'] = [
        {
          label: t['Probable'],
          data: probable,
          borderColor: '#1b3c88',
          backgroundColor: 'rgba(27, 60, 136, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: probable.map((v) => (v < 0 ? '#ef4444' : '#1b3c88')),
        },
        {
          label: t['Predicted'],
          data: predicted,
          borderColor: '#1b9c63',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          fill: false,
          tension: 0.35,
          pointRadius: 0,
        },
      ];

      const reserve = this.safetyReserve;
      if (reserve != null && reserve > 0) {
        datasets.push({
          label: t['SafetyReserve'],
          data: source.months.map(() => reserve),
          borderColor: '#e0a32e',
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          fill: false,
          pointRadius: 0,
        });
      }

      data = { labels, datasets };
    });

    return data;
  }

  formatFinding(t: { [key: string]: string }, finding: ViabilityFindingResponse): string {
    let message = t[finding.messageKey] ?? '';
    const args = finding.args ?? {};

    for (const key of Object.keys(args)) {
      const value = key === 'amount' ? this.formatCurrency(Number(args[key])) : args[key];
      message = message.replace(`{${key}}`, value);
    }

    return message;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  get currentBalance(): number {
    return this.projection?.initialBalance ?? 0;
  }

  get projectedBalance(): number {
    return this.projection?.finalBalance ?? 0;
  }

  get firstRiskLabel(): string | null {
    if (!this.projection?.firstNegativeMonth || !this.projection?.firstNegativeYear) return null;
    return `${this.pad(this.projection.firstNegativeMonth)}/${this.projection.firstNegativeYear}`;
  }

  get monthlyRoom(): number {
    if (!this.projection || this.projection.months.length === 0) return 0;
    return this.round(
      (this.projection.finalBalance - this.projection.initialBalance) / this.projection.months.length,
    );
  }

  get verdict(): string {
    return this.projection?.viability.verdict ?? '';
  }

  get simVerdict(): string {
    return this.simulation?.viability.verdict ?? '';
  }

  get purchaseImpact(): number {
    if (!this.simulation) return 0;
    return this.round(this.simulation.baseFinalBalance - this.simulation.simulatedFinalBalance);
  }

  get bestMonth(): MonthViabilityResponse | null {
    if (!this.comparison.length) return null;
    const safe = this.comparison.find((m) => m.score >= 70);
    if (safe) return safe;
    return this.comparison.reduce((best, m) => (m.score > best.score ? m : best), this.comparison[0]);
  }

  monthLabel(month: MonthViabilityResponse): string {
    return `${this.pad(month.month)}/${String(month.year).slice(2)}`;
  }

  verdictClass(verdict: string): string {
    return verdict === 'Recommended' ? 'ok' : verdict === 'Attention' ? 'warn' : 'risk';
  }

  ringStyle(score: number, verdict: string): string {
    const color =
      verdict === 'Recommended' ? '#1b9c63' : verdict === 'Attention' ? '#e0a32e' : '#ef4444';
    return `conic-gradient(${color} ${score * 3.6}deg, #eef2f7 0deg)`;
  }

  rowTrend(months: ProjectionMonthResponse[], index: number): 'up' | 'down' | 'flat' {
    if (index === 0) return 'flat';
    const current = months[index].probableClosing;
    const previous = months[index - 1].probableClosing;
    return current > previous ? 'up' : current < previous ? 'down' : 'flat';
  }

  rowTrendIcon(trend: string): string {
    return trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  }

  rowDelta(months: ProjectionMonthResponse[], index: number): number {
    if (index === 0) return 0;
    return this.round(months[index].probableClosing - months[index - 1].probableClosing);
  }

  openCommitmentModal(commitment?: PlannedCommitmentResponse): void {
    const dialogRef = this.dialog.open(PlanningCommitmentModal, {
      data: { categories: this.categories, commitment: commitment ?? null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload = {
        description: result.description,
        amount: result.amount,
        direction: result.direction,
        periodicity: result.periodicity,
        startDate: result.startDate,
        endDate: result.endDate || null,
        categoryId: result.categoryId ?? null,
      };

      const request$ = result.id
        ? this.planningService.updateCommitment({ id: result.id, ...payload })
        : this.planningService.createCommitment(payload);

      request$.subscribe((res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.loadCommitments();
          this.loadProjection();
          if (this.simulation) this.simulate();
        } else {
          this.toastr.warning(res.message);
        }
      });
    });
  }

  deactivate(commitment: PlannedCommitmentResponse): void {
    this.confirmModal('Deactivate', 'ConfirmDeactivateCommitment', 'Confirm', 'Cancel').subscribe(
      (ok: boolean) => {
        if (!ok) return;

        this.planningService.deactivateCommitment(commitment.id).subscribe((res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.loadCommitments();
            this.loadProjection();
            if (this.simulation) this.simulate();
          } else {
            this.toastr.warning(res.message);
          }
        });
      },
    );
  }

  get fixedIncome(): number {
    return this.round(
      this.commitments
        .filter((c) => c.direction === 'I')
        .reduce((sum, c) => sum + this.monthlyEquivalent(c), 0),
    );
  }

  get fixedExpense(): number {
    return this.round(
      this.commitments
        .filter((c) => c.direction === 'O')
        .reduce((sum, c) => sum + this.monthlyEquivalent(c), 0),
    );
  }

  private monthlyEquivalent(c: PlannedCommitmentResponse): number {
    switch (c.periodicity) {
      case 'M':
        return c.amount;
      case 'S':
        return (c.amount * 52) / 12;
      case 'A':
        return c.amount / 12;
      default:
        return 0;
    }
  }

  isIncome(c: PlannedCommitmentResponse): boolean {
    return c.direction === 'I';
  }

  directionLabel(direction: string): string {
    return direction === 'I' ? 'Income' : 'Expense';
  }

  periodicityLabel(periodicity: string): string {
    switch (periodicity) {
      case 'U':
        return 'Once';
      case 'M':
        return 'Monthly';
      case 'S':
        return 'Weekly';
      case 'A':
        return 'Yearly';
      default:
        return '';
    }
  }
}
