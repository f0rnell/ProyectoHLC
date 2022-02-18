import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapaPage } from './mapa.page';

const routes: Routes = [
  {
    path: '',
    component: MapaPage
  },
  {
    path: 'home',
    redirectTo: '/home'
  },
  {
    path: 'info',
    redirectTo: '/info'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapaPageRoutingModule {}
