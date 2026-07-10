import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Base } from '../../../core/bases/base/base';
import { MissionProgressResponse } from '../../../core/models/gamification/mission-progress-response.model';
import { GamificationService } from '../../../core/services/gamification/gamification.service';
import { interpolateNotificationText } from '../notification-bell/notification-text';

@Component({
  selector: 'app-mission-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './mission-bell.html',
  styleUrl: './mission-bell.scss',
})
export class MissionBellComponent extends Base implements OnInit {
  private gamificationService = inject(GamificationService);

  private missionsSubject = new BehaviorSubject<MissionProgressResponse[]>([]);
  missions$ = this.missionsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadMissions();
  }

  onPanelOpened(): void {
    this.loadMissions();
  }

  atRiskCount(missions: MissionProgressResponse[]): number {
    return missions.filter((m) => !m.isGain && m.isActive).length;
  }

  atRiskCountLabel(count: number, t: Record<string, string>): string {
    const template = t['MissionsAtRiskCountLabel'] ?? '{count}';
    return interpolateNotificationText(template, { count: String(count) });
  }

  missionIcon(mission: MissionProgressResponse): string {
    if (mission.isGain) return mission.isActive ? 'military_tech' : 'flag';
    return mission.isActive ? 'priority_high' : 'check_circle';
  }

  missionStatusKey(mission: MissionProgressResponse): string {
    if (mission.isGain) return mission.isActive ? 'MissionStatusAchieved' : 'MissionStatusPending';
    return mission.isActive ? 'MissionStatusAtRisk' : 'MissionStatusUnderControl';
  }

  missionStatusClass(mission: MissionProgressResponse): string {
    if (mission.isGain) return mission.isActive ? 'status-achieved' : 'status-pending';
    return mission.isActive ? 'status-risk' : 'status-ok';
  }

  private loadMissions(): void {
    this.loadingSubject.next(true);
    this.gamificationService.getActiveMissions().subscribe((result) => {
      this.loadingSubject.next(false);
      if (result.isSuccess && result.value) {
        this.missionsSubject.next(result.value);
      }
    });
  }
}
