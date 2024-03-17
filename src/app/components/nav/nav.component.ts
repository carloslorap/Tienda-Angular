import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';
declare var $: any;
declare var iziToast:any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  selected: string | any = null; // variable para almacenar el producto seleccionado
// arreglo de títulos de productos
  // states: string[] = [
  //   'Vermont',
  //   'Virginia',
  //   'Washington',
  //   'West Virginia',
  //   'Wisconsin',
  //   'Wyoming'
  // ];
  productTitles: string[] = [];
  public token: any;
  public id: any;
  public url: any;
  public user: any = undefined;
  public user_lc: any = {};
  public userDataString = localStorage.getItem('user_data');
  public config_global: any = {};
  public op_cart = false;
  public subtotal = 0
  public socket = io('http://localhost:4000')
  public descuento_activo :any = undefined
  public wishlist_arr :Array<any> = [];
  public productos: Array<any> = [];

  public carrito_arr :Array<any> = [];

  constructor(
    private _clienteService: ClienteService,
    private _router: Router,
    private _guestService: GuestService

  ) {
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id = localStorage.getItem('_id');
    if (this.userDataString != undefined) {
      this.user_lc = JSON.parse(this.userDataString);
    } else {
      this.user_lc = undefined;
    }

    this._clienteService
      .obtener_cliente_guest(this.id, this.token)
      .subscribe((response) => {
        this.user = response.data;
        localStorage.setItem('user_data', JSON.stringify(this.user));
      });

    if (this.userDataString != undefined) {
      this.user_lc = JSON.parse(this.userDataString);

      this.obtener_carrito()
    } else {
      this.user_lc = undefined;
    }

    this._clienteService.obtener_config_publico().subscribe((response) => {
      this.config_global = response.data;
    });

    this._clienteService
          .listar_productos_publico('')
          .subscribe((response) => {
            this.productos = response.data;
            this.productTitles = this.productos.map((producto: any) => producto.titulo);


          });


  }

  onProductClick(selected: any) {

    if (selected && selected.item) {
      const formattedSlug = this.formatSlug(selected.item);
      this._router.navigate(['/productos', formattedSlug]);
      this.selected = null; // Restablece el valor del input de búsqueda
      setTimeout(()=>{
        window.location.reload()
      },300)

    }
  }





  formatSlug(text: string): string {
    return text.toLowerCase()
      .replace(/\s+/g, '-') // Reemplaza espacios por guiones
      .replace(/[áäàâãåāăą]/g, 'a') // Reemplaza letras acentuadas por 'a'
      .replace(/[éëèêēĕėę]/g, 'e') // Reemplaza letras acentuadas por 'e'
      .replace(/[íïìîīĭ]/g, 'i') // Reemplaza letras acentuadas por 'i'
      .replace(/[óöòôõōŏő]/g, 'o') // Reemplaza letras acentuadas por 'o'
      .replace(/[úüùûūŭůű]/g, 'u') // Reemplaza letras acentuadas por 'u'
      .replace(/ñ/g, 'n'); // Reemplaza la letra 'ñ' por 'n'
  }


  ngOnInit(): void {




    this.socket.on('new-carrito',(data) =>{
      this.obtener_carrito()
    })

    this.socket.on('new-carrito-add',(data) =>{
      this.obtener_carrito()
    })
    this.calcular_carrito()
    this._guestService.obtener_descuento_activo().subscribe(response=>{

      if (response.data != undefined) {
        this.descuento_activo = response.data[0]

      }else{
        this.descuento_activo = undefined
      }


    })


    this.init_data_wishlist()
  }

  init_data_wishlist(){
    this._clienteService.obtener_wishlist_cliente(this.id,this.token).subscribe(response=>{

      this.wishlist_arr = response.data


    })
  }

  obtener_carrito(){
    this._clienteService.obtener_carrito_cliente(this.user_lc._id,this.token).subscribe(response=>{
      this.carrito_arr = response.data;


      this.calcular_carrito()
      })
  }

  agregar_wishlist(producto:any){

    let data = {
      producto: producto._id,
      cliente:localStorage.getItem('_id'),

    }

    this._clienteService.agregar_wishlist_cliente(data,this.token).subscribe(response=>{
      if (response.data == undefined) {
        iziToast.show({
          title:'ERROR',
          titleColor: '#FF0000',
          class:'text-danger',
          position:'topRight',
          message:"El producto ya existe en la lista de deseo"
         })

      }else{
        producto.isInWishlist = true;

        iziToast.show({
          title:'SUCCESS',
          titleColor: '#05B481',
          class:'text-danger',
          position:'topRight',
          message:'Se agrego el produto a su lista'
         })
         this.obtener_carrito()

        // this.socket.emit('add-carrito',{data:true})
      }
    })


}


  logout() {
    localStorage.clear();
    this._router.navigate(['/']);
    window.location.reload();
  }

  op_modal_cart() {
    if (!this.op_cart) {
      this.op_cart = true;
      $('#cart').addClass('show');
    } else {
      this.op_cart = false;
      $('#cart').removeClass('show');
    }
  }

  // calcular_carrito(){
  //   this.subtotal = 0
  //   if (this.descuento_activo == undefined) {
  //     this.carrito_arr.forEach(element =>{
  //       this.subtotal = this.subtotal + parseInt(element.producto.precio)
  //     })
  //   }else if(this.descuento_activo != undefined) {
  //     this.carrito_arr.forEach(element =>{
  //       let new_precio = (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100
  //       this.subtotal = this.subtotal + new_precio
  //     })
  //   }

  // }

  calcular_carrito() {
    this.subtotal = 0;

    if (this.descuento_activo) {
      this.carrito_arr.forEach(element => {
        let precioProducto = (parseInt(element.producto.precio) * parseInt(element.cantidad));

        if (this.descuento_activo && this.descuento_activo.categoria === element.producto.categoria) {
          // Aplicar descuento solo a los productos de la categoría correspondiente
          let descuento = (precioProducto * this.descuento_activo.descuento) / 100;
          this.subtotal +=  descuento;
        } else {
          // Dejar el precio original para los productos que no coinciden con la categoría o no hay descuento activo
          this.subtotal += precioProducto;
        }
      });
    }

  }

      eliminar_item(id:any){
        this._clienteService.eliminar_carrito_cliente(id,this.token).subscribe(response=>{
          this.socket.emit('delete-carrito',{data:response.data});
        })
      }
}
