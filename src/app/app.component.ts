import { Component, Output, EventEmitter, HostListener  } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  box_name:string ='debug';
  catch_name(box_name:string){
    this.box_name=box_name;
    console.log('dad : ' + this.box_name);
  }
}
