import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast: any;

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {

  public contacto:any ={}

  constructor(private _clienteService:ClienteService){}

  ngOnInit(): void {

  }

  enviar_asunto(){
    this._clienteService.enviar_mensaje_contacto(this.contacto).subscribe(response=>{
      iziToast.show({
        title:'SUCCESS',
        titleColor: '#05B481',
        class:'text-danger',
        position:'topRight',
        message:'Se envio su mensaje'
       })
    })
    this.contacto ={}
  }

}
