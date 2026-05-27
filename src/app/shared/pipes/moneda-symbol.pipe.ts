import { Pipe, PipeTransform } from '@angular/core';
import { Moneda, MONEDA_SYMBOL } from '../../core/models/cotizacion.model';

@Pipe({ name: 'monedaSymbol' })
export class MonedaSymbolPipe implements PipeTransform {
  transform(moneda: Moneda): string {
    return MONEDA_SYMBOL[moneda] ?? '$';
  }
}
