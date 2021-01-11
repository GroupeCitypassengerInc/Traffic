import { NgModule, isDevMode } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';
import { GraphComponent } from '../graph/graph.component';
import { DevicesTableComponent } from '../devices-table/devices-table.component';
import { LoginComponent } from '../login/login.component';
import { GuardService } from '../auth_services/guard.service';
import { environment } from '../../environments/environment';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'graph', component: DevicesTableComponent },
  { path: 'graph/:visualize', component: DevicesTableComponent },
  { path: 'graph/:group/:metric', component: DevicesTableComponent },
  { path: 'graph', canActivate: [GuardService], component: DevicesTableComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Wildcard route for a 404 page
  { path: '**', redirectTo: '/login', pathMatch: 'full' },  // Wildcard route for a 404 page
]; // sets up routes constant where you define your routes


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
export const routingComponents = [LoginComponent, DevicesTableComponent]