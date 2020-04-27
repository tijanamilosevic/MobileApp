import { Component, OnInit } from '@angular/core';
import {AlertController} from "@ionic/angular";
import {AuthService} from "../../auth/auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  constructor(public alertController: AlertController, public authService: AuthService, public router: Router) { }

  ngOnInit() {}

  odjaviSe(){
    this.alertController.create({
      header: 'Odjava',
      message: 'Da li ste sigurni da zelite da se odjavite?',
      buttons: [
        {
          text: 'Odjava',

          handler: () => {
            console.log('Odjavljen'); //napravi da se odjavi korisnik
            //odjava
            this.authService.logout();
            this.router.navigateByUrl("/log-in")
          }
        },
        {
          text: 'Odustani',
          role: 'cancel',
          handler: () => {
            console.log('odustao od odjave');
            //ovde zapravo nista ne treba da se desi...
          }
        }
      ]
    }).then((alert)=>{
      alert.present();
    });
}
}
