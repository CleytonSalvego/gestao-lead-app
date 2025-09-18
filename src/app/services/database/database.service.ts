import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  DatabaseConfig,
  DatabaseIntegration,
  SocialMediaPageDB,
  SocialMediaPostDB,
  SocialMediaCampaignDB
} from '../../interfaces/database.interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isInitialized = new BehaviorSubject<boolean>(false);

  private readonly dbConfig: DatabaseConfig = {
    name: 'gestao_lead_db',
    version: 1,
    encrypted: false,
    mode: 'full'
  };

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database...');

      if (Capacitor.isNativePlatform()) {
        console.log('Native platform detected');
        // Native platform initialization
        try {
          const result = await CapacitorSQLite.checkConnectionsConsistency({
            dbNames: [this.dbConfig.name]
          });

          const isConn = (await this.sqlite.isConnection(this.dbConfig.name, false)).result;
          if (result.result && isConn) {
            this.db = await this.sqlite.retrieveConnection(this.dbConfig.name, false);
          } else {
            this.db = await this.sqlite.createConnection(
              this.dbConfig.name,
              this.dbConfig.encrypted,
              this.dbConfig.mode,
              this.dbConfig.version,
              false
            );
          }
        } catch (nativeError) {
          console.error('Native SQLite initialization failed:', nativeError);
          await this.initializeFallback();
          return;
        }
      } else {
        console.log('Web platform detected - attempting SQLite initialization');
        // Web platform initialization
        try {
          // Wait for jeep-sqlite to be ready and initialize web store
          await this.waitForJeepSqlite();

          this.db = await this.sqlite.createConnection(
            this.dbConfig.name,
            this.dbConfig.encrypted,
            'no-encryption',
            this.dbConfig.version,
            false
          );
        } catch (webError) {
          console.error('Web SQLite initialization failed:', webError);
          console.log('Falling back to localStorage for data persistence');
          await this.initializeFallback();
          return;
        }
      }

      await this.db.open();
      await this.createTables();

      console.log('Database initialized successfully');
      this.isInitialized.next(true);
    } catch (error) {
      console.error('Error initializing database:', error);
      await this.initializeFallback();
    }
  }

  private async waitForJeepSqlite(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('jeep-sqlite component not found after timeout'));
      }, 10000);

      const checkElement = async () => {
        const jeepSqliteEl = document.querySelector('jeep-sqlite');
        if (jeepSqliteEl && customElements.get('jeep-sqlite')) {
          clearTimeout(timeout);
          console.log('jeep-sqlite element found and ready');

          // Initialize web store for jeep-sqlite
          try {
            if (Capacitor.getPlatform() === 'web') {
              const jeepEl = document.querySelector('jeep-sqlite');
              if (jeepEl) {
                await this.sqlite.initWebStore();
              } else {
                throw new Error('jeep-sqlite element not found!');
              }
            }
            resolve();
          } catch (error) {
            console.error('Error initializing web store:', error);
            reject(error);
          }
        } else {
          setTimeout(checkElement, 200);
        }
      };

      // Start checking immediately
      checkElement();
    });
  }

  private async initializeFallback(): Promise<void> {
    console.log('🔄 Using localStorage as fallback for database operations');
    // Initialize fallback storage structure
    if (!localStorage.getItem('gestao_lead_integrations')) {
      localStorage.setItem('gestao_lead_integrations', JSON.stringify([]));
    }
    if (!localStorage.getItem('gestao_lead_pages')) {
      localStorage.setItem('gestao_lead_pages', JSON.stringify([]));
    }
    if (!localStorage.getItem('gestao_lead_posts')) {
      localStorage.setItem('gestao_lead_posts', JSON.stringify([]));
    }
    this.isInitialized.next(true);
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      console.warn('Database not initialized, skipping table creation');
      return;
    }

    const createIntegrationsTable = `
      CREATE TABLE IF NOT EXISTS integrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        configuration TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_sync DATETIME,
        metadata TEXT
      );
    `;

    const createSocialMediaPagesTable = `
      CREATE TABLE IF NOT EXISTS social_media_pages (
        id TEXT PRIMARY KEY,
        integration_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        page_id TEXT NOT NULL,
        page_name TEXT NOT NULL,
        username TEXT,
        profile_picture TEXT,
        is_connected BOOLEAN NOT NULL DEFAULT 0,
        is_verified BOOLEAN DEFAULT 0,
        followers INTEGER DEFAULT 0,
        posts INTEGER DEFAULT 0,
        engagement REAL DEFAULT 0,
        last_activity DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES integrations (id)
      );
    `;

    const createSocialMediaPostsTable = `
      CREATE TABLE IF NOT EXISTS social_media_posts (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        post_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT,
        media_urls TEXT,
        hashtags TEXT,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        reactions INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        engagement REAL DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        published_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (page_id) REFERENCES social_media_pages (id)
      );
    `;

    const createSocialMediaCampaignsTable = `
      CREATE TABLE IF NOT EXISTS social_media_campaigns (
        id TEXT PRIMARY KEY,
        integration_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        name TEXT NOT NULL,
        objective TEXT,
        status TEXT NOT NULL,
        budget_total REAL DEFAULT 0,
        budget_spent REAL DEFAULT 0,
        budget_currency TEXT DEFAULT 'BRL',
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        cpm REAL DEFAULT 0,
        cpc REAL DEFAULT 0,
        ctr REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (integration_id) REFERENCES integrations (id)
      );
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations (type);',
      'CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations (status);',
      'CREATE INDEX IF NOT EXISTS idx_social_media_pages_platform ON social_media_pages (platform);',
      'CREATE INDEX IF NOT EXISTS idx_social_media_pages_connected ON social_media_pages (is_connected);',
      'CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts (platform);',
      'CREATE INDEX IF NOT EXISTS idx_social_media_posts_published ON social_media_posts (published_at);',
      'CREATE INDEX IF NOT EXISTS idx_social_media_campaigns_status ON social_media_campaigns (status);',
    ];

    try {
      await this.db.execute(createIntegrationsTable);
      await this.db.execute(createSocialMediaPagesTable);
      await this.db.execute(createSocialMediaPostsTable);
      await this.db.execute(createSocialMediaCampaignsTable);

      // Create indexes
      for (const indexSQL of createIndexes) {
        await this.db.execute(indexSQL);
      }

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Integration methods
  async createIntegration(integration: Omit<DatabaseIntegration, 'createdAt' | 'updatedAt'>): Promise<DatabaseIntegration> {
    if (!this.db) {
      return this.createIntegrationFallback(integration);
    }

    const now = new Date();
    const integrationWithDates: DatabaseIntegration = {
      ...integration,
      createdAt: now,
      updatedAt: now
    };

    const sql = `
      INSERT INTO integrations (id, name, type, status, configuration, created_at, updated_at, last_sync, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      integrationWithDates.id,
      integrationWithDates.name,
      integrationWithDates.type,
      integrationWithDates.status,
      JSON.stringify(integrationWithDates.configuration),
      integrationWithDates.createdAt.toISOString(),
      integrationWithDates.updatedAt.toISOString(),
      integrationWithDates.lastSync?.toISOString() || null,
      integrationWithDates.metadata ? JSON.stringify(integrationWithDates.metadata) : null
    ];

    await this.db.run(sql, values);
    return integrationWithDates;
  }

  private async createIntegrationFallback(integration: Omit<DatabaseIntegration, 'createdAt' | 'updatedAt'>): Promise<DatabaseIntegration> {
    const now = new Date();
    const integrationWithDates: DatabaseIntegration = {
      ...integration,
      createdAt: now,
      updatedAt: now
    };

    const integrations = this.getIntegrationsFromStorage();
    integrations.push(integrationWithDates);
    localStorage.setItem('gestao_lead_integrations', JSON.stringify(integrations));

    return integrationWithDates;
  }

  async getIntegrations(): Promise<DatabaseIntegration[]> {
    if (!this.db) {
      return this.getIntegrationsFromStorage();
    }

    const sql = 'SELECT * FROM integrations ORDER BY created_at DESC;';
    const result = await this.db.query(sql);

    return result.values?.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      configuration: JSON.parse(row.configuration),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastSync: row.last_sync ? new Date(row.last_sync) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    })) || [];
  }

  private getIntegrationsFromStorage(): DatabaseIntegration[] {
    try {
      const stored = localStorage.getItem('gestao_lead_integrations');
      if (!stored) return [];

      return JSON.parse(stored).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        lastSync: item.lastSync ? new Date(item.lastSync) : undefined
      }));
    } catch (error) {
      console.error('Error reading integrations from localStorage:', error);
      return [];
    }
  }

  async updateIntegration(id: string, updates: Partial<DatabaseIntegration>): Promise<void> {
    if (!this.db) {
      return this.updateIntegrationFallback(id, updates);
    }

    const setClause: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && value !== undefined) {
        if (key === 'configuration' || key === 'metadata') {
          setClause.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          values.push(JSON.stringify(value));
        } else if (key === 'updatedAt' || key === 'lastSync') {
          setClause.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          values.push((value as Date).toISOString());
        } else {
          setClause.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          values.push(value);
        }
      }
    });

    if (setClause.length === 0) return;

    // Always update the updated_at timestamp
    setClause.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE integrations SET ${setClause.join(', ')} WHERE id = ?;`;
    await this.db.run(sql, values);
  }

  private async updateIntegrationFallback(id: string, updates: Partial<DatabaseIntegration>): Promise<void> {
    const integrations = this.getIntegrationsFromStorage();
    const index = integrations.findIndex(i => i.id === id);

    if (index !== -1) {
      integrations[index] = {
        ...integrations[index],
        ...updates,
        updatedAt: new Date()
      };
      localStorage.setItem('gestao_lead_integrations', JSON.stringify(integrations));
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    if (!this.db) {
      return this.deleteIntegrationFallback(id);
    }

    const sql = 'DELETE FROM integrations WHERE id = ?;';
    await this.db.run(sql, [id]);
  }

  private async deleteIntegrationFallback(id: string): Promise<void> {
    const integrations = this.getIntegrationsFromStorage();
    const filtered = integrations.filter(i => i.id !== id);
    localStorage.setItem('gestao_lead_integrations', JSON.stringify(filtered));
  }

  // Social Media Pages methods
  async createSocialMediaPage(page: Omit<SocialMediaPageDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPageDB> {
    if (!this.db) {
      return this.createSocialMediaPageFallback(page);
    }

    const now = new Date();
    const pageWithDates: SocialMediaPageDB = {
      ...page,
      createdAt: now,
      updatedAt: now
    };

    const sql = `
      INSERT INTO social_media_pages (
        id, integration_id, platform, page_id, page_name, username, profile_picture,
        is_connected, is_verified, followers, posts, engagement, last_activity,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      pageWithDates.id,
      pageWithDates.integrationId,
      pageWithDates.platform,
      pageWithDates.pageId,
      pageWithDates.pageName,
      pageWithDates.username || null,
      pageWithDates.profilePicture || null,
      pageWithDates.isConnected ? 1 : 0,
      pageWithDates.isVerified ? 1 : 0,
      pageWithDates.followers || 0,
      pageWithDates.posts || 0,
      pageWithDates.engagement || 0,
      pageWithDates.lastActivity?.toISOString() || null,
      pageWithDates.createdAt.toISOString(),
      pageWithDates.updatedAt.toISOString()
    ];

    await this.db.run(sql, values);
    return pageWithDates;
  }

  async getSocialMediaPages(): Promise<SocialMediaPageDB[]> {
    if (!this.db) {
      return this.getSocialMediaPagesFallback();
    }

    const sql = `
      SELECT p.*, i.name as integration_name, i.type as integration_type
      FROM social_media_pages p
      LEFT JOIN integrations i ON p.integration_id = i.id
      WHERE p.is_connected = 1
      ORDER BY p.created_at DESC;
    `;

    const result = await this.db.query(sql);

    return result.values?.map(row => ({
      id: row.id,
      integrationId: row.integration_id,
      platform: row.platform,
      pageId: row.page_id,
      pageName: row.page_name,
      username: row.username,
      profilePicture: row.profile_picture,
      isConnected: Boolean(row.is_connected),
      isVerified: Boolean(row.is_verified),
      followers: row.followers,
      posts: row.posts,
      engagement: row.engagement,
      lastActivity: row.last_activity ? new Date(row.last_activity) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) || [];
  }

  // Social Media Posts methods
  async getSocialMediaPosts(pageId?: string, limit: number = 10): Promise<SocialMediaPostDB[]> {
    if (!this.db) {
      return this.getSocialMediaPostsFallback(pageId, limit);
    }

    let sql = `
      SELECT * FROM social_media_posts
      WHERE is_active = 1
    `;

    const values: any[] = [];

    if (pageId) {
      sql += ' AND page_id = ?';
      values.push(pageId);
    }

    sql += ' ORDER BY published_at DESC LIMIT ?';
    values.push(limit);

    const result = await this.db.query(sql, values);

    return result.values?.map(row => ({
      id: row.id,
      pageId: row.page_id,
      platform: row.platform,
      postId: row.post_id,
      type: row.type,
      content: row.content,
      mediaUrls: row.media_urls ? JSON.parse(row.media_urls) : undefined,
      hashtags: row.hashtags ? JSON.parse(row.hashtags) : undefined,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      reactions: row.reactions,
      reach: row.reach,
      impressions: row.impressions,
      engagement: row.engagement,
      clicks: row.clicks,
      saves: row.saves,
      publishedAt: new Date(row.published_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isActive: Boolean(row.is_active)
    })) || [];
  }

  // Observable methods for reactive programming
  get isInitialized$(): Observable<boolean> {
    return this.isInitialized.asObservable();
  }

  // Utility method to check if database is ready
  async waitForInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isInitialized.value) {
        resolve();
        return;
      }

      // Set a timeout to prevent infinite waiting
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        console.warn('Database initialization timed out, forcing fallback mode');
        // Force fallback initialization
        this.initializeFallback().then(() => {
          resolve();
        });
      }, 10000); // 10 second timeout

      const subscription = this.isInitialized.subscribe((initialized) => {
        if (initialized) {
          clearTimeout(timeout);
          subscription.unsubscribe();
          resolve();
        }
      });
    });
  }

  // Fallback methods for localStorage
  private async createSocialMediaPageFallback(page: Omit<SocialMediaPageDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPageDB> {
    const now = new Date();
    const pageWithDates: SocialMediaPageDB = {
      ...page,
      createdAt: now,
      updatedAt: now
    };

    const pages = this.getSocialMediaPagesFromStorage();
    pages.push(pageWithDates);
    localStorage.setItem('gestao_lead_pages', JSON.stringify(pages));

    return pageWithDates;
  }

  private getSocialMediaPagesFallback(): SocialMediaPageDB[] {
    return this.getSocialMediaPagesFromStorage();
  }

  private getSocialMediaPagesFromStorage(): SocialMediaPageDB[] {
    try {
      const stored = localStorage.getItem('gestao_lead_pages');
      if (!stored) return [];

      return JSON.parse(stored).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        lastActivity: item.lastActivity ? new Date(item.lastActivity) : undefined
      }));
    } catch (error) {
      console.error('Error reading social media pages from localStorage:', error);
      return [];
    }
  }

  private getSocialMediaPostsFallback(pageId?: string, limit: number = 10): SocialMediaPostDB[] {
    return this.getSocialMediaPostsFromStorage(pageId, limit);
  }

  private getSocialMediaPostsFromStorage(pageId?: string, limit: number = 10): SocialMediaPostDB[] {
    try {
      const stored = localStorage.getItem('gestao_lead_posts');
      if (!stored) return [];

      let posts = JSON.parse(stored).map((item: any) => ({
        ...item,
        publishedAt: new Date(item.publishedAt),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));

      if (pageId) {
        posts = posts.filter((post: any) => post.pageId === pageId);
      }

      posts = posts.filter((post: any) => post.isActive !== false);
      posts.sort((a: any, b: any) => b.publishedAt.getTime() - a.publishedAt.getTime());

      return posts.slice(0, limit);
    } catch (error) {
      console.error('Error reading social media posts from localStorage:', error);
      return [];
    }
  }

  async createSocialMediaPost(post: Omit<SocialMediaPostDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPostDB> {
    if (!this.db) {
      return this.createSocialMediaPostFallback(post);
    }

    const now = new Date();
    const postWithDates: SocialMediaPostDB = {
      ...post,
      createdAt: now,
      updatedAt: now
    };

    const sql = `
      INSERT INTO social_media_posts (
        id, page_id, platform, post_id, type, content, media_urls, hashtags,
        likes, comments, shares, reactions, reach, impressions, engagement,
        clicks, saves, published_at, created_at, updated_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    try {
      await this.db.run(sql, [
        postWithDates.id,
        postWithDates.pageId,
        postWithDates.platform,
        postWithDates.postId,
        postWithDates.type,
        postWithDates.content,
        JSON.stringify(postWithDates.mediaUrls || []),
        JSON.stringify(postWithDates.hashtags || []),
        postWithDates.likes,
        postWithDates.comments,
        postWithDates.shares,
        postWithDates.reactions,
        postWithDates.reach,
        postWithDates.impressions,
        postWithDates.engagement,
        postWithDates.clicks,
        postWithDates.saves,
        postWithDates.publishedAt.toISOString(),
        postWithDates.createdAt.toISOString(),
        postWithDates.updatedAt.toISOString(),
        postWithDates.isActive ? 1 : 0
      ]);

      return postWithDates;
    } catch (error) {
      console.error('Error creating social media post:', error);
      throw error;
    }
  }

  async upsertSocialMediaPost(post: Omit<SocialMediaPostDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPostDB> {
    if (!this.db) {
      return this.upsertSocialMediaPostFallback(post);
    }

    const now = new Date();

    // Check if post exists
    const existingPostSQL = `SELECT created_at FROM social_media_posts WHERE id = ?`;
    try {
      const result = await this.db.query(existingPostSQL, [post.id]);

      let postWithDates: SocialMediaPostDB;

      if (result.values && result.values.length > 0) {
        // Post exists, update it
        postWithDates = {
          ...post,
          createdAt: new Date(result.values[0].created_at),
          updatedAt: now
        };

        const updateSQL = `
          UPDATE social_media_posts SET
            page_id = ?, platform = ?, post_id = ?, type = ?, content = ?,
            media_urls = ?, hashtags = ?, likes = ?, comments = ?, shares = ?,
            reactions = ?, reach = ?, impressions = ?, engagement = ?, clicks = ?,
            saves = ?, published_at = ?, updated_at = ?, is_active = ?
          WHERE id = ?
        `;

        await this.db.run(updateSQL, [
          postWithDates.pageId,
          postWithDates.platform,
          postWithDates.postId,
          postWithDates.type,
          postWithDates.content,
          JSON.stringify(postWithDates.mediaUrls || []),
          JSON.stringify(postWithDates.hashtags || []),
          postWithDates.likes,
          postWithDates.comments,
          postWithDates.shares,
          postWithDates.reactions,
          postWithDates.reach,
          postWithDates.impressions,
          postWithDates.engagement,
          postWithDates.clicks,
          postWithDates.saves,
          postWithDates.publishedAt.toISOString(),
          postWithDates.updatedAt.toISOString(),
          postWithDates.isActive ? 1 : 0,
          postWithDates.id
        ]);

        console.log('📝 Post atualizado:', post.id);
      } else {
        // Post doesn't exist, create it
        postWithDates = {
          ...post,
          createdAt: now,
          updatedAt: now
        };

        const insertSQL = `
          INSERT INTO social_media_posts (
            id, page_id, platform, post_id, type, content, media_urls, hashtags,
            likes, comments, shares, reactions, reach, impressions, engagement,
            clicks, saves, published_at, created_at, updated_at, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        await this.db.run(insertSQL, [
          postWithDates.id,
          postWithDates.pageId,
          postWithDates.platform,
          postWithDates.postId,
          postWithDates.type,
          postWithDates.content,
          JSON.stringify(postWithDates.mediaUrls || []),
          JSON.stringify(postWithDates.hashtags || []),
          postWithDates.likes,
          postWithDates.comments,
          postWithDates.shares,
          postWithDates.reactions,
          postWithDates.reach,
          postWithDates.impressions,
          postWithDates.engagement,
          postWithDates.clicks,
          postWithDates.saves,
          postWithDates.publishedAt.toISOString(),
          postWithDates.createdAt.toISOString(),
          postWithDates.updatedAt.toISOString(),
          postWithDates.isActive ? 1 : 0
        ]);

        console.log('✅ Post criado:', post.id);
      }

      return postWithDates;
    } catch (error) {
      console.error('Error upserting social media post:', error);
      throw error;
    }
  }

  private async upsertSocialMediaPostFallback(post: Omit<SocialMediaPostDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPostDB> {
    const now = new Date();
    const posts = this.getSocialMediaPostsFromStorage();

    // Check if post exists
    const existingIndex = posts.findIndex(p => p.id === post.id);

    let postWithDates: SocialMediaPostDB;

    if (existingIndex >= 0) {
      // Update existing post
      postWithDates = {
        ...post,
        createdAt: posts[existingIndex].createdAt,
        updatedAt: now
      };
      posts[existingIndex] = postWithDates;
      console.log('📝 Post atualizado (fallback):', post.id);
    } else {
      // Create new post
      postWithDates = {
        ...post,
        createdAt: now,
        updatedAt: now
      };
      posts.push(postWithDates);
      console.log('✅ Post criado (fallback):', post.id);
    }

    localStorage.setItem('gestao_lead_posts', JSON.stringify(posts));
    return postWithDates;
  }

  private async createSocialMediaPostFallback(post: Omit<SocialMediaPostDB, 'createdAt' | 'updatedAt'>): Promise<SocialMediaPostDB> {
    const now = new Date();
    const postWithDates: SocialMediaPostDB = {
      ...post,
      createdAt: now,
      updatedAt: now
    };

    const posts = this.getSocialMediaPostsFromStorage();
    posts.push(postWithDates);
    localStorage.setItem('gestao_lead_posts', JSON.stringify(posts));

    return postWithDates;
  }

  // Close database connection
  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}