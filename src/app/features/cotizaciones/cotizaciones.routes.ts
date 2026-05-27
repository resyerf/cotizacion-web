import { Routes } from '@angular/router';

export const cotizacionesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cotizaciones-list/cotizaciones-list.component').then(m => m.CotizacionesListComponent)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./pages/cotizacion-form/cotizacion-form.component').then(m => m.CotizacionFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/cotizacion-detalle/cotizacion-detalle.component').then(m => m.CotizacionDetalleComponent)
  },
];
