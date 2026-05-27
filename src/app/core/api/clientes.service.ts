import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarClienteCommand, ClienteDto, CrearClienteCommand } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  getAll(): Observable<ClienteDto[]> {
    return this.http.get<ClienteDto[]>(this.base);
  }

  create(command: CrearClienteCommand): Observable<ClienteDto> {
    return this.http.post<ClienteDto>(this.base, command);
  }

  update(id: string, body: ActualizarClienteCommand): Observable<ClienteDto> {
    return this.http.put<ClienteDto>(`${this.base}/${id}`, body);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
