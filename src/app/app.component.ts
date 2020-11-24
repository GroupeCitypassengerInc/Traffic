import { Component, Output, EventEmitter, HostListener  } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { LoaderService } from './loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  information_dad:Array<string> = [];
  _show_graph: boolean = false;
  catch_information(information:Array<string>) {
    // Information[0] = group_name | Information[1] = box_name (can be "") //
    this.information_dad = information;
    this._show_graph = true;
  }
}
