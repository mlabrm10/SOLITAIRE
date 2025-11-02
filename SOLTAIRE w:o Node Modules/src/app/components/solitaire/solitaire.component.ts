import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Card, Pile } from '../../models/card.model';
import { Subscription } from 'rxjs';
import { PileComponent } from '../pile/pile.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-solitaire',
  standalone: true,
  imports: [CommonModule, PileComponent, RouterLink],
  template: `
    <div class="game-container">
      <div class="controls">
        <button (click)="newGame()">New Game</button>
        <button [routerLink]="'/rules'">Rules</button>
        <div *ngIf="isGameWon" class="win-message">You won!</div>
      </div>
      <h6 class="disc">Note: Double Click waste pile to cycle through previous cards</h6>
      <div class="top-row">
        <div class="stock-waste">
          <app-pile
            [pile]="stock"
            (cardClick)="onStockClick()"
          ></app-pile>

          <app-pile
            [pile]="waste"
            (cardClick)="onWasteCardClick($event)"
            (dblclick)="onWastePileDblClick()"
            (cardDrop)="onCardDrop($event)"
          ></app-pile>
        </div>

        <div class="foundations">
          <app-pile
            *ngFor="let foundation of foundations"
            [pile]="foundation"
            (cardDrop)="onCardDrop($event)"
          ></app-pile>
        </div>
      </div>

      <div class="tableau-row">
        <app-pile
          *ngFor="let tableau of tableaus"
          [pile]="tableau"
          [staggered]="true"
          (cardClick)="onTableauCardClick($event)"
          (cardDblClick)="onTableauCardDblClick($event)"
          (cardDrop)="onCardDrop($event)"
        ></app-pile>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background-color: #1e1e1e;
      min-height: 100vh;
      font-family: Arial, sans-serif;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      align-items: center;
    }

    button {
      padding: 10px 15px;
      background-color: #f0f0f0;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    .win-message {
      font-size: 24px;
      font-weight: bold;
      color: #4f8119;
      text-shadow: 1px 1px 2px black;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 900px;
    }

    .stock-waste {
      display: flex;
    }

    .foundations {
      display: flex;
    }

    .tableau-row {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      width: 100%;
      max-width: 900px;
    }
    .disc {
      color: grey;
      font-size: 10px;
    }
  `]
})
export class SolitaireComponent implements OnInit, OnDestroy {
  stock: Pile = { cards: [], type: 'stock' };
  waste: Pile = { cards: [], type: 'waste' };
  foundations: Pile[] = [];
  tableaus: Pile[] = [];
  isGameWon = false;

  private subscription: Subscription = new Subscription();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subscription = this.gameService.gameState$.subscribe(gameState => {
      this.stock = gameState.stock;
      this.waste = gameState.waste;
      this.foundations = gameState.foundations;
      this.tableaus = gameState.tableaus;
      this.checkWinCondition();
    });

    this.newGame();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  newGame(): void {
    this.gameService.initGame();
    this.isGameWon = false;
  }

  onStockClick(): void {
    this.gameService.drawFromStock();
  }

  onWasteCardClick(event: {card: Card, pile: Pile}): void {
    if (this.waste.cards.length === 0) return;


    this.gameService.moveWasteToFoundation();
  }

  onTableauCardClick(event: {card: Card, pile: Pile}): void {

    if (event.card.faceUp) {
      this.gameService.moveCardToFoundation(event.card, event.pile);
    }
  }


  onCardDrop(event: {sourceCard: Card, sourcePileType: string, sourceIndex: number, targetPile: Pile}): void {
    const { sourceCard, sourcePileType, targetPile } = event;


    let actualSourcePile: Pile;
    if (sourcePileType === 'waste') {
      actualSourcePile = this.waste;
    } else if (sourcePileType === 'foundation') {
      actualSourcePile = this.foundations.find(p =>
        p.cards.some(c => c.suit === sourceCard.suit && c.rank === sourceCard.rank && c.faceUp === sourceCard.faceUp))!;
    } else if (sourcePileType === 'tableau') {
      actualSourcePile = this.tableaus.find(p =>
        p.cards.some(c => c.suit === sourceCard.suit && c.rank === sourceCard.rank && c.faceUp === sourceCard.faceUp))!;
    } else {
      return;
    }


    let actualTargetPile: Pile;
    if (targetPile.type === 'foundation') {
      actualTargetPile = this.foundations[targetPile.index!];
    } else if (targetPile.type === 'tableau') {
      actualTargetPile = this.tableaus[targetPile.index!];
    } else {
      return;
    }

    this.gameService.moveCard(sourceCard, actualSourcePile, actualTargetPile);
  }

  checkWinCondition(): void {
    this.isGameWon = this.gameService.isGameWon();
  }

  //not working correctly
  onTableauCardDblClick(event: {card: Card, pile: Pile}): void {
    if (!event.card.faceUp) return;


    if (this.gameService.moveCardToFoundation(event.card, event.pile)) {
      return;
    }


    const targetTableau = this.tableaus.find(tableau => {
      if (tableau === event.pile) return false;
      return this.gameService.canMoveToTableau(event.card, tableau);
    });

    if (targetTableau) {
      this.gameService.moveCard(event.card, event.pile, targetTableau);
    }
  }

  //not working correctly
  onWasteCardDblClick(event: {card: Card, pile: Pile}): void {
    if (this.waste.cards.length === 0) return;

    const wasteCard = this.waste.cards[this.waste.cards.length - 1];


    if (this.gameService.moveCardToFoundation(wasteCard, this.waste)) {
      return;
    }


    const targetTableau = this.tableaus.find(tableau =>
      this.gameService.canMoveToTableau(wasteCard, tableau)
    );

    if (targetTableau) {
      this.gameService.moveCard(wasteCard, this.waste, targetTableau);
    }
  }

  //new dbl click functionality to cycle through waste pile
  onWastePileDblClick(): void {
    this.gameService.cycleWastePile();
  }

}

