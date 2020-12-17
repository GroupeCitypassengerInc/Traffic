import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { DevicesTableComponent } from '../devices-table/devices-table.component';
import { LoginComponent } from '../login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'graph', children: [
    {
      path: '',
      component: DevicesTableComponent
    },
    {
      path: '',
      component: GraphComponent
    },
  ]},
  //{ path: 'graph', component: GraphComponent, outlet:'secondary' },
]; // sets up routes constant where you define your routes

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent, DevicesTableComponent]