import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  open   = input(false);
  closed = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Cotizaciones', icon: 'pi pi-file-edit', route: '/cotizaciones' },
    { label: 'Clientes',     icon: 'pi pi-users',     route: '/clientes' },
    { label: 'Catálogo',     icon: 'pi pi-th-large',  route: '/catalogo' },
  ];

  close(): void { this.closed.emit(); }
}
