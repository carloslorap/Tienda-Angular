import { Pipe, PipeTransform, EventEmitter } from '@angular/core';

@Pipe({
  name: 'descuento'
})
export class DescuentoPipe implements PipeTransform {
  new_precio: number | any;
  newPrecioEmitter = new EventEmitter<number>();

  transform(value: any, descuentoPorcentaje: any): any {
    if (!descuentoPorcentaje) {
      return value;
    }

    const descuento = Math.round((value * descuentoPorcentaje) / 100);
    this.new_precio = value - descuento;

    // Emitir el nuevo precio con descuento
    this.newPrecioEmitter.emit(this.new_precio);

    return this.new_precio;
  }
}
