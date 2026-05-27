import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActividadDto,
  CrearActividadCommand,
  CrearItemCatalogoCommand,
  ItemCatalogoDto
} from '../models/catalogo.model';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/catalogo`;

  getActividades(): Observable<ActividadDto[]> {
    return this.http.get<ActividadDto[]>(`${this.base}/actividades`);
  }

  createActividad(command: CrearActividadCommand): Observable<ActividadDto> {
    return this.http.post<ActividadDto>(`${this.base}/actividades`, command);
  }

  getItems(actividadId?: string): Observable<ItemCatalogoDto[]> {
    let params = new HttpParams();
    if (actividadId) params = params.set('actividadId', actividadId);
    return this.http.get<ItemCatalogoDto[]>(`${this.base}/items`, { params });
  }

  createItem(command: CrearItemCatalogoCommand): Observable<ItemCatalogoDto> {
    return this.http.post<ItemCatalogoDto>(`${this.base}/items`, command);
  }
}
