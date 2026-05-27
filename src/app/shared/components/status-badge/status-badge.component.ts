import { Component, input } from '@angular/core';
import { ESTADO_BADGE, ESTADO_LABEL, EstadoCotizacion } from '../../../core/models/cotizacion.model';

@Component({
  selector: 'app-status-badge',
  template: `<span [class]="'badge ' + badgeClass()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  estado = input.required<EstadoCotizacion>();

  label = () => ESTADO_LABEL[this.estado()];
  badgeClass = () => ESTADO_BADGE[this.estado()];
}
