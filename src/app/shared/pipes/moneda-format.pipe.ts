import { Pipe, PipeTransform } from '@angular/core';
import { Moneda, MONEDA_SYMBOL } from '../../core/models/cotizacion.model';

@Pipe({ name: 'monedaFormat' })
export class MonedaFormatPipe implements PipeTransform {
  transform(value: number, moneda: Moneda): string {
    const symbol = MONEDA_SYMBOL[moneda] ?? '$';
    const formatted = value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol} ${formatted}`;
  }
}
