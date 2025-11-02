
import { Routes } from '@angular/router';
import { SolitaireComponent } from './components/solitaire/solitaire.component';
import { RulesComponent } from './components/rules/rules.component';

export const routes: Routes = [
  { path: '', component: SolitaireComponent },
  { path: 'rules', component: RulesComponent },
  { path: '**', redirectTo: '' }
];
