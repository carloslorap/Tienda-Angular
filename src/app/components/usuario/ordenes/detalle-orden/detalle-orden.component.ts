import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';

@Component({
  selector: 'app-detalle-orden',
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css'],
})
export class DetalleOrdenComponent implements OnInit {
  public url: any;
  public token: any = localStorage.getItem('token');
  public id: any;
  public d_ordenes: Array<any> = [];
  public orden: any = {};
  public load_data = true;

  constructor(
    private _clienteService: ClienteService,
    private _route: ActivatedRoute
  ) {
    this.url = GLOBAL.url;
    this._route.params.subscribe((params) => {
      this.id = params['id'];
      this._clienteService
        .obtener_detalles_ordenes_cliente(this.id, this.token)
        .subscribe((response) => {
          if (response.data != undefined) {
            this.orden = response.data;
            this.d_ordenes = response.detalles;
            this.load_data = false;
          }else{
            this.orden = undefined;
          }

        });
    });
  }
  ngOnInit(): void {}
}
