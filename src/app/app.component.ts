import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, HostListener  } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { LoaderService } from './loader/loader.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  isLogged: boolean = false;
  information_dad:Array<string> = [];
  _show_graph: boolean = false;
  currentApplicationVersion = environment.appVersion;
  
  catch_information(information:Array<string>) {
    this.information_dad = information;
    this._show_graph = true;
  }
}
