import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.facedown]="!card.faceUp"
      [class.hearts]="card.suit === 'hearts'"
      [class.diamonds]="card.suit === 'diamonds'"
      [class.clubs]="card.suit === 'clubs'"
      [class.spades]="card.suit === 'spades'"
      [class.red]="card.suit === 'hearts' || card.suit === 'diamonds'"
      [class.black]="card.suit === 'clubs' || card.suit === 'spades'"
    >
      <div *ngIf="card.faceUp" class="card-content" (dblclick)="dblClick.emit()">
        <div class="rank-top">{{ getRankDisplay() }}</div>
        <div class="suit">{{ getSuitSymbol() }}</div>
        <div class="rank-bottom">{{ getRankDisplay() }}</div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      width: 100px;
      height: 150px;
      border-radius: 8px;
      background-color: #e5e5e5;
      box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      margin: 5px;
      cursor: pointer;
    }

    .facedown {
      background-color: #f30000;
      opacity: 0.8;
      background-image: linear-gradient(135deg, #2d2d2d 25%, transparent 25%), linear-gradient(225deg, #536a0d 25%, transparent 25%), linear-gradient(45deg, #2d2d2d 25%, transparent 25%), linear-gradient(315deg, #2d2d2d 25%, #e5e5f7 25%);
      background-position: 10px 0, 10px 0, 0 0, 0 0;
      background-size: 30px 30px;
      background-repeat: repeat;
    }

    .card-content {
      width: 90%;
      height: 90%;
      position: relative;
    }

    .rank-top {
      position: absolute;
      top: 5px;
      left: 5px;
      font-weight: bold;
    }

    .rank-bottom {
      position: absolute;
      bottom: 5px;
      right: 5px;
      font-weight: bold;
      transform: rotate(180deg);
    }

    .suit {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
    }

    .red {
      color: #b62d00;
    }

    .black {
      color: black;
    }
  `]
})
export class CardComponent {
  @Input() card!: Card;
  @Output() dblClick = new EventEmitter<void>();

  getRankDisplay(): string {
    switch (this.card.rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return this.card.rank.toString();
    }
  }

  getSuitSymbol(): string {
    switch (this.card.suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  }
}
