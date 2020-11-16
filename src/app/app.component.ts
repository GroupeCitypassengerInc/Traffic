import { Component, Output, EventEmitter, HostListener  } from '@angular/core';
import { GraphComponent } from './graph/graph.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  information_dad:Array<string> = [  ];

  catch_information(information:Array<string>){
    // Information[0] = group_name | Information[1] = box_name (can be "") //
    this.information_dad=information;
    console.log(this.information_dad)
  }
}
