import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { io } from 'socket.io-client';
import { GuestService } from 'src/app/services/guest.service';
import { Router } from '@angular/router';
declare var $: any;

declare var Cleave: any;
declare var StickySidebar: any;
declare var paypal: any;
declare var iziToast: any;

interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  @ViewChild('paypalButton', { static: true }) paypalElement: ElementRef | any;

  public verificar_direccion = undefined
  public idCliente: any;
  public token: any;
  public subtotal: any = 0;
  public carrito_arr: Array<any> = [];
  public url: any;
  public total_pagar: any = 0;
  public socket = io('http://localhost:4000');

  public direccion_principal: any = {};
  public direccion: any = {
    pais: '',
    region: '',
    provincia: '',
    distrito: '',
    principal: false,
  };
  public regiones: Array<any> = [];
  public provincias: Array<any> = [];
  public distritos: Array<any> = [];

  public regiones_arr: Array<any> = [];
  public provincias_arr: Array<any> = [];
  public distritos_arr: Array<any> = [];
  public envios: Array<any> = [];
  public precio_envio = '0';
  public erro_cupon = '';
  public descuento = 0;
  public descuento_activo: any = undefined;
  public venta: any = {};
  public dventa: Array<any> = [];
  nuevoPrecioConDescuento: number | any;

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _router: Router
  ) {
    this.subtotal = 0;
    this.url = GLOBAL.url;
    this.idCliente = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    this.venta.cliente = this.idCliente;

    this._guestService.get_Envios().subscribe((response) => {
      this.envios = response;
    });
  }

  ngOnInit(): void {
    this._guestService.get_Regiones().subscribe((response) => {
      this.regiones_arr = response;
    });
    this._guestService.get_Provincias().subscribe((response) => {
      this.provincias_arr = response;
    });
    this._guestService.get_Distritros().subscribe((response) => {
      this.distritos_arr = response;
    });

    this.init_data();
    setTimeout(() => {
      new Cleave('#cc-number', {
        creditCard: true,
        onCreditCardTypeChanged: function (type: any) {},
      });

      new Cleave('#cc-exp-date', {
        date: true,
        datePattern: ['m', 'y'],
      });

      var sidebar = new StickySidebar('.sidebar-sticky', { topSpacing: 20 });
    });

    this.get_direccion_principal();

    this._clienteService
      .obtener_direccion_principal_cliente(this.idCliente, this.token)
      .subscribe((response) => {
        if (response.data == undefined) {
          this.direccion_principal = undefined;
          iziToast.show({
            title: 'WARNING',
            titleColor: '#F6D200',
            class: 'text-warning',
            position: 'topRight',
            message: 'Por favor recuerde ingresar su direccion',
          });
        } else {
          this.direccion_principal = response.data;
          this.venta.direccion = this.direccion_principal._id;
          paypal
      .Buttons({
        style: {
          layout: 'horizontal',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: 'Pago en mi tienda',
                amount: {
                  currency_code: 'USD',
                  value: this.total_pagar,
                },
              },
            ],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();

          this.venta.transaccion =
            order.purchase_units[0].payments.captures[0].id;
          console.log(this.dventa);
          this.venta.detalles = this.dventa;
          this._clienteService
            .obtener_direccion_principal_cliente(this.idCliente, this.token)
            .subscribe((response) => {
              if (response.data == undefined) {
                this.direccion_principal = undefined;
                iziToast.show({
                  title: 'ERROR',
                  titleColor: '#FF0000',
                  class: 'text-danger',
                  position: 'topRight',
                  message: 'Registre su direccion',
                });

              } else {
                this.direccion_principal = response.data;
                this.venta.direccion = this.direccion_principal._id;

                this._clienteService
                .registro_compra_cliente(this.venta, this.token)
                .subscribe((response) => {

                  this._clienteService
                    .enviar_correo_compra_cliente(response.venta._id, this.token)
                    .subscribe((response) => {
                      iziToast.show({
                        title: 'SUCCESS',
                        titleColor: '#05B481',
                        class: 'text-danger',
                        position: 'topRight',
                        message:
                          'Se realizo la compra, puede verificarlo en su correo',
                      });
                      this._router.navigate(['/']);
                    });
                });
              }
            });
        },

        onCancel: function (data: any, actions: any) {},
      })
      .render(this.paypalElement.nativeElement);
        }
      });

    this._guestService.obtener_descuento_activo().subscribe((response) => {
      if (response.data != undefined) {
        this.descuento_activo = response.data[0];
      } else {
        this.descuento_activo = undefined;
      }
    });



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
    this._guestService.get_Distritros().subscribe((response) => {
      response.forEach((element: any) => {
        if (element.province_id == this.direccion.provincia) {
          this.distritos.push(element);
          $('#sl-provincia').prop('disabled', false);
        }
      });
    });
  }

  registrar() {
    if (!this.direccion.destinatario) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el destinatario',
      });
    } else if (!this.direccion.dni) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el DNI',
      });
    } else if (!this.direccion.zip) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el ZIP',
      });
    } else if (!this.direccion.telefono) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el telefono',
      });
    } else if (!this.direccion.direccion) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese la direccion',
      });
    } else if (!this.direccion.pais) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el pais',
      });
    } else if (!this.direccion.region) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese la region',
      });
    } else if (!this.direccion.provincia) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese la provincia',
      });
    } else if (!this.direccion.distrito) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese el distrito',
      });
    } else {
      this.regiones_arr.forEach((element) => {
        if (parseInt(element.id) == parseInt(this.direccion.region)) {
          this.direccion.region = element.name;
        }
      });

      this.provincias_arr.forEach((element) => {
        if (parseInt(element.id) == parseInt(this.direccion.provincia)) {
          this.direccion.provincia = element.name;
        }
      });

      this.distritos_arr.forEach((element) => {
        if (parseInt(element.id) == parseInt(this.direccion.distrito)) {
          this.direccion.distrito = element.name;
        }
      });

      let data = {
        destinatario: this.direccion.destinatario,
        dni: this.direccion.dni,
        zip: this.direccion.zip,
        direccion: this.direccion.direccion,
        telefono: this.direccion.telefono,
        pais: this.direccion.pais,
        region: this.direccion.region,
        provincia: this.direccion.provincia,
        distrito: this.direccion.distrito,
        principal: this.direccion.principal,
        cliente: this.idCliente,
      };
      this._clienteService
        .registro_direccion_cliente(data, this.token)
        .subscribe((response) => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#05B481',
            class: 'text-danger',
            position: 'topRight',
            message: 'Se registro su direccion',
          });
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

          window.location.reload()
        });
    }
  }

  // init_data() {
  //   this._clienteService
  //     .obtener_carrito_cliente(this.idCliente, this.token)
  //     .subscribe((response) => {
  //       this.carrito_arr = response.data;
  //       this.carrito_arr.forEach((element) => {
  //         this.dventa.push({
  //           producto: element.producto._id,
  //           //pon aca el new_precio
  //           subtotal: element.producto.precio,
  //           variedad: element.variedad,
  //           cantidad: element.cantidad,
  //           cliente: this.idCliente,
  //         });
  //       });
  //       console.log(this.carrito_arr);
  //       console.log(this.dventa);

  //       this.calcular_carrito();
  //       this.calcular_total('Envio Gratis');
  //     });

  // }

  init_data() {
    this._clienteService
      .obtener_carrito_cliente(this.idCliente, this.token)
      .subscribe((response) => {
        this.carrito_arr = response.data;
        this.dventa = this.carrito_arr.map((element) => {
          this.nuevoPrecioConDescuento =
            parseInt(element.producto.precio) * parseInt(element.cantidad);

          if (
            this.descuento_activo &&
            this.descuento_activo.categoria === element.producto.categoria
          ) {
            // Aplicar descuento solo a los productos de la categoría correspondiente
            let descuento =
              (this.nuevoPrecioConDescuento * this.descuento_activo.descuento) /
              100;
            return {
              producto: element.producto._id,
              subtotal: descuento,
              variedad: element.variedad,
              cantidad: element.cantidad,
              cliente: this.idCliente,
            };
          } else {
            // Dejar el precio original para los productos que no coinciden con la categoría o no hay descuento activo
            return {
              producto: element.producto._id,
              subtotal: this.nuevoPrecioConDescuento,
              variedad: element.variedad,
              cantidad: element.cantidad,
              cliente: this.idCliente,
            };
          }
        });

        this.calcular_carrito();
        this.calcular_total('Envio Gratis');
      });
  }

  get_direccion_principal() {
    this._clienteService
      .obtener_direccion_principal_cliente(this.idCliente, this.token)
      .subscribe((response) => {
        if (response.data == undefined) {
          this.direccion_principal = undefined;

        } else {
          this.direccion_principal = response.data;
          this.venta.direccion = this.direccion_principal._id;

        }
      });
  }

  // calcular_carrito(){
  //   this.subtotal = 0
  //   if (this.descuento_activo == undefined) {
  //     this.carrito_arr.forEach(element =>{
  //       this.subtotal = this.subtotal + parseInt(element.producto.precio)
  //     })
  //   }else if(this.descuento_activo != undefined) {
  //     this.carrito_arr.forEach(element =>{
  //       let new_precio = parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100
  //       this.subtotal = this.subtotal + new_precio
  //     })
  //   }

  //   this.total_pagar = this.subtotal
  // }

  calcular_carrito() {
    this.subtotal = 0;
    let hayDescuentoActivo = false;

    this.carrito_arr.forEach(element => {
      let precioProducto = parseInt(element.producto.precio) * parseInt(element.cantidad);

      if (this.descuento_activo && this.descuento_activo.categoria === element.producto.categoria) {
        // Aplicar descuento solo a los productos de la categoría correspondiente
        let descuento = (precioProducto * this.descuento_activo.descuento) / 100;
        this.subtotal += precioProducto - descuento;
        hayDescuentoActivo = true;
      } else {
        // Dejar el precio original para los productos que no coinciden con la categoría o no hay descuento activo
        this.subtotal += precioProducto;
      }
    });

    // Si no hay descuento activo, simplemente sumar los precios originales
    if (!hayDescuentoActivo) {
      this.subtotal = this.carrito_arr.reduce((total, element) => {
        return total + parseInt(element.producto.precio) * parseInt(element.cantidad);
      }, 0);
    }

    this.total_pagar = this.subtotal;
  }


  eliminar_item(id: any) {
    this._clienteService
      .eliminar_carrito_cliente(id, this.token)
      .subscribe((response) => {
        this.socket.emit('delete-carrito', { data: response.data });
        this.init_data();
      });
  }

  // calcular_total(envio_titulo:any){
  //   this.total_pagar = parseInt(this.subtotal) + parseInt(this.precio_envio)
  //   this.venta.subtotal = this.total_pagar
  //   this.venta.envio_precio = parseInt(this.precio_envio)
  //   this.venta.envio_titulo = envio_titulo

  // }

  calcular_total(envio_titulo: any) {
    this.total_pagar = 0;

    this.carrito_arr.forEach((element) => {
      this.nuevoPrecioConDescuento =
        parseInt(element.producto.precio) * parseInt(element.cantidad);

      if (
        this.descuento_activo &&
        this.descuento_activo.categoria === element.producto.categoria
      ) {
        // Aplicar descuento solo a los productos de la categoría correspondiente
        let descuento =
          (this.nuevoPrecioConDescuento * this.descuento_activo.descuento) /
          100;
        this.total_pagar += descuento;
      } else {
        // Dejar el precio original para los productos que no coinciden con la categoría o no hay descuento activo
        this.total_pagar += this.nuevoPrecioConDescuento;
      }
    });

    // Agregar el precio de envío al total
    this.total_pagar += parseInt(this.precio_envio);

    // Actualizar la información en la venta
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;

    console.log(this.venta);
  }

  validar_cupon() {
    if (this.venta.cupon) {
      if (this.venta.cupon.toString().length <= 15) {
        //si es valido
        this.erro_cupon = '';
        this._clienteService
          .validar_cupon_cliente(this.venta.cupon, this.token)
          .subscribe((response) => {
            if (response.data != undefined) {
              this.erro_cupon = '';
              if (response.data.tipo == 'Valor fijo') {
                this.descuento = response.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              } else if (response.data.tipo == 'Porcentaje') {
                this.descuento = (this.total_pagar * response.data.valor) / 100;
                this.total_pagar = this.total_pagar - this.descuento;
              }
            } else {
              this.erro_cupon = 'El cupon no se pudo canjear';
            }
          });
      } else {
        //no es valido
        this.erro_cupon = 'El cupon deber ser menos de 15 caracteres';
      }
    } else {
      //no es valido
      this.erro_cupon = 'El cupon no es valido';
    }
  }


}
