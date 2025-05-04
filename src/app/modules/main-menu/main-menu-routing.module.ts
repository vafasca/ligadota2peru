import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu.component';
import { authGuard } from '../auth/guards/auth.guard';

const routes: Routes = [{ path: '', component: MainMenuComponent, canActivate: [authGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainMenuRoutingModule { }
