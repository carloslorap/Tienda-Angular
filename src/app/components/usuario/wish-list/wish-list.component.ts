import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { GuestService } from 'src/app/services/guest.service';
import { io } from "socket.io-client";
declare var iziToast:any;

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css']
})
export class WishListComponent implements OnInit {

  public token:any = localStorage.getItem('token');
  public cliente_id:any = localStorage.getItem('_id');
  public wishlist_arr :Array<any> = [];
  public descuento_activo :any = undefined
  public url :any
  public btn_cart = false
  public carrito_data : any ={
    variedad: '',
    cantidad: 1
  }
  public socket = io('http://localhost:4000')

constructor(private _clienteService:ClienteService,private _guestService: GuestService){
 this.url = GLOBAL.url
}

  ngOnInit(): void {
    this.init_data()
    this._guestService.obtener_descuento_activo().subscribe(response=>{

      if (response.data != undefined) {
        this.descuento_activo = response.data[0]
        console.log(this.descuento_activo);
      }else{
        this.descuento_activo = undefined
      }


    })
  }

  init_data(){
    this._clienteService.obtener_wishlist_cliente(this.cliente_id,this.token).subscribe(response=>{

      this.wishlist_arr = response.data

    })
  }

  agregar_producto(producto:any){
    if (this.carrito_data.cantidad <= producto.stock) {
      let data = {
        producto: producto._id,
        cliente:localStorage.getItem('_id'),
        cantidad: 1,
        variedad: producto.variedades[0].titulo
      }
      this.btn_cart = true
      this._clienteService.agregar_carrito_cliente(data,this.token).subscribe(response=>{
        if (response.data == undefined) {
          iziToast.show({
            title:'ERROR',
            titleColor: '#FF0000',
            class:'text-danger',
            position:'topRight',
            message:"El producto ya existe en el carrito"
           })
           this.btn_cart = false
        }else{
          iziToast.show({
            title:'SUCCESS',
            titleColor: '#05B481',
            class:'text-danger',
            position:'topRight',
            message:'Se agrego el produto al carrito'
           })
          this.btn_cart = false
          producto.isInWishlist = false;
          this.init_data()
          this.socket.emit('add-carrito',{data:true})
        }
      })
    }else{
      iziToast.show({
        title:'ERROR',
        titleColor: '#FF0000',
        class:'text-danger',
        position:'topRight',
        message:"El maximo disponible es:" + producto.stock
       })
    }

}


  eliminarWishlist(producto: any) {
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
    };

    this._clienteService.eliminar_wishlist_cliente(data, this.token).subscribe(response => {
      if (response.data != undefined) {
        producto.isInWishlist = false;

        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#05B481',
          class: 'text-danger',
          position: 'topRight',
          message: 'Se eliminó el producto de la lista de deseos'
        });
        this.init_data()
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al eliminar el producto de la lista de deseos'
        });
      }
    });


  }
}
