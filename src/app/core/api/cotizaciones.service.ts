import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgregarPartidaRequest,
  CambiarEstadoRequest,
  CotizacionDetalleDto,
  CotizacionResumenDto,
  CrearCotizacionCommand,
  EstadoCotizacion
} from '../models/cotizacion.model';

@Injectable({ providedIn: 'root' })
export class CotizacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cotizaciones`;

  getAll(clienteId?: string, estado?: EstadoCotizacion): Observable<CotizacionResumenDto[]> {
    let params = new HttpParams();
    if (clienteId) params = params.set('clienteId', clienteId);
    if (estado !== undefined) params = params.set('estado', estado.toString());
    return this.http.get<CotizacionResumenDto[]>(this.base, { params });
  }

  getById(id: string): Observable<CotizacionDetalleDto> {
    return this.http.get<CotizacionDetalleDto>(`${this.base}/${id}`);
  }

  create(command: CrearCotizacionCommand): Observable<CotizacionResumenDto> {
    return this.http.post<CotizacionResumenDto>(this.base, command);
  }

  agregarPartida(id: string, request: AgregarPartidaRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/partidas`, request);
  }

  cambiarEstado(id: string, request: CambiarEstadoRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/estado`, request);
  }
}
