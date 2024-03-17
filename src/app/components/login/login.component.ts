import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public user :any ={}
  public usuario :any ={}
  public token:any

  constructor(private _router:Router,private _clienteService:ClienteService){
    this.token = localStorage.getItem('token');
    if (this.token) {
      this._router.navigate(['/'])
    }
  }


  ngOnInit(): void {

  }

  login(){
    if (!this.user.email) {
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese el email'
       })
    }else if(!this.user.password){
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:'Ingrese la contraseña'
       })
    }else{
      let data ={
        email:this.user.email,
        password:this.user.password
      }

      this._clienteService.login_cliente(data).subscribe(response=>{
       if (response.data == undefined) {
        iziToast.show({
          title:'ERROR',
          titleColor: '#FF0000',
          class:'text-danger',
          position:'topRight',
          message:response.message
         })
       }else{
        this.usuario  = response.data
        localStorage.setItem('token',response.token)
        localStorage.setItem('_id',response.data._id)

        this._clienteService.obtener_cliente_guest(response.data._id,response.token).subscribe(response=>{


        })


        this._router.navigate(['/'])
       }
      })

    }
  }
}
