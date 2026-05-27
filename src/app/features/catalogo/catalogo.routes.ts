import { Routes } from '@angular/router';

export const catalogoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/catalogo-list/catalogo-list.component').then(m => m.CatalogoListComponent)
  }
];
