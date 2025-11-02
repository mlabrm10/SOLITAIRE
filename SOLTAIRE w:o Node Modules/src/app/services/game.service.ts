import { Injectable } from '@angular/core';
import { Card, Suit, Rank, Pile } from '../models/card.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private deck: Card[] = [];
  private stockPile: Pile = { cards: [], type: 'stock' };
  private wastePile: Pile = { cards: [], type: 'waste' };
  private foundationPiles: Pile[] = Array(4).fill(null).map((_, i) => ({ cards: [], type: 'foundation', index: i }));
  private tableauPiles: Pile[] = Array(7).fill(null).map((_, i) => ({ cards: [], type: 'tableau', index: i }));

  private gameStateSource = new BehaviorSubject<{
    stock: Pile,
    waste: Pile,
    foundations: Pile[],
    tableaus: Pile[]
  }>({
    stock: this.stockPile,
    waste: this.wastePile,
    foundations: this.foundationPiles,
    tableaus: this.tableauPiles
  });

  public gameState$ = this.gameStateSource.asObservable();

  constructor() {
    this.initGame();
  }

  initGame(): void {

    this.deck = [];
    for (const suit of Object.values(Suit)) {
      for (let rank = 1; rank <= 13; rank++) {
        this.deck.push({
          suit: suit as Suit,
          rank: rank as Rank,
          faceUp: false
        });
      }
    }


    this.shuffle(this.deck);


    this.stockPile.cards = [];
    this.wastePile.cards = [];
    this.foundationPiles.forEach(pile => pile.cards = []);
    this.tableauPiles.forEach(pile => pile.cards = []);

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = this.deck.pop()!;

        if (j === i) {
          card.faceUp = true;
        }
        this.tableauPiles[i].cards.push(card);
      }
    }


    this.stockPile.cards = this.deck.slice();
    this.deck = [];

    this.updateGameState();
  }

  private shuffle(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  private updateGameState(): void {
    this.gameStateSource.next({
      stock: { ...this.stockPile, cards: [...this.stockPile.cards] },
      waste: { ...this.wastePile, cards: [...this.wastePile.cards] },
      foundations: this.foundationPiles.map(pile => ({ ...pile, cards: [...pile.cards] })),
      tableaus: this.tableauPiles.map(pile => ({ ...pile, cards: [...pile.cards] }))
    });
  }

  drawFromStock(): void {
    if (this.stockPile.cards.length === 0) {

      this.stockPile.cards = this.wastePile.cards.reverse().map(card => ({ ...card, faceUp: false }));
      this.wastePile.cards = [];
    } else {
      const card = this.stockPile.cards.pop()!;
      card.faceUp = true;
      this.wastePile.cards.push(card);
    }
    this.updateGameState();
  }

  canMoveToFoundation(card: Card, foundationPile: Pile): boolean {
    if (!card.faceUp) return false;

    if (foundationPile.cards.length === 0) {
      return card.rank === Rank.ACE;
    }

    const topCard = foundationPile.cards[foundationPile.cards.length - 1];
    return card.suit === topCard.suit && card.rank === topCard.rank + 1;
  }

  canMoveToTableau(card: Card, tableauPile: Pile): boolean {
    if (!card.faceUp) return false;

    if (tableauPile.cards.length === 0) {
      return card.rank === Rank.KING;
    }

    const topCard = tableauPile.cards[tableauPile.cards.length - 1];
    if (!topCard.faceUp) return false;

    const isAlternatingColor = (
      (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) &&
      (topCard.suit === Suit.CLUBS || topCard.suit === Suit.SPADES)
    ) || (
      (card.suit === Suit.CLUBS || card.suit === Suit.SPADES) &&
      (topCard.suit === Suit.HEARTS || topCard.suit === Suit.DIAMONDS)
    );

    return isAlternatingColor && card.rank === topCard.rank - 1;
  }


  moveCard(sourceCard: Card, sourcePile: Pile, targetPile: Pile): boolean {

    let actualSourcePile: Pile;
    if (sourcePile.type === 'waste') {
      actualSourcePile = this.wastePile;
    } else if (sourcePile.type === 'foundation') {
      actualSourcePile = this.foundationPiles[sourcePile.index!];
    } else if (sourcePile.type === 'tableau') {
      actualSourcePile = this.tableauPiles[sourcePile.index!];
    } else {
      return false;
    }

    const sourceIndex = actualSourcePile.cards.findIndex(c =>
      c.suit === sourceCard.suit && c.rank === sourceCard.rank && c.faceUp === sourceCard.faceUp);

    if (sourceIndex === -1) return false;


    const cardsToMove = actualSourcePile.cards.slice(sourceIndex);


    let actualTargetPile: Pile;
    if (targetPile.type === 'foundation') {
      actualTargetPile = this.foundationPiles[targetPile.index!];
      if (cardsToMove.length !== 1 || !this.canMoveToFoundation(cardsToMove[0], actualTargetPile)) {
        return false;
      }
    } else if (targetPile.type === 'tableau') {
      actualTargetPile = this.tableauPiles[targetPile.index!];
      if (!this.canMoveToTableau(cardsToMove[0], actualTargetPile)) {
        return false;
      }
    } else {
      return false;
    }


    actualTargetPile.cards.push(...cardsToMove);
    actualSourcePile.cards.splice(sourceIndex, cardsToMove.length);


    if (actualSourcePile.cards.length > 0 && actualSourcePile.type === 'tableau') {
      actualSourcePile.cards[actualSourcePile.cards.length - 1].faceUp = true;
    }

    this.updateGameState();
    return true;
  }

  moveCardToFoundation(card: Card, sourcePile: Pile): boolean {

    const foundationPile = this.foundationPiles.find(pile => {
      if (pile.cards.length === 0) {
        return card.rank === Rank.ACE;
      }
      const topCard = pile.cards[pile.cards.length - 1];
      return card.suit === topCard.suit;
    });

    if (!foundationPile) return false;

    return this.moveCard(card, sourcePile, foundationPile);
  }

  moveWasteToFoundation(): boolean {
    if (this.wastePile.cards.length === 0) return false;

    const card = this.wastePile.cards[this.wastePile.cards.length - 1];
    return this.moveCardToFoundation(card, this.wastePile);
  }

  isGameWon(): boolean {
    return this.foundationPiles.every(pile => pile.cards.length === 13);
  }

  cycleWastePile(): void {
    if (this.wastePile.cards.length > 1) {
      const topCard = this.wastePile.cards.pop()!;
      this.wastePile.cards.unshift({...topCard, faceUp: false});
      this.wastePile.cards[this.wastePile.cards.length - 1].faceUp = true;
      this.updateGameState();
    }
  }

}
