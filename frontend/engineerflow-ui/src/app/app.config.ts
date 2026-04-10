import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { 
  LucideAngularModule, LayoutDashboard, ClipboardList, Settings, LogOut, Plus, Search, 
  Filter, MoreVertical, CheckCircle2, AlertCircle, Clock, FileText, Activity, 
  ShieldCheck, User, Lock, ArrowRight, UserPlus, UserCheck, RotateCw, ArrowLeft,
  ChevronRight, ChevronDown, Check, Sun, Monitor, Moon, ShieldAlert, Bell, AlertTriangle, Info, Menu, X
} from 'lucide-angular';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
    importProvidersFrom(
      MatDialogModule,
      MatSnackBarModule,
      LucideAngularModule.pick({ 
        LayoutDashboard, ClipboardList, Settings, LogOut, Plus, Search, Filter, MoreVertical, 
        CheckCircle2, AlertCircle, Clock, FileText, Activity,
        ShieldCheck, User, Lock, ArrowRight, UserPlus, UserCheck, RotateCw, ArrowLeft,
        ChevronRight, ChevronDown, Check, Sun, Monitor, Moon, ShieldAlert, Bell, AlertTriangle, Info, Menu, X
      })
    )
  ]
};