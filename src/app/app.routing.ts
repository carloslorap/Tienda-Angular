import { Routes,RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { InicioComponent } from "./components/inicio/inicio.component";
import { LoginComponent } from "./components/login/login.component";
import { PerfilComponent } from "./components/usuario/perfil/perfil.component";
import {AuthGuard} from './guards/auth.guard'
import { IndexProductoComponent } from "./components/productos/index-producto/index-producto.component";
import { ShowProductoComponent } from "./components/productos/show-producto/show-producto.component";
import { CarritoComponent } from "./components/carrito/carrito.component";
import { DireccionesComponent } from "./components/usuario/direcciones/direcciones.component";
import { ContactoComponent } from "./components/contacto/contacto.component";
import { IndexOrdenesComponent } from "./components/usuario/ordenes/index-ordenes/index-ordenes.component";
import { DetalleOrdenComponent } from "./components/usuario/ordenes/detalle-orden/detalle-orden.component";
import { WishListComponent } from "./components/usuario/wish-list/wish-list.component";



const appRoute : Routes =[
  {path:'',component:InicioComponent},
  {path:'login',component:LoginComponent},
  {path:'cuenta/perfil',component:PerfilComponent,canActivate:[AuthGuard]},
  {path:'cuenta/direcciones',component:DireccionesComponent,canActivate:[AuthGuard]},
  {path:'cuenta/ordenes',component:IndexOrdenesComponent,canActivate:[AuthGuard]},
  {path:'cuenta/ordenes/:id',component:DetalleOrdenComponent,canActivate:[AuthGuard]},

  {path:'productos',component:IndexProductoComponent},
  {path:'productos/categoria/:categoria',component:IndexProductoComponent},
  {path:'productos/:slug',component:ShowProductoComponent},
  {path:'carrito',component:CarritoComponent,canActivate:[AuthGuard]},

  {path:'wish-list',component:WishListComponent,canActivate:[AuthGuard]},

  {path:'contacto',component:ContactoComponent},
]

export const appRoutingProviders :any[]=[]
export const routing:ModuleWithProviders<any> = RouterModule.forRoot(appRoute)













