import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-index-ordenes',
  templateUrl: './index-ordenes.component.html',
  styleUrls: ['./index-ordenes.component.css']
})
export class IndexOrdenesComponent implements OnInit{

  public url :any
  public token :any = localStorage.getItem('token');
  public id :any = localStorage.getItem('_id')
  public ordenes:Array<any> = [];
  public load_data = true
  public pageSize = 6;
  public page = 1;

  constructor(private _clienteService: ClienteService) {

  }

  ngOnInit(): void {
    this.init_data()
  }

  init_data(){
    this._clienteService.obtener_ordenes_cliente(this.id,this.token).subscribe(response=>{
      this.ordenes = response.data
      this.load_data = false
    })
  }
}
