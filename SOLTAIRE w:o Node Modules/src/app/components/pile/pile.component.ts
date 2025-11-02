import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pile, Card } from '../../models/card.model';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-pile',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div
      class="pile-container"
      [class]="pile.type"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      <div class="pile-outline" *ngIf="pile.cards.length === 0"></div>
      <div
        *ngFor="let card of pile.cards; let i = index"
        [style.top.px]="getCardTopPosition(i)"
        [style.z-index]="i"
        class="card-position"
        [attr.draggable]="card.faceUp"
        (dragstart)="onDragStart($event, card, i)"
      >
        <app-card [card]="card" (click)="onCardClick(card)" (dblClick)="onCardDblClick(card)"></app-card>
      </div>
    </div>
  `,
  styles: [`
    .pile-container {
      position: relative;
      min-height: 150px;
      min-width: 100px;
      margin: 10px;
    }

    .pile-outline {
      background-color: #2a2a2a;
      width: 100px;
      height: 150px;
      border-radius: 3px;
      border: 2px dashed #4b4b4b;
      position: absolute;
    }

    .card-position {
      position: absolute;
      left: 0;
      transition: top 0.2s;
    }

    .stock, .waste, .foundation {
      min-height: 150px;
    }

    .tableau {
      min-height: 300px;
    }
  `]
})
export class PileComponent {
  @Input() pile!: Pile;
  @Input() staggered: boolean = false;
  @Output() cardClick = new EventEmitter<{card: Card, pile: Pile}>();
  @Output() cardDrop = new EventEmitter<{sourceCard: Card, sourcePileType: string, sourceIndex: number, targetPile: Pile}>();
  @Output() cardDblClick = new EventEmitter<{card: Card, pile: Pile}>();

  getCardTopPosition(index: number): number {
    if (this.staggered && this.pile.type === 'tableau') {
      return index * 25;
    }
    return 0;
  }

  onCardClick(card: Card): void {
    this.cardClick.emit({card, pile: this.pile});
  }

  onDragStart(event: DragEvent, card: Card, index: number): void {
    if (!card.faceUp) {
      event.preventDefault();
      return;
    }

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        card,
        pileType: this.pile.type,
        pileIndex: this.pile.index,
        cardIndex: index
      }));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    this.cardDrop.emit({
      sourceCard: data.card,
      sourcePileType: data.pileType,
      sourceIndex: data.cardIndex,
      targetPile: this.pile
    });
  }

  onCardDblClick(card: Card): void {
    this.cardDblClick.emit({card, pile: this.pile});
  }
}
