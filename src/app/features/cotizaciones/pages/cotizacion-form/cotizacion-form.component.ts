import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CotizacionesService } from '../../../../core/api/cotizaciones.service';
import { ClientesService } from '../../../../core/api/clientes.service';
import { ClienteDto } from '../../../../core/models/cliente.model';
import { Moneda } from '../../../../core/models/cotizacion.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

interface SelectOption { label: string; value: unknown }

@Component({
  selector: 'app-cotizacion-form',
  imports: [
    RouterLink, ReactiveFormsModule,
    ButtonModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule,
    PageHeaderComponent
  ],
  templateUrl: './cotizacion-form.component.html',
  styleUrl: './cotizacion-form.component.scss'
})
export class CotizacionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cotizacionesService = inject(CotizacionesService);
  private readonly clientesService = inject(ClientesService);

  clientes = signal<ClienteDto[]>([]);
  saving = signal(false);

  clienteOptions = signal<SelectOption[]>([]);
  readonly monedaOptions: SelectOption[] = [
    { label: 'USD — Dólar americano', value: Moneda.USD },
    { label: 'PEN — Sol peruano',     value: Moneda.PEN },
    { label: 'EUR — Euro',             value: Moneda.EUR },
  ];

  readonly form = this.fb.group({
    clienteId:    ['', [Validators.required]],
    proyecto:     ['', [Validators.required, Validators.minLength(3)]],
    ubicacion:    [''],
    fecha:        [new Date(), [Validators.required]],
    fechaValidez: [null as Date | null],
    moneda:       [Moneda.USD, [Validators.required]],
    notas:        [''],
  });

  ngOnInit(): void {
    this.clientesService.getAll().subscribe(clientes => {
      this.clientes.set(clientes);
      this.clienteOptions.set(
        clientes.filter(c => c.activo).map(c => ({ label: c.nombre, value: c.id }))
      );
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const v = this.form.getRawValue();
    const toDateOnly = (d: Date | null): string | undefined =>
      d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : undefined;

    this.cotizacionesService.create({
      clienteId:    v.clienteId!,
      proyecto:     v.proyecto!,
      ubicacion:    v.ubicacion || undefined,
      fecha:        toDateOnly(v.fecha as Date)!,
      fechaValidez: toDateOnly(v.fechaValidez),
      moneda:       v.moneda as Moneda,
      notas:        v.notas || undefined,
    }).subscribe({
      next: res => this.router.navigate(['/cotizaciones', res.id]),
      error: () => this.saving.set(false)
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
