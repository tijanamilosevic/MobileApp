import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MoviesPageRoutingModule } from './movies-routing.module';

import { MoviesPage } from './movies.page';
import {MenuComponent} from "../komponente/menu/menu.component";
import {MovieModalComponent} from "./movie-modal/movie-modal.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MoviesPageRoutingModule
  ],
  declarations: [MoviesPage, MenuComponent, MovieModalComponent],
  entryComponents: [MovieModalComponent]
})
export class MoviesPageModule {}
