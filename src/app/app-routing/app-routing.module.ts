import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { DevicesTableComponent } from '../devices-table/devices-table.component';
import { LoginComponent } from '../login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'graph', component: DevicesTableComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Wildcard route for a 404 page
  { path: '**', redirectTo: '/login', pathMatch: 'full' },  // Wildcard route for a 404 page

]; // sets up routes constant where you define your routes

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent, DevicesTableComponent]