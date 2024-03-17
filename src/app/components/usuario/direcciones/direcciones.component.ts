import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';
declare var iziToast:any;
declare var $: any;

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css'],
})
export class DireccionesComponent implements OnInit {
  public token: any = localStorage.getItem('token');

  public direccion: any = {
    pais: '',
    region: '',
    provincia: '',
    distrito: '',
    principal: false,
  };
  public clienteId :any = localStorage.getItem('_id');

  public regiones: Array<any> = [];
  public provincias: Array<any> = [];
  public distritos: Array<any> = [];

  public regiones_arr: Array<any> = [];
  public provincias_arr: Array<any> = [];
  public distritos_arr: Array<any> = []
  public load_data = true


  public direcciones :Array<any> =[]

  constructor(private _guestService: GuestService,private _clienteService: ClienteService) {
    this._guestService.get_Regiones().subscribe();
  }

  ngOnInit(): void {

    this._guestService.get_Regiones().subscribe((response) => {

      this.regiones_arr = response
    });
    this._guestService.get_Provincias().subscribe((response) => {

      this.provincias_arr = response
    });
    this._guestService.get_Distritros().subscribe((response) => {

      this.distritos_arr = response
    });

    this.obtener_direccion()

  }


  obtener_direccion(){
    this._clienteService.listar_direcciones_cliente(this.clienteId,this.token).subscribe(response=>{
      this.direcciones = response.data
      this.load_data = false
    })
  }

  select_pais() {
    if (this.direccion.pais == 'Perú') {
      $('#sl-region').prop('disabled', false);
      this._guestService.get_Regiones().subscribe((response) => {
        response.forEach((element: any) => {
          this.regiones.push({
            id: element.id,
            name: element.name,
          });
        });
      });
    } else {
      $('#sl-region').prop('disabled', true);
      $('#sl-provincia').prop('disabled', true);
      $('#sl-distrito').prop('disabled', true);
      this.regiones = [];
      this.provincias = [];
      this.distritos = [];

      this.direccion.region = '';
      this.direccion.provincia = '';
      this.direccion.distrito = '';
    }
  }

  select_region() {
    this.provincias = [];
    $('#sl-distrito').prop('disabled', true);
    this.direccion.provincia = '';
    this.direccion.distrito = '';
    this._guestService.get_Provincias().subscribe((response) => {
      response.forEach((element: any) => {
        if (element.department_id == this.direccion.region) {
          this.provincias.push(element);
          $('#sl-provincia').prop('disabled', false);
        }
      });
    });
  }

  select_provincia() {
    this.distritos = [];
    $('#sl-distrito').prop('disabled', false);
    this.direccion.distrito = '';
    this._guestService.get_Distritros().subscribe(response=>{
      response.forEach((element: any) => {
        if (element.province_id == this.direccion.provincia) {
          this.distritos.push(element);
          $('#sl-provincia').prop('disabled', false);
        }
      });



    })
  }


  registrar(){
    if (!this.direccion.destinatario) {
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el destinatario'
       })
    }else if(!this.direccion.dni){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el DNI'
       })
    }else if(!this.direccion.zip){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el ZIP'
       })
    }else if(!this.direccion.telefono){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el telefono'
       })
    }else if(!this.direccion.direccion){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese la direccion'
       })
    }else if(!this.direccion.pais){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el pais'
       })
    }else if(!this.direccion.region){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese la region'
       })
    }else if(!this.direccion.provincia){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese la provincia'
       })
    }else if(!this.direccion.distrito){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el distrito'
       })
    }else {

      this.regiones_arr.forEach(element =>{
        if (parseInt(element.id)  == parseInt(this.direccion.region)) {
          this.direccion.region = element.name
        }
      })

      this.provincias_arr.forEach(element =>{
        if (parseInt(element.id)  == parseInt(this.direccion.provincia)) {
          this.direccion.provincia = element.name
        }
      })

      this.distritos_arr.forEach(element =>{
        if (parseInt(element.id)  == parseInt(this.direccion.distrito)) {
          this.direccion.distrito = element.name
        }
      })


      let data ={
        destinatario :this.direccion.destinatario,
        dni: this.direccion.dni,
        zip: this.direccion.zip,
        direccion: this.direccion.direccion,
        telefono: this.direccion.telefono,
        pais:this.direccion.pais,
        region:this.direccion.region,
        provincia:this.direccion.provincia,
        distrito:this.direccion.distrito,
        principal :this.direccion.principal,
        cliente:this.clienteId
      }
      this._clienteService.registro_direccion_cliente(data,this.token).subscribe(response=>{
        iziToast.show({
          title:'SUCCESS',
          titleColor: '#05B481',
          class:'text-danger',
          position:'topRight',
          message:'Se registro su direccion'
         })
         this.direccion = {
          pais: '',
          region: '',
          provincia: '',
          distrito: '',
          principal: false,
        };

        $('#sl-distrito').prop('disabled', true);
        $('#sl-region').prop('disabled', true);
        $('#sl-provincia').prop('disabled', true);
      })

    }
  }


  establecer_principal(id:any) {
    this._clienteService.cambiar_direccion_cliente(id,this.clienteId,this.token).subscribe(response=>{
      this.obtener_direccion()
      iziToast.show({
        title:'SUCCESS',
        titleColor: '#05B481',
        class:'text-danger',
        position:'topRight',
        message:'Se actualizo la direccion principal'
       })
    })
  }



}
