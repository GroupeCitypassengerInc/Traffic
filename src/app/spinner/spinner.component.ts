import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../loader/loader.service';
import { HttpClient } from "@angular/common/http";


@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  constructor(private httpClient: HttpClient, public loaderService:LoaderService) { }

  ngOnInit(): void {
  }

}
