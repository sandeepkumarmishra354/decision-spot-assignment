import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal('');

  // Form state
  showForm = signal(false);
  editingUser = signal<User | null>(null);
  formName = signal('');
  formEmail = signal('');
  formPassword = signal('');
  formError = signal('');
  formLoading = signal(false);

  // Delete confirmation
  deletingId = signal<number | null>(null);

  isEditing = computed(() => this.editingUser() !== null);
  formTitle = computed(() => (this.isEditing() ? 'Edit User' : 'Add User'));

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  openAddForm(): void {
    this.editingUser.set(null);
    this.formName.set('');
    this.formEmail.set('');
    this.formPassword.set('');
    this.formError.set('');
    this.showForm.set(true);
  }

  openEditForm(user: User): void {
    this.editingUser.set(user);
    this.formName.set(user.name);
    this.formEmail.set(user.email);
    this.formPassword.set('');
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  submitForm(): void {
    this.formError.set('');
    this.formLoading.set(true);

    if (this.isEditing()) {
      const user = this.editingUser()!;
      this.userService
        .updateUser(user.id, {
          name: this.formName(),
          email: this.formEmail(),
        })
        .subscribe({
          next: () => {
            this.formLoading.set(false);
            this.closeForm();
            this.loadUsers();
          },
          error: (err) => {
            this.formLoading.set(false);
            this.formError.set(
              err.error?.error || 'Failed to update user.',
            );
          },
        });
    } else {
      this.userService
        .createUser({
          name: this.formName(),
          email: this.formEmail(),
          password: this.formPassword(),
        })
        .subscribe({
          next: () => {
            this.formLoading.set(false);
            this.closeForm();
            this.loadUsers();
          },
          error: (err) => {
            this.formLoading.set(false);
            this.formError.set(
              err.error?.error || 'Failed to create user.',
            );
          },
        });
    }
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.deletingId.set(null);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
