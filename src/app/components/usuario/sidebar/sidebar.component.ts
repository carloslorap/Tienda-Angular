import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{

    public token:any = localStorage.getItem('token');
    public id: any = localStorage.getItem('_id');
    public user: any = undefined;
    public user_lc: any = {};
    public wishlist_arr :Array<any> = [];

    constructor(private _clienteService: ClienteService) {
      this._clienteService
      .obtener_cliente_guest(this.id, this.token)
    .subscribe((response) => {
      this.user = response.data;
      localStorage.setItem('user_data', JSON.stringify(this.user));
      const userDataString = localStorage.getItem('user_data');
      if (userDataString != null) {
        this.user_lc = JSON.parse(userDataString);
      } else {
        this.user_lc = undefined;
      }
    });
  }

  ngOnInit(): void {
    this.init_data()
  }

  init_data(){
    this._clienteService.obtener_wishlist_cliente(this.id,this.token).subscribe(response=>{

      this.wishlist_arr = response.data


    })
  }
}
