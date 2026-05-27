import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ClientesService } from '../../../../core/api/clientes.service';
import { ClienteDto } from '../../../../core/models/cliente.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-clientes-list',
  imports: [
    FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    IconFieldModule, InputIconModule, TagModule,
    PageHeaderComponent, EmptyStateComponent
  ],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.scss'
})
export class ClientesListComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  clientes = signal<ClienteDto[]>([]);
  loading = signal(true);
  showDialog = signal(false);
  saving = signal(false);
  searchText = '';

  readonly form = this.fb.group({
    nombre:    ['', [Validators.required, Validators.minLength(2)]],
    ruc:       [''],
    email:     ['', [Validators.email]],
    telefono:  [''],
    direccion: [''],
  });

  ngOnInit(): void { this.loadClientes(); }

  loadClientes(): void {
    this.loading.set(true);
    this.clientesService.getAll().subscribe({
      next: data => { this.clientes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openDialog(): void {
    this.form.reset();
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.clientesService.create({
      nombre:    v.nombre!,
      ruc:       v.ruc || undefined,
      email:     v.email || undefined,
      telefono:  v.telefono || undefined,
      direccion: v.direccion || undefined,
    }).subscribe({
      next: () => {
        this.showDialog.set(false);
        this.saving.set(false);
        this.loadClientes();
        this.toast.add({ severity: 'success', summary: 'Cliente creado', life: 3000 });
      },
      error: () => this.saving.set(false)
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  get filtered(): ClienteDto[] {
    if (!this.searchText.trim()) return this.clientes();
    const q = this.searchText.toLowerCase();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.ruc?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }
}
