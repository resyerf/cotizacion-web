import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cotizaciones`;

  exportPdf(id: string): Observable<void> {
    return this.downloadBlob(`${this.base}/${id}/pdf`, `cotizacion-${id}.pdf`);
  }

  exportExcel(id: string): Observable<void> {
    return this.downloadBlob(`${this.base}/${id}/excel`, `cotizacion-${id}.xlsx`);
  }

  private downloadBlob(url: string, fallbackName: string): Observable<void> {
    return this.http
      .get(url, { responseType: 'blob', observe: 'response' })
      .pipe(
        map(response => {
          const blob = response.body!;
          const disposition = response.headers.get('content-disposition') ?? '';
          const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/);
          const filename = match ? match[2] : fallbackName;

          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = objectUrl;
          anchor.download = filename;
          anchor.click();
          URL.revokeObjectURL(objectUrl);
        })
      );
  }
}
