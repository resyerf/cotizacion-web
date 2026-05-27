import { Routes } from '@angular/router';

export const clientesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/clientes-list/clientes-list.component').then(m => m.ClientesListComponent)
  }
];
