import { CanActivateFn } from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ClienteService } from '../services/cliente.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor( private _router:Router,private _clienteService: ClienteService) {

  }

  canActivate():any {
   if (!this._clienteService.isAuthenticated()) {
    this._router.navigate(['/login'])
    return false
   } else {
    return true
   }
  }

};
