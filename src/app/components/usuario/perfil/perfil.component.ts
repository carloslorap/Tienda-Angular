import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast:any;
declare var $:any

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  public cliente :any ={}
  public id : any = localStorage.getItem('_id')
  public token :any = localStorage.getItem('token')


  constructor(private _clienteService:ClienteService){}

  ngOnInit(): void {
    this._clienteService.obtener_cliente_guest(this.id,this.token).subscribe(response=>{
      this.cliente = response.data
    })
  }


  actualizar(){
    this.cliente.password = $('#input_password').val()
    this._clienteService.actualizar_perfil_cliente_guest(this.id,this.cliente,this.token).subscribe(response=>{
    iziToast.show({
      title:'SUCCESS',
      titleColor: '#05B481',
      class:'text-danger',
      position:'topRight',
      message:'Se actualizaron los datos'
     })
    })




    // iziToast.show({
    //   title:'ERROR',
    //   titleColor: '#FF0000',
    //   class:'text-danger',
    //   position:'topRight',
    //   message:'Ingrese el email'
    //  })
  }

}
