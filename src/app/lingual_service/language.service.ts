import { Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import * as alternative_metrics_names from '../../assets/json/metric_name_for_human.json';

const frenchRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length == 0 || pageSize == 0) { return `0 sur ${length}`; }
  
  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} sur ${length}`;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  language: string;
  site_language: string = 'English';
  language_list = [
    { 
      code: 'en', 
      label: 'English' 
    },
    { 
      code: 'fr', 
      label: 'Français' 
    }
  ];
  metric_alternative_name: any = (alternative_metrics_names as any).default;

  constructor() { }

  get_language(): string {
    this.language = window.location.pathname.split('/')[2];
    this.site_language = this.language_list.find(
      f => f.code === this.language
    ).label;
    return this.language;
  }
  
  translate_paginator(paginator: MatPaginator): MatPaginator{
    paginator._intl.firstPageLabel = 'Première page';
    paginator._intl.itemsPerPageLabel = 'Nombre d\'éléments par page';
    paginator._intl.lastPageLabel = 'Dernière page';
    paginator._intl.nextPageLabel = 'Page suivante';
    paginator._intl.previousPageLabel = 'Page précédente ';
    paginator._intl.getRangeLabel = frenchRangeLabel;
    return paginator;
  }
}
