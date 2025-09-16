import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Capacitor } from '@capacitor/core';
import { AppModule } from './app/app.module';

const initializeJeepSqlite = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    console.log('Native platform: SQLite will be initialized by database service');
    return;
  }

  try {
    console.log('Web platform: Initializing jeep-sqlite...');

    // Import and register the jeep-sqlite web component
    const jeepSqlite = await import('jeep-sqlite/loader');
    await jeepSqlite.defineCustomElements(window);

    // Ensure DOM is ready and element exists
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        const element = document.querySelector('jeep-sqlite');
        if (element && customElements.get('jeep-sqlite')) {
          if (element) {
            element.wasmPath = './assets/jeep-sqlite/'; // caminho onde está o .wasm
          }
          console.log('jeep-sqlite component ready');
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      setTimeout(checkReady, 100); // Small delay to ensure DOM is ready
    });

    console.log('jeep-sqlite web component initialized successfully');
  } catch (error) {
    console.error('Error initializing jeep-sqlite:', error);
    console.log('Database service will handle fallback');
  }
};

const initializeApp = async () => {
  console.log('Starting Angular application...');

  // Initialize jeep-sqlite first for web platform
  await initializeJeepSqlite();

  // Bootstrap the Angular application
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error('Error bootstrapping Angular:', err));
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeApp, 100); // Small delay to ensure DOM is fully ready
  });
} else {
  setTimeout(initializeApp, 100);
}
