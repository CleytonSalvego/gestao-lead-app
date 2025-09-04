import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'usuario-list',
    loadChildren: () => import('./pages/usuario/usuario-list/usuario-list.module').then( m => m.UsuarioListPageModule)
  },
  {
    path: 'usuario-create',
    loadChildren: () => import('./pages/usuario/usuario-create/usuario-create.module').then( m => m.UsuarioCreatePageModule)
  },
  {
    path: 'ordem-servico-list',
    loadChildren: () => import('./pages/ordem-servico/ordem-servico-list/ordem-servico-list.module').then( m => m.OrdemServicoListPageModule)
  },
  {
    path: 'ordem-servico-create',
    loadChildren: () => import('./pages/ordem-servico/ordem-servico-create/ordem-servico-create.module').then( m => m.OrdemServicoCreatePageModule)
  },
  {
    path: 'empresa-list',
    loadChildren: () => import('./pages/empresa/empresa-list/empresa-list.module').then( m => m.EmpresaListPageModule)
  },
  {
    path: 'empresa-create',
    loadChildren: () => import('./pages/empresa/empresa-create/empresa-create.module').then( m => m.EmpresaCreatePageModule)
  },
  {
    path: 'empresa-armadilha',
    loadChildren: () => import('./pages/empresa/empresa-armadilha/empresa-armadilha.module').then( m => m.EmpresaArmadilhaPageModule)
  },
  {
    path: 'empresa-mapa',
    loadChildren: () => import('./pages/empresa/empresa-mapa/empresa-mapa.module').then( m => m.EmpresaMapaPageModule)
  },
  {
    path: 'apontamento-armadilha',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha/apontamento-armadilha.module').then( m => m.ApontamentoArmadilhaPageModule)
  },
  {
    path: 'apontamento-armadilha-pip',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha-pip/apontamento-armadilha-pip.module').then( m => m.ApontamentoArmadilhaPipPageModule)
  },
  {
    path: 'apontamento-armadilha-luminosa',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha-luminosa/apontamento-armadilha-luminosa.module').then( m => m.ApontamentoArmadilhaLuminosaPageModule)
  },
  {
    path: 'apontamento-armadilha-feromonio',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha-feromonio/apontamento-armadilha-feromonio.module').then( m => m.ApontamentoArmadilhaFeromonioPageModule)
  },
  {
    path: 'apontamento-armadilha-tunel',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha-tunel/apontamento-armadilha-tunel.module').then( m => m.ApontamentoArmadilhaTunelPageModule)
  },
  {
    path: 'apontamento-armadilha-tunel-captura',
    loadChildren: () => import('./pages/apontamento/apontamento-armadilha-tunel-captura/apontamento-armadilha-tunel-captura.module').then( m => m.ApontamentoArmadilhaTunelCapturaPageModule)
  },
  {
    path: 'apontamento-ocorrencia',
    loadChildren: () => import('./pages/apontamento/apontamento-ocorrencia/apontamento-ocorrencia.module').then( m => m.ApontamentoOcorrenciaPageModule)
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
