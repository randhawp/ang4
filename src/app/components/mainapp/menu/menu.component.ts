import { Component, OnInit } from '@angular/core';
import {StateService} from '../../../services/state.service'

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  public edited:boolean=true;

  constructor(private state:StateService) { }

  ngOnInit() {
  }

}
