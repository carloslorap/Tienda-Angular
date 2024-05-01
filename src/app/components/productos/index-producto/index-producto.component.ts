import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { io } from 'socket.io-client';
import { GuestService } from 'src/app/services/guest.service';
declare var noUiSlider: any;
declare var $: any;
declare var iziToast: any;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css'],
})
export class IndexProductoComponent implements OnInit {
  public token: any = localStorage.getItem('token');
  public config_global: any = {};

  public filter_categoria = '';
  public wishlistIds: { [productId: string]: boolean } = {};
  public productos: Array<any> = [];
  public filtro_producto = '';
  public url: any;
  public filter_cat_productos = 'todos';
  public route_categoria: any;
  public pageSize = 20;
  public page = 1;
  public sort_by = 'Defecto';
  public carrito_data: any = {
    variedad: '',
    cantidad: 1,
  };
  public user_lc: any = {};
  public wishlist_data: any = {};
  public socket = io('https://servereccomersangular.onrender.com');
  public btn_cart = false;
  public descuento_activo: any = undefined;
  public load_data = true;

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _route: ActivatedRoute
  ) {
    this.url = GLOBAL.url;

    // Restaurar el estado local de la lista de deseos desde localStorage al iniciar
    const wishlistIdsString = localStorage.getItem('wishlistIds');
    if (wishlistIdsString) {
      this.wishlistIds = JSON.parse(wishlistIdsString);
    }

    this._clienteService.obtener_config_publico().subscribe((response) => {
      this.config_global = response.data;
    });

    this._route.params.subscribe((params) => {
      this.route_categoria = params['categoria'];

      if (this.route_categoria) {
        this._clienteService
          .listar_productos_publico(this.filtro_producto)
          .subscribe((response) => {
            this.productos = response.data;
            this.productos = this.productos.filter(
              (item) => item.categoria.toLowerCase() == this.route_categoria
            );
            this.load_data = false;
          });
      } else {
        this._clienteService
          .listar_productos_publico(this.filtro_producto)
          .subscribe((response) => {
            this.productos = response.data;
            this.load_data = false;
          });
      }
    });
  }

  ngOnInit(): void {
    var slider: any = document.getElementById('slider');
    setTimeout(() => {
      noUiSlider.create(slider, {
        start: [0, 1000],
        connect: true,
        range: {
          min: 0,
          max: 1000,
        },
        tooltips: [true, true],
        pips: {
          mode: 'count',
          values: 5,
        },
      });

      slider.noUiSlider.on('update', function (values: any) {
        $('.cs-range-slider-value-min').val(values[0]);
        $('.cs-range-slider-value-max').val(values[1]);
      });
    }, 300);
    $('.noUi-tooltip').css('font-size', '11px');

    this._guestService.obtener_descuento_activo().subscribe((response) => {
      if (response.data != undefined) {
        this.descuento_activo = response.data[0];
        console.log(this.descuento_activo);
      } else {
        this.descuento_activo = undefined;

        console.log(this.descuento_activo);
      }
    });
  }

  obtener_carrito() {
    this._clienteService
      .obtener_carrito_cliente(this.user_lc._id, this.token)
      .subscribe((response) => {});
  }

  buscar_categorias() {
    if (this.filter_categoria) {
      var search = new RegExp(this.filter_categoria, 'i');
      this.config_global.categorias = this.config_global.categorias.filter(
        (item: { titulo: string }) => search.test(item.titulo)
      );
    } else {
      this._clienteService.obtener_config_publico().subscribe((response) => {
        this.config_global = response.data;
        this.load_data = false;
      });
    }
  }

  buscar_producto() {
    this._clienteService
      .listar_productos_publico(this.filtro_producto)
      .subscribe((response) => {
        this.productos = response.data;
        this.load_data = false;
      });
  }

  buscar_precios() {
    this._clienteService
      .listar_productos_publico(this.filtro_producto)
      .subscribe((response) => {
        this.productos = response.data;

        let min = parseInt($('.cs-range-slider-value-min').val());
        let max = parseInt($('.cs-range-slider-value-max').val());

        this.productos = this.productos.filter((item) => {
          return item.precio >= min && item.precio <= max;
        });
      });
  }

  buscar_por_categoria() {
    if (this.filter_cat_productos == 'todos') {
      this._clienteService
        .listar_productos_publico(this.filtro_producto)
        .subscribe((response) => {
          this.productos = response.data;
          this.load_data = false;
        });
    } else {
      this._clienteService
        .listar_productos_publico(this.filtro_producto)
        .subscribe((response) => {
          this.productos = response.data;

          this.productos = this.productos.filter(
            (item) => item.categoria == this.filter_cat_productos
          );
        });
    }
  }

  reset_productos() {
    this.filtro_producto = '';
    this._clienteService.listar_productos_publico('').subscribe((response) => {
      this.productos = response.data;
      this.load_data = false;
    });
  }

  order_por() {
    if (this.sort_by == 'Defecto') {
      this._clienteService
        .listar_productos_publico('')
        .subscribe((response) => {
          this.productos = response.data;
          this.load_data = false;
        });
    } else if (this.sort_by == 'Popularidad') {
      this.productos.sort(function (a, b) {
        if (a.nventas < b.nventas) {
          return 1;
        }
        if (a.nventas > b.nventas) {
          return -1;
        }
        return 0;
      });
    } else if (this.sort_by == '+-Precio') {
      this.productos.sort(function (a, b) {
        if (a.precio < b.precio) {
          return 1;
        }
        if (a.precio > b.precio) {
          return -1;
        }
        return 0;
      });
    } else if (this.sort_by == '-+Precio') {
      this.productos.sort(function (a, b) {
        if (a.precio > b.precio) {
          return 1;
        }
        if (a.precio < b.precio) {
          return -1;
        }
        return 0;
      });
    } else if (this.sort_by == 'azTitulo') {
      this.productos.sort(function (a, b) {
        if (a.titulo > b.titulo) {
          return 1;
        }
        if (a.titulo < b.titulo) {
          return -1;
        }
        return 0;
      });
    } else if (this.sort_by == 'zaTitulo') {
      this.productos.sort(function (a, b) {
        if (a.titulo < b.titulo) {
          return 1;
        }
        if (a.titulo > b.titulo) {
          return -1;
        }
        return 0;
      });
    }
  }

  agregar_producto(producto: any) {
    if (this.carrito_data.cantidad <= producto.stock) {
      let data = {
        producto: producto._id,
        cliente: localStorage.getItem('_id'),
        cantidad: 1,
        variedad: producto.variedades[0].titulo,
      };
      this.btn_cart = true;
      this._clienteService
        .agregar_carrito_cliente(data, this.token)
        .subscribe((response) => {
          if (response.data == undefined) {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              class: 'text-danger',
              position: 'topRight',
              message: 'El producto ya existe en el carrito',
            });
            this.btn_cart = false;
          } else {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#05B481',
              class: 'text-danger',
              position: 'topRight',
              message: 'Se agrego el produto al carrito',
            });
            this.btn_cart = false;
            delete this.wishlistIds[producto._id];
            localStorage.setItem('wishlistIds', JSON.stringify(this.wishlistIds));
            this.socket.emit('add-carrito', { data: true });
          }
        });
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'El maximo disponible es:' + producto.stock,
      });
    }
  }

  agregar_wishlist(producto: any) {
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
    };
    this.btn_cart = true;
    this._clienteService
      .agregar_wishlist_cliente(data, this.token)
      .subscribe((response) => {
        if (response.data == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            class: 'text-danger',
            position: 'topRight',
            message: 'El producto ya existe en la lista de deseo',
          });
          this.btn_cart = false;
        } else {
          // this.user_new_wishList.isInWishlist = true;

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#05B481',
            class: 'text-danger',
            position: 'topRight',
            message: 'Se agrego el produto a su lista',
          });
          this.btn_cart = false;
          // Actualizar el estado local y guardar en localStorage
          this.wishlistIds[producto._id] = true;
          localStorage.setItem('wishlistIds', JSON.stringify(this.wishlistIds));

          // this.socket.emit('add-carrito',{data:true})
        }
      });
  }

  eliminarWishlist(producto: any) {
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
    };

    this._clienteService
      .eliminar_wishlist_cliente(data, this.token)
      .subscribe((response) => {
        if (response.data != undefined) {
          // Actualizar el estado local y guardar en localStorage
          delete this.wishlistIds[producto._id];
          localStorage.setItem('wishlistIds', JSON.stringify(this.wishlistIds));
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#05B481',
            class: 'text-danger',
            position: 'topRight',
            message: 'Se eliminó el producto de la lista de deseos',
          });
        } else {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            class: 'text-danger',
            position: 'topRight',
            message: 'Error al eliminar el producto de la lista de deseos',
          });
        }
      });
  }

  isWishlist(productId: string): boolean {
    return this.wishlistIds[productId] || false;
  }
}
