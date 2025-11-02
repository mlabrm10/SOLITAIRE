import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [
    RouterLink
  ],
  template: `
    <div class="game-container">
      <div class="rules-desc">
        <h1>
          SOLITAIRE // RULES
        </h1>
        <h6>The ultimate objective is to build the whole pack of cards into the foundations, and if that can be done, the
          Solitaire game is won.</h6>
        <h6>A foundation deck is cards of a single suit built in ascending order from ace to king. Do this for all 4
          suits and the game is won.</h6>
        <h6>The rank of cards in Solitaire games is: K (high), Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2, A (low).</h6>
        <h6>The Tableau: Seven piles that make up the main table.

          The Foundations: Four piles on which a whole suit or sequence must be built up. In most Solitaire games, the
          four aces are the bottom card or base of the foundations. The foundation piles are hearts, diamonds, spades,
          and clubs.

          The Stock (or “Hand”) Pile: If the entire pack is not laid out in a tableau at the beginning of a game, the
          remaining cards form the stock pile from which additional cards are brought into play according to the rules.

          The Talon (or “Waste”) Pile: Cards from the stock pile that have no place in the tableau or on foundations are
          laid face up in the waste pile.</h6>

        <p class="footer">From: <a href="https://bicyclecards.com/how-to-play/solitaire" target="_blank">https://bicyclecards.com/how-to-play/solitaire</a></p>
        <button class="play-button" [routerLink]="'/'">Play</button>
        <a href="https://simple.wikipedia.org/wiki/Solitaire_(card_game)" target="_blank">learn more</a>

      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      background-color: #1e1e1e;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      color: lightgrey;
    }

    h6 {
      font-size: 14px;
    }

    .play-button {
      padding: 10px 30px 10px 30px;
      margin-top: 40px;
      margin-right: 30px;


      border-radius: 10px;
      background-color: forestgreen;
      border: 2px solid black;
    }

    .play-button:hover {
      background-color: rgba(34, 139, 34, 0.75);
    }

    .rules-desc {
      margin: auto;
      width: 50%;
      height: 80%;
    }

    a {
      color: steelblue;
    }

    .footer {
      font-size: 10px;
    }
  `]
})

export class RulesComponent {
}
