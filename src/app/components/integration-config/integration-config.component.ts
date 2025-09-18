import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import {
  IntegrationProvider,
  IntegrationConfiguration,
  IntegrationField,
  IntegrationTestResult
} from '../../interfaces/integration.interface';
import { IntegrationsService } from '../../services/integrations/integrations.service';
import { DatabaseService } from '../../services/database/database.service';
import { FacebookConfigService } from '../../services/facebook-config.service';

@Component({
  selector: 'app-integration-config',
  templateUrl: './integration-config.component.html',
  styleUrls: ['./integration-config.component.scss']
})
export class IntegrationConfigComponent implements OnInit {
  @Input() provider!: IntegrationProvider;
  @Input() configuration?: IntegrationConfiguration;
  @Input() isMasked = false; // Indica se os dados estão mascarados
  @Output() saved = new EventEmitter<IntegrationConfiguration>();
  @Output() cancelled = new EventEmitter<void>();

  configForm!: FormGroup;
  fieldGroups: { [key: string]: IntegrationField[] } = {};
  isEditing = false;
  isTesting = false;
  testResult?: IntegrationTestResult;

  constructor(
    private fb: FormBuilder,
    private integrationsService: IntegrationsService,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private facebookConfigService: FacebookConfigService
  ) {}

  ngOnInit() {
    this.isEditing = !!this.configuration;
    this.setupForm();
    this.groupFields();
  }

  private setupForm() {
    const formControls: any = {
      name: [this.configuration?.name || '', Validators.required],
      capabilities: [this.configuration?.capabilities || []]
    };

    // Get default values for Facebook if not editing and provider is Facebook
    let defaultValues: { [key: string]: any } = {};
    if (!this.isEditing && this.provider.id === 'facebook') {
      defaultValues = this.facebookConfigService.getConfigForForm();
      console.log('📱 Preenchendo formulário com dados padrão do Facebook:', defaultValues);
    }

    // Create form controls for each field
    this.provider.fields.forEach(field => {
      const validators = this.getValidators(field);
      let value = this.configuration?.config?.[field.name] || '';

      // Use default value if available and not editing
      if (!this.isEditing && defaultValues[field.name]) {
        value = defaultValues[field.name];
      }

      formControls[field.name] = [value, validators];
    });

    this.configForm = this.fb.group(formControls);
  }

  private getValidators(field: IntegrationField) {
    const validators = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'url') {
      validators.push(Validators.pattern(/^https?:\/\/.+/));
    }

    if (field.validation) {
      const val = field.validation;
      if (val.pattern) {
        validators.push(Validators.pattern(val.pattern));
      }
      if (val.minLength) {
        validators.push(Validators.minLength(val.minLength));
      }
      if (val.maxLength) {
        validators.push(Validators.maxLength(val.maxLength));
      }
      if (val.min) {
        validators.push(Validators.min(val.min));
      }
      if (val.max) {
        validators.push(Validators.max(val.max));
      }
    }

    return validators;
  }

  private groupFields() {
    this.fieldGroups = {};
    
    this.provider.fields.forEach(field => {
      const group = field.group || 'general';
      if (!this.fieldGroups[group]) {
        this.fieldGroups[group] = [];
      }
      this.fieldGroups[group].push(field);
    });
  }

  getGroupTitle(groupKey: string): string {
    const groupTitles: { [key: string]: string } = {
      general: 'Configurações Gerais',
      authentication: 'Autenticação',
      business: 'Dados de Negócio',
      account: 'Conta',
      settings: 'Configurações Avançadas'
    };
    return groupTitles[groupKey] || groupKey;
  }

  getGroupKeys(): string[] {
    return Object.keys(this.fieldGroups);
  }

  shouldShowField(field: IntegrationField): boolean {
    if (!field.showWhen) return true;
    
    const dependentValue = this.configForm.get(field.showWhen.field)?.value;
    return dependentValue === field.showWhen.value;
  }

  onCapabilityChange(capabilityId: string, event: any) {
    const capabilities = this.configForm.get('capabilities')?.value || [];
    
    if (event.detail.checked) {
      if (!capabilities.includes(capabilityId)) {
        capabilities.push(capabilityId);
      }
    } else {
      const index = capabilities.indexOf(capabilityId);
      if (index > -1) {
        capabilities.splice(index, 1);
      }
    }
    
    this.configForm.patchValue({ capabilities });
  }

  isCapabilityEnabled(capabilityId: string): boolean {
    const capabilities = this.configForm.get('capabilities')?.value || [];
    return capabilities.includes(capabilityId);
  }

  async testConnection() {
    if (this.configForm.invalid) {
      const alert = await this.alertController.create({
        header: 'Formulário Inválido',
        message: 'Por favor, preencha todos os campos obrigatórios antes de testar.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Aguardando inicialização do banco de dados...'
    });
    await loading.present();

    this.isTesting = true;
    this.testResult = undefined;
    let testingLoading: HTMLIonLoadingElement | null = null;

    try {
      // Wait for database initialization
      console.log('Waiting for database initialization...');
      await this.databaseService.waitForInitialization();
      console.log('Database ready, proceeding with test...');

      await loading.dismiss();
      testingLoading = await this.loadingController.create({
        message: 'Testando conexão...'
      });
      await testingLoading.present();

      // Create temporary configuration for testing
      const tempConfig: Partial<IntegrationConfiguration> = {
        id: this.configuration?.id || 'temp',
        providerId: this.provider.id,
        name: this.configForm.value.name,
        config: this.getConfigData(),
        capabilities: this.configForm.value.capabilities
      };

      // Save temporarily if new configuration
      let configId = tempConfig.id!;
      if (!this.configuration) {
        const saved = await this.integrationsService.saveConfiguration(tempConfig).toPromise();
        configId = saved!.id;
      }

      const result = await this.integrationsService.testConfiguration(configId).toPromise();
      this.testResult = result;

      await testingLoading!.dismiss();

      if (result?.success) {
        const successAlert = await this.alertController.create({
          header: 'Teste Bem-sucedido!',
          message: 'A conexão foi estabelecida com sucesso.',
          buttons: ['OK']
        });
        await successAlert.present();
      } else {
        const errorAlert = await this.alertController.create({
          header: 'Teste Falhou',
          message: result?.error || 'Erro desconhecido na conexão.',
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    } catch (error: any) {
      console.error('Test error:', error);
      try {
        if (testingLoading) {
          await testingLoading.dismiss();
        }
      } catch (e) {
        // Loading might already be dismissed
      }

      const errorAlert = await this.alertController.create({
        header: 'Erro no Teste',
        message: error.message || 'Erro ao testar a conexão.',
        buttons: ['OK']
      });
      await errorAlert.present();
    } finally {
      this.isTesting = false;
      // Ensure no loading is left open
      try {
        const activeLoading = await this.loadingController.getTop();
        if (activeLoading) {
          await activeLoading.dismiss();
        }
      } catch (e) {
        // No active loading to dismiss
      }
    }
  }

  async save() {
    // Verificar se os dados estão mascarados
    if (this.isMasked) {
      const alert = await this.alertController.create({
        header: 'Dados Mascarados',
        message: 'Não é possível salvar alterações quando os dados estão mascarados por questões de segurança.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.configForm.invalid) {
      const alert = await this.alertController.create({
        header: 'Formulário Inválido',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Aguardando inicialização do banco de dados...'
    });
    await loading.present();

    try {
      // Wait for database initialization
      console.log('Waiting for database initialization before saving...');
      await this.databaseService.waitForInitialization();
      console.log('Database ready, proceeding with save...');

      await loading.dismiss();

      const configData: Partial<IntegrationConfiguration> = {
        id: this.configuration?.id,
        providerId: this.provider.id,
        name: this.configForm.value.name,
        config: this.getConfigData(),
        capabilities: this.configForm.value.capabilities,
        status: this.testResult?.success ? 'active' : 'inactive'
      };

      const saved = await this.integrationsService.saveConfiguration(configData).toPromise();

      if (saved) {
        const successAlert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Configuração salva com sucesso.',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.saved.emit(saved);
              return true;
            }
          }]
        });
        await successAlert.present();
      } else {
        throw new Error('Falha ao salvar configuração - resposta vazia do servidor');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      try {
        await loading.dismiss();
      } catch (e) {
        // Original loading might already be dismissed
      }

      const errorAlert = await this.alertController.create({
        header: 'Erro ao Salvar',
        message: error.message || 'Erro ao salvar a configuração.',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }

  private getConfigData(): any {
    const config: any = {};
    
    this.provider.fields.forEach(field => {
      const value = this.configForm.get(field.name)?.value;
      if (value !== null && value !== undefined && value !== '') {
        config[field.name] = value;
      }
    });

    return config;
  }

  cancel() {
    this.cancelled.emit();
  }

  getFieldErrorMessage(field: IntegrationField): string {
    const control = this.configForm.get(field.name);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${field.label} é obrigatório`;
    }
    if (control.errors['pattern']) {
      return `${field.label} tem formato inválido`;
    }
    if (control.errors['minlength']) {
      return `${field.label} deve ter pelo menos ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `${field.label} deve ter no máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  isFieldInvalid(field: IntegrationField): boolean {
    const control = this.configForm.get(field.name);
    return !!(control && control.invalid && control.touched);
  }

  getCategoryLabel(category: string): string {
    const categoryLabels: { [key: string]: string } = {
      'social-media': 'Redes Sociais',
      'advertising': 'Publicidade',
      'crm': 'CRM',
      'analytics': 'Analytics',
      'email': 'Email Marketing',
      'other': 'Outros'
    };
    return categoryLabels[category] || category;
  }

  getTestDetailsArray(details: any): Array<{ key: string; value: any }> {
    return Object.entries(details).map(([key, value]) => ({
      key: this.formatDetailKey(key),
      value: value
    }));
  }

  private formatDetailKey(key: string): string {
    const keyLabels: { [key: string]: string } = {
      'tokenValid': 'Token Válido',
      'permissions': 'Permissões',
      'pageConnected': 'Página Conectada',
      'adAccountConnected': 'Conta Publicitária Conectada',
      'customerAccessible': 'Cliente Acessível',
      'hasActiveCampaigns': 'Possui Campanhas Ativas'
    };
    return keyLabels[key] || key;
  }
}