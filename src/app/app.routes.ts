import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'cotizaciones', pathMatch: 'full' },
      {
        path: 'cotizaciones',
        loadChildren: () => import('./features/cotizaciones/cotizaciones.routes').then(m => m.cotizacionesRoutes)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.clientesRoutes)
      },
      {
        path: 'catalogo',
        loadChildren: () => import('./features/catalogo/catalogo.routes').then(m => m.catalogoRoutes)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
