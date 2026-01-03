// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v23.1 — ZUSTAND STORE
// SOTA Enterprise State Management with Immer
// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES:
// • Dual Optimization Modes (Surgical / Full Rewrite)
// • Image Preservation Settings
// • Semantic Cache with TTL
// • Token Budget Tracking
// • Processing Lock (Mutex)
// • Enhanced Job State Management
// • Autonomous Mode Configuration
// • Geographic Targeting (GEO)
// • NeuronWriter NLP Integration
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
    SitemapPage, WpConfig, ApiKeys, Provider, Toast, 
    GodModePhase, NeuronTerm, PublishMode, GodModeJobState, 
    AutonomousConfig, CacheEntry, GeoTargetConfig, ProcessingLock,
    APP_VERSION, EntityGapAnalysis, ValidatedReference, NeuronAnalysisResult
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 NEW: OPTIMIZATION MODE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type OptimizationMode = 'full_rewrite' | 'surgical';

export interface OptimizationModeConfig {
    mode: OptimizationMode;
    preserveImages: boolean;
    optimizeAltText: boolean;
    preserveFeaturedImage: boolean;
    preserveSlug: boolean;
    preserveCategories: boolean;
    preserveTags: boolean;
    preserveGoodSections: boolean;
    minSectionWordCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖼️ IMAGE PRESERVATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImagePreservationData {
    featuredImageId: number | null;
    featuredImageUrl: string | null;
    contentImages: Array<{
        src: string;
        alt: string;
        mediaId?: number;
        optimizedAlt?: string;
    }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SEMANTIC CACHE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SemanticCacheEntry<T> {
    data: T;
    timestamp: number;
}

export interface SemanticCache {
    entityGap: Record<string, SemanticCacheEntry<EntityGapAnalysis>>;
    references: Record<string, SemanticCacheEntry<ValidatedReference[]>>;
    neuron: Record<string, SemanticCacheEntry<NeuronAnalysisResult>>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💰 TOKEN BUDGET TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface TokenBudget {
    used: number;
    limit: number;
    sessionStart: number;
    costEstimate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 GLOBAL STATS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GlobalStats {
    totalProcessed: number;
    totalImproved: number;
    avgScoreIncrease: number;
    lastRunTime: number;
    totalWordsGenerated: number;
    successRate: number;
    totalImagesPreserved: number;
    totalAltTextsOptimized: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

interface AppState {
    // Version
    version: string;
    
    // Data
    pages: SitemapPage[];
    selectedIds: Record<string, boolean>;
    cache: Record<string, CacheEntry<any>>;
    semanticCache: SemanticCache;
    tokenBudget: TokenBudget;
    
    // Configuration
    wpConfig: WpConfig;
    apiKeys: ApiKeys;
    autonomousConfig: AutonomousConfig;
    geoConfig: GeoTargetConfig;
    
    // 🔥 NEW: Optimization Mode Configuration
    optimizationMode: OptimizationMode;
    optimizationConfig: OptimizationModeConfig;
    
    // UI State
    activeView: 'setup' | 'strategy' | 'review' | 'analytics';
    strategyTab: 'hub' | 'bulk' | 'single' | 'godmode' | 'autonomous';
    selectedProvider: Provider;
    selectedModel: string;
    useSearchGrounding: boolean;
    neuronEnabled: boolean;
    neuronTerms: NeuronTerm[];
    isProcessing: boolean;
    processingStatus: string;
    godModePhase: GodModePhase;
    godModeLog: string[];
    toasts: Toast[];
    publishMode: PublishMode;
    autonomousRunning: boolean;
    processingLock: ProcessingLock;
    
    // Statistics
    globalStats: GlobalStats;

    // ═══════════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    // Toast Actions
    addToast: (message: string, type: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
    
    // Logging Actions
    addGodLog: (msg: string) => void;
    clearGodLog: () => void;
    setGodPhase: (phase: GodModePhase) => void;
    
    // Page Management
    setPages: (pages: SitemapPage[]) => void;
    addPages: (newPages: SitemapPage[]) => void;
    updatePage: (id: string, updates: Partial<SitemapPage>) => void;
    removePage: (id: string) => void;
    clearPages: () => void;
    
    // Job State Management
    initJobState: (pageId: string) => void;
    addJobLog: (pageId: string, msg: string) => void;
    updateJobState: (pageId: string, updates: Partial<GodModeJobState>) => void;
    
    // Selection Management
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    
    // Configuration Setters
    setApiKey: (provider: keyof ApiKeys, key: string) => void;
    setWpConfig: (config: Partial<WpConfig>) => void;
    setAutonomousConfig: (config: Partial<AutonomousConfig>) => void;
    setGeoConfig: (config: Partial<GeoTargetConfig>) => void;
    
    // 🔥 NEW: Optimization Mode Actions
    setOptimizationMode: (mode: OptimizationMode) => void;
    setOptimizationConfig: (config: Partial<OptimizationModeConfig>) => void;
    
    // UI State Setters
    setActiveView: (view: AppState['activeView']) => void;
    setStrategyTab: (tab: AppState['strategyTab']) => void;
    setSelectedProvider: (provider: Provider) => void;
    setSelectedModel: (model: string) => void;
    setSearchGrounding: (enabled: boolean) => void;
    setNeuronEnabled: (enabled: boolean) => void;
    setNeuronTerms: (terms: NeuronTerm[]) => void;
    setProcessing: (isProcessing: boolean, status?: string) => void;
    setPublishMode: (mode: PublishMode) => void;
    setAutonomousRunning: (running: boolean) => void;
    
    // Processing Lock (Mutex)
    acquireLock: (lockedBy: string) => boolean;
    releaseLock: (lockedBy: string) => void;
    
    // Autonomous Mode
    getNextTarget: () => SitemapPage | null;
    
    // 🔥 ENHANCED: Semantic Cache Actions
    setSemanticCache: <T extends keyof SemanticCache>(
        type: T, 
        key: string, 
        data: SemanticCache[T][string]['data']
    ) => void;
    getSemanticCache: <T extends keyof SemanticCache>(
        type: T, 
        key: string, 
        maxAge?: number
    ) => SemanticCache[T][string]['data'] | null;
    clearSemanticCache: (type?: keyof SemanticCache) => void;
    
    // Token Budget Actions
    trackTokenUsage: (tokens: number, cost?: number) => void;
    resetTokenBudget: () => void;
    
    // Standard Cache Actions
    setCache: <T>(key: string, data: T, ttl?: number) => void;
    getCache: <T>(key: string) => T | null;
    clearCache: () => void;
    
    // Statistics
    updateGlobalStats: (updates: Partial<GlobalStats>) => void;
    
    // Reset
    resetStore: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_AUTONOMOUS_CONFIG: AutonomousConfig = {
    enabled: false,
    targetScore: 85,
    maxRetriesPerPage: 4,
    delayBetweenPages: 8000,
    processNewPagesOnly: false,
    pauseOnError: true,
    prioritizeByOpportunity: true,
    minWordCount: 4500,
    maxConcurrent: 1,
    enableAEO: true,
    enableGEO: false,
};

const DEFAULT_GEO_CONFIG: GeoTargetConfig = {
    enabled: false,
    country: 'US',
    region: '',
    city: '',
    language: 'en',
    serviceAreas: [],
};

const DEFAULT_API_KEYS: ApiKeys = {
    google: '',
    openai: '',
    anthropic: '',
    openrouter: '',
    groq: '',
    serper: '',
    neuronwriter: '',
    neuronProject: '',
    openrouterModel: 'google/gemini-2.5-flash-preview',
    groqModel: 'llama-3.3-70b-versatile'
};

const DEFAULT_WP_CONFIG: WpConfig = {
    url: '',
    username: '',
    password: '',
    orgName: '',
    logoUrl: '',
    authorName: '',
    authorPageUrl: '',
    defaultCategory: undefined,
    industry: '',
    targetAudience: ''
};

const DEFAULT_PROCESSING_LOCK: ProcessingLock = {
    isLocked: false,
    lockedAt: null,
    lockedBy: null
};

// 🔥 NEW: Default Optimization Config
const DEFAULT_OPTIMIZATION_CONFIG: OptimizationModeConfig = {
    mode: 'surgical',
    preserveImages: true,
    optimizeAltText: true,
    preserveFeaturedImage: true,
    preserveSlug: true,
    preserveCategories: true,
    preserveTags: true,
    preserveGoodSections: true,
    minSectionWordCount: 150
};

const DEFAULT_SEMANTIC_CACHE: SemanticCache = {
    entityGap: {},
    references: {},
    neuron: {}
};

const DEFAULT_TOKEN_BUDGET: TokenBudget = {
    used: 0,
    limit: 1000000,
    sessionStart: Date.now(),
    costEstimate: 0
};

const DEFAULT_GLOBAL_STATS: GlobalStats = {
    totalProcessed: 0,
    totalImproved: 0,
    avgScoreIncrease: 0,
    lastRunTime: 0,
    totalWordsGenerated: 0,
    successRate: 100,
    totalImagesPreserved: 0,
    totalAltTextsOptimized: 0
};

// ═══════════════════════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════════════════════

export const useAppStore = create<AppState>()(
    persist(
        immer((set, get) => ({
            // ═══════════════════════════════════════════════════════════════
            // INITIAL STATE
            // ═══════════════════════════════════════════════════════════════
            
            version: APP_VERSION,
            
            // Data
            pages: [],
            selectedIds: {},
            cache: {},
            semanticCache: DEFAULT_SEMANTIC_CACHE,
            tokenBudget: DEFAULT_TOKEN_BUDGET,
            
            // Configuration
            wpConfig: DEFAULT_WP_CONFIG,
            apiKeys: DEFAULT_API_KEYS,
            autonomousConfig: DEFAULT_AUTONOMOUS_CONFIG,
            geoConfig: DEFAULT_GEO_CONFIG,
            
            // 🔥 NEW: Optimization Mode
            optimizationMode: 'surgical' as OptimizationMode,
            optimizationConfig: DEFAULT_OPTIMIZATION_CONFIG,
            
            // UI State
            activeView: 'setup' as const,
            strategyTab: 'godmode' as const,
            selectedProvider: 'google' as Provider,
            selectedModel: 'gemini-2.5-flash-preview-05-20',
            useSearchGrounding: true,
            neuronEnabled: false,
            neuronTerms: [],
            isProcessing: false,
            processingStatus: '',
            godModePhase: 'idle' as GodModePhase,
            godModeLog: [],
            toasts: [],
            publishMode: 'draft' as PublishMode,
            autonomousRunning: false,
            processingLock: DEFAULT_PROCESSING_LOCK,
            globalStats: DEFAULT_GLOBAL_STATS,

            // ═══════════════════════════════════════════════════════════════
            // TOAST ACTIONS
            // ═══════════════════════════════════════════════════════════════

            addToast: (message, type, duration = 5000) => set(state => {
                const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                state.toasts.push({ id, message, type, duration });
                // Keep max 5 toasts
                if (state.toasts.length > 5) {
                    state.toasts.shift();
                }
            }),
            
            removeToast: (id) => set(state => {
                state.toasts = state.toasts.filter(t => t.id !== id);
            }),

            // ═══════════════════════════════════════════════════════════════
            // LOGGING ACTIONS
            // ═══════════════════════════════════════════════════════════════
            
            addGodLog: (msg) => set(state => {
                const timestamp = new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                });
                state.godModeLog.push(`[${timestamp}] ${msg}`);
                // Keep max 2000 entries for performance
                if (state.godModeLog.length > 2000) {
                    state.godModeLog = state.godModeLog.slice(-1500);
                }
            }),
            
            clearGodLog: () => set({ godModeLog: [] }),
            
            setGodPhase: (phase) => set({ godModePhase: phase }),

            // ═══════════════════════════════════════════════════════════════
            // PAGE MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            setPages: (pages) => set({ 
                pages: pages.map(p => ({ 
                    ...p, 
                    improvementHistory: p.improvementHistory || [] 
                })) 
            }),
            
            addPages: (newPages) => set((state) => {
                const existingUrls = new Set(state.pages.map(p => p.id));
                const unique = newPages
                    .filter(p => !existingUrls.has(p.id))
                    .map(p => ({
                        ...p, 
                        improvementHistory: p.improvementHistory || []
                    }));
                state.pages.push(...unique);
            }),
            
            updatePage: (id, updates) => set((state) => {
                const idx = state.pages.findIndex(p => p.id === id);
                if (idx !== -1) {
                    Object.assign(state.pages[idx], updates);
                }
            }),
            
            removePage: (id) => set((state) => {
                state.pages = state.pages.filter(p => p.id !== id);
                delete state.selectedIds[id];
            }),

            clearPages: () => set((state) => {
                state.pages = [];
                state.selectedIds = {};
            }),

            // ═══════════════════════════════════════════════════════════════
            // JOB STATE MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            initJobState: (pageId) => set((state) => {
    const idx = state.pages.findIndex(p => p.id === pageId);
    if (idx !== -1) {
        state.pages[idx].jobState = {
            targetId: pageId,
            status: 'idle',
            phase: 'idle',
            log: [],
            qaResults: [],
            lastUpdated: Date.now(),
            attempts: 0,
            previousScores: [],
            allFeedback: [],
            startTime: Date.now(),
            checkpoints: []  // 🔥 ADD THIS LINE
        };
    }
}),

            
            addJobLog: (pageId, msg) => set((state) => {
                const idx = state.pages.findIndex(p => p.id === pageId);
                if (idx !== -1 && state.pages[idx].jobState) {
                    const timestamp = new Date().toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    state.pages[idx].jobState!.log.push(`[${timestamp}] ${msg}`);
                    state.pages[idx].jobState!.lastUpdated = Date.now();
                    
                    // Keep max 500 entries per job
                    if (state.pages[idx].jobState!.log.length > 500) {
                        state.pages[idx].jobState!.log = state.pages[idx].jobState!.log.slice(-400);
                    }
                }
            }),
            
            updateJobState: (pageId, updates) => set((state) => {
    const idx = state.pages.findIndex(p => p.id === pageId);
    if (idx !== -1) {
        if (!state.pages[idx].jobState) {
            state.pages[idx].jobState = {
                targetId: pageId,
                status: 'idle',
                phase: 'idle',
                log: [],
                qaResults: [],
                lastUpdated: Date.now(),
                attempts: 0,
                previousScores: [],
                allFeedback: [],
                checkpoints: []  // 🔥 ADD THIS LINE
            };
        }
        Object.assign(state.pages[idx].jobState!, updates);
        state.pages[idx].jobState!.lastUpdated = Date.now();
    }
}),


            // ═══════════════════════════════════════════════════════════════
            // SELECTION MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            toggleSelection: (id) => set((state) => {
                if (state.selectedIds[id]) {
                    delete state.selectedIds[id];
                } else {
                    state.selectedIds[id] = true;
                }
            }),
            
            selectAll: () => set((state) => { 
                state.pages.forEach(p => state.selectedIds[p.id] = true); 
            }),
            
            clearSelection: () => set({ selectedIds: {} }),

            // ═══════════════════════════════════════════════════════════════
            // CONFIGURATION SETTERS
            // ═══════════════════════════════════════════════════════════════
            
            setApiKey: (provider, key) => set((state) => { 
                state.apiKeys[provider] = key.trim(); 
            }),
            
            setWpConfig: (config) => set((state) => { 
                Object.assign(state.wpConfig, config); 
            }),
            
            setAutonomousConfig: (config) => set((state) => { 
                Object.assign(state.autonomousConfig, config); 
            }),

            setGeoConfig: (config) => set((state) => {
                Object.assign(state.geoConfig, config);
            }),

            // ═══════════════════════════════════════════════════════════════
            // 🔥 NEW: OPTIMIZATION MODE ACTIONS
            // ═══════════════════════════════════════════════════════════════
            
            setOptimizationMode: (mode) => set((state) => {
                state.optimizationMode = mode;
                state.optimizationConfig.mode = mode;
                
                // Auto-adjust settings based on mode
                if (mode === 'full_rewrite') {
                    state.optimizationConfig.preserveGoodSections = false;
                } else {
                    state.optimizationConfig.preserveGoodSections = true;
                }
            }),
            
            setOptimizationConfig: (config) => set((state) => {
                Object.assign(state.optimizationConfig, config);
                
                // Keep mode in sync
                if (config.mode) {
                    state.optimizationMode = config.mode;
                }
            }),

            // ═══════════════════════════════════════════════════════════════
            // UI STATE SETTERS
            // ═══════════════════════════════════════════════════════════════
            
            setActiveView: (view) => set({ activeView: view }),
            setStrategyTab: (tab) => set({ strategyTab: tab }),
            setSelectedProvider: (provider) => set({ selectedProvider: provider }),
            setSelectedModel: (model) => set({ selectedModel: model }),
            setSearchGrounding: (enabled) => set({ useSearchGrounding: enabled }),
            setNeuronEnabled: (enabled) => set({ neuronEnabled: enabled }),
            setNeuronTerms: (terms) => set({ neuronTerms: terms }),
            setProcessing: (isProcessing, status = '') => set({ isProcessing, processingStatus: status }),
            setPublishMode: (mode) => set({ publishMode: mode }),
            setAutonomousRunning: (running) => set({ autonomousRunning: running }),

            // ═══════════════════════════════════════════════════════════════
            // PROCESSING LOCK (Mutex for race condition prevention)
            // ═══════════════════════════════════════════════════════════════

            acquireLock: (lockedBy) => {
                const state = get();
                if (state.processingLock.isLocked) {
                    // Check for stale lock (> 10 minutes)
                    const lockAge = Date.now() - (state.processingLock.lockedAt || 0);
                    if (lockAge < 600000) { // 10 minutes
                        return false;
                    }
                }
                set((state) => {
                    state.processingLock = {
                        isLocked: true,
                        lockedAt: Date.now(),
                        lockedBy
                    };
                });
                return true;
            },

            releaseLock: (lockedBy) => set((state) => {
                if (state.processingLock.lockedBy === lockedBy || !state.processingLock.isLocked) {
                    state.processingLock = DEFAULT_PROCESSING_LOCK;
                }
            }),

            // ═══════════════════════════════════════════════════════════════
            // 🔥 ENHANCED: SEMANTIC CACHE MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            setSemanticCache: (type, key, data) => set((state) => {
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
    
    // Initialize the cache type if it doesn't exist
    if (!state.semanticCache[type]) {
        state.semanticCache[type] = {} as any;
    }
    
    // 🔥 FIX: Use type assertion to avoid complex generic issues
    (state.semanticCache[type] as any)[normalizedKey] = { 
        data, 
        timestamp: Date.now() 
    };
    
    // Clean up old entries (keep max 100 per type)
    const entries = Object.entries(state.semanticCache[type]);
    if (entries.length > 100) {
        const sortedEntries = entries.sort((a, b) => 
            (b[1] as SemanticCacheEntry<any>).timestamp - (a[1] as SemanticCacheEntry<any>).timestamp
        );
        const toKeep = sortedEntries.slice(0, 80);
        (state.semanticCache as any)[type] = Object.fromEntries(toKeep);
    }
}),


            getSemanticCache: (type, key, maxAge = 3600000) => {
                const state = get();
                const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
                
                // Safe access with null checks
                if (!state.semanticCache || !state.semanticCache[type]) {
                    return null;
                }
                
                const entry = state.semanticCache[type][normalizedKey];
                
                if (!entry) return null;
                
                // Check if entry has expired
                if (Date.now() - entry.timestamp > maxAge) {
                    return null;
                }
                
                return entry.data;
            },
            
            clearSemanticCache: (type) => set((state) => {
                if (type) {
                    state.semanticCache[type] = {};
                } else {
                    state.semanticCache = DEFAULT_SEMANTIC_CACHE;
                }
            }),

            // ═══════════════════════════════════════════════════════════════
            // TOKEN BUDGET MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            trackTokenUsage: (tokens, cost = 0) => set((state) => {
                state.tokenBudget.used += tokens;
                state.tokenBudget.costEstimate += cost;
            }),
            
            resetTokenBudget: () => set((state) => {
                state.tokenBudget = {
                    used: 0,
                    limit: state.tokenBudget.limit,
                    sessionStart: Date.now(),
                    costEstimate: 0
                };
            }),

            // ═══════════════════════════════════════════════════════════════
            // STANDARD CACHE MANAGEMENT
            // ═══════════════════════════════════════════════════════════════
            
            setCache: (key, data, ttl = 3600000) => set((state) => {
                state.cache[key] = {
                    data,
                    timestamp: Date.now(),
                    ttl
                };
                
                // Clean up old entries
                const entries = Object.entries(state.cache);
                if (entries.length > 200) {
                    const now = Date.now();
                    const valid = entries.filter(([_, v]) => 
                        now - (v as CacheEntry<any>).timestamp < (v as CacheEntry<any>).ttl
                    );
                    state.cache = Object.fromEntries(valid.slice(-150));
                }
            }),
            
            getCache: (key) => {
                const state = get();
                const entry = state.cache[key];
                if (!entry) return null;
                if (Date.now() - entry.timestamp > entry.ttl) {
                    return null; // Expired
                }
                return entry.data;
            },
            
            clearCache: () => set({ cache: {} }),

            // ═══════════════════════════════════════════════════════════════
            // STATISTICS
            // ═══════════════════════════════════════════════════════════════
            
            updateGlobalStats: (updates) => set((state) => {
                Object.assign(state.globalStats, updates);
                
                // Calculate success rate
                if (state.globalStats.totalProcessed > 0) {
                    state.globalStats.successRate = Math.round(
                        (state.globalStats.totalImproved / state.globalStats.totalProcessed) * 100
                    );
                }
            }),

            // ═══════════════════════════════════════════════════════════════
            // AUTONOMOUS MODE HELPERS
            // ═══════════════════════════════════════════════════════════════
            
            getNextTarget: () => {
                const state = get();
                const config = state.autonomousConfig;
                
                const candidates = state.pages.filter(p => {
                    // Skip if already running
                    if (p.jobState?.status === 'running') return false;
                    
                    // Skip if at target score
                    if (p.healthScore !== null && p.healthScore >= config.targetScore) return false;
                    
                    // Skip if max retries reached
                    if (p.jobState?.attempts && p.jobState.attempts >= config.maxRetriesPerPage) return false;
                    
                    // Skip if process new only and already has a score
                    if (config.processNewPagesOnly && p.healthScore !== null && p.healthScore > 0) return false;
                    
                    // Skip if recently failed (wait 5 minutes)
                    if (p.jobState?.status === 'failed' && p.jobState.lastUpdated) {
                        const timeSinceFail = Date.now() - p.jobState.lastUpdated;
                        if (timeSinceFail < 300000) return false;
                    }
                    
                    return true;
                });

                if (candidates.length === 0) return null;

                // Sort by priority
                return candidates.sort((a, b) => {
                    // Never processed first
                    if (a.healthScore === null && b.healthScore !== null) return -1;
                    if (b.healthScore === null && a.healthScore !== null) return 1;
                    
                    // Then by opportunity score
                    if (config.prioritizeByOpportunity) {
                        const oppA = a.opportunity?.total ?? 50;
                        const oppB = b.opportunity?.total ?? 50;
                        if (oppB !== oppA) return oppB - oppA;
                    }
                    
                    // Then by lowest score
                    const scoreA = a.healthScore ?? 0;
                    const scoreB = b.healthScore ?? 0;
                    return scoreA - scoreB;
                })[0];
            },

            // ═══════════════════════════════════════════════════════════════
            // RESET
            // ═══════════════════════════════════════════════════════════════

            resetStore: () => set({
                pages: [],
                selectedIds: {},
                cache: {},
                semanticCache: DEFAULT_SEMANTIC_CACHE,
                tokenBudget: DEFAULT_TOKEN_BUDGET,
                godModeLog: [],
                toasts: [],
                isProcessing: false,
                processingStatus: '',
                godModePhase: 'idle',
                autonomousRunning: false,
                processingLock: DEFAULT_PROCESSING_LOCK,
                globalStats: DEFAULT_GLOBAL_STATS
            })
        })),
        {
            name: `wp-optimizer-v${APP_VERSION}`,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Persist essential state only
                pages: state.pages.map(p => ({
                    ...p,
                    // Don't persist full job logs to save space
                    jobState: p.jobState ? {
                        ...p.jobState,
                        log: p.jobState.log.slice(-50) // Keep last 50 only
                    } : undefined
                })),
                wpConfig: state.wpConfig,
                apiKeys: state.apiKeys,
                autonomousConfig: state.autonomousConfig,
                geoConfig: state.geoConfig,
                optimizationMode: state.optimizationMode,
                optimizationConfig: state.optimizationConfig,
                selectedProvider: state.selectedProvider,
                selectedModel: state.selectedModel,
                useSearchGrounding: state.useSearchGrounding,
                neuronEnabled: state.neuronEnabled,
                publishMode: state.publishMode,
                neuronTerms: state.neuronTerms.slice(0, 100), // Limit terms
                globalStats: state.globalStats,
                // Don't persist semantic cache or token budget (session-only)
            }),
            version: 23, // Increment for migrations
            migrate: (persistedState: any, version: number) => {
                // Handle migrations from older versions
                if (version < 23) {
                    return {
                        ...persistedState,
                        version: APP_VERSION,
                        optimizationMode: 'surgical',
                        optimizationConfig: DEFAULT_OPTIMIZATION_CONFIG,
                        geoConfig: persistedState.geoConfig || DEFAULT_GEO_CONFIG,
                        processingLock: DEFAULT_PROCESSING_LOCK,
                        semanticCache: DEFAULT_SEMANTIC_CACHE,
                        tokenBudget: DEFAULT_TOKEN_BUDGET,
                        globalStats: {
                            ...DEFAULT_GLOBAL_STATS,
                            ...(persistedState.globalStats || {})
                        }
                    };
                }
                return persistedState;
            }
        }
    )
);

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTOR HOOKS — Optimized for Performance
// ═══════════════════════════════════════════════════════════════════════════════

// Basic selectors
export const usePages = () => useAppStore(state => state.pages);
export const useApiKeys = () => useAppStore(state => state.apiKeys);
export const useWpConfig = () => useAppStore(state => state.wpConfig);
export const useGodModeLog = () => useAppStore(state => state.godModeLog);
export const useIsProcessing = () => useAppStore(state => state.isProcessing);
export const useAutonomousRunning = () => useAppStore(state => state.autonomousRunning);

// 🔥 NEW: Optimization Mode Selectors
export const useOptimizationMode = () => useAppStore(state => state.optimizationMode);
export const useOptimizationConfig = () => useAppStore(state => state.optimizationConfig);

// Computed selectors
export const usePagesWithScore = () => useAppStore(state => 
    state.pages.filter(p => p.healthScore !== null)
);

export const useRunningJobs = () => useAppStore(state => 
    state.pages.filter(p => p.jobState?.status === 'running')
);

export const useCompletedJobs = () => useAppStore(state => 
    state.pages.filter(p => p.jobState?.status === 'completed')
);

export const useFailedJobs = () => useAppStore(state => 
    state.pages.filter(p => p.jobState?.status === 'failed')
);

export const usePagesAtTarget = () => useAppStore(state => {
    const targetScore = state.autonomousConfig.targetScore || 85;
    return state.pages.filter(p => (p.healthScore || 0) >= targetScore);
});

export const useAverageScore = () => useAppStore(state => {
    const pagesWithScore = state.pages.filter(p => p.healthScore !== null);
    if (pagesWithScore.length === 0) return 0;
    return Math.round(
        pagesWithScore.reduce((sum, p) => sum + (p.healthScore || 0), 0) / pagesWithScore.length
    );
});

export const useTotalWords = () => useAppStore(state => 
    state.pages.reduce((sum, p) => sum + (p.wordCount || 0), 0)
);

// Token budget selector
export const useTokenBudget = () => useAppStore(state => state.tokenBudget);

// Global stats selector
export const useGlobalStats = () => useAppStore(state => state.globalStats);

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get page by ID with null safety
 */
export const getPageById = (pageId: string): SitemapPage | undefined => {
    return useAppStore.getState().pages.find(p => p.id === pageId);
};

/**
 * Check if a page is currently being processed
 */
export const isPageProcessing = (pageId: string): boolean => {
    const page = getPageById(pageId);
    return page?.jobState?.status === 'running';
};

/**
 * Get the current optimization settings for use in components
 */
export const getOptimizationSettings = () => {
    const state = useAppStore.getState();
    return {
        ...state.optimizationConfig,       // ✅ SPREAD FIRST
        mode: state.optimizationMode       // ✅ THEN OVERRIDE 'mode' — NO DUPLICATE!
    };
};


/**
 * Check if semantic cache has valid entry
 */
export const hasValidCacheEntry = (
    type: keyof SemanticCache, 
    key: string, 
    maxAge: number = 3600000
): boolean => {
    const state = useAppStore.getState();
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '-');
    const entry = state.semanticCache[type]?.[normalizedKey];
    
    if (!entry) return false;
    return Date.now() - entry.timestamp <= maxAge;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 REQUEST DEDUPLICATION — PREVENTS DUPLICATE API CALLS
// ═══════════════════════════════════════════════════════════════════════════════

const inflightRequests = new Map<string, Promise<any>>();

/**
 * Deduplicates concurrent requests with the same key.
 * If a request with the same key is already in flight, returns the existing promise.
 */
export function dedupeRequest<T>(
    key: string,
    requestFn: () => Promise<T>
): Promise<T> {
    // Check if identical request is already in flight
    const existing = inflightRequests.get(key);
    if (existing) {
        console.log(`[DEDUP] Reusing inflight request: ${key.substring(0, 60)}...`);
        return existing as Promise<T>;
    }
    
    // Start new request and track it
    const promise = requestFn()
        .finally(() => {
            // Remove from tracking when complete (success or failure)
            inflightRequests.delete(key);
        });
    
    inflightRequests.set(key, promise);
    return promise;
}

/**
 * Creates a cache key from arguments for deduplication
 */
export function createDedupeKey(...args: any[]): string {
    return JSON.stringify(args);
}

/**
 * Check if a request is currently in flight
 */
export function isRequestInflight(key: string): boolean {
    return inflightRequests.has(key);
}

/**
 * Get count of inflight requests (for debugging)
 */
export function getInflightRequestCount(): number {
    return inflightRequests.size;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 RATE-LIMITED REQUEST QUEUE — PREVENTS API THROTTLING
// ═══════════════════════════════════════════════════════════════════════════════

interface QueuedRequest<T> {
    id: string;
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    priority: number;
    createdAt: number;
}

export class RateLimitedQueue {
    private queue: QueuedRequest<any>[] = [];
    private processing = false;
    private lastRequestTime = 0;
    private requestCount = 0;
    private windowStart = Date.now();
    
    constructor(
        private maxRequestsPerMinute: number = 60,
        private minDelayMs: number = 100
    ) {}
    
    async enqueue<T>(
        execute: () => Promise<T>,
        priority: number = 5
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const request: QueuedRequest<T> = {
                id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                execute,
                resolve,
                reject,
                priority,
                createdAt: Date.now()
            };
            
            // Insert by priority (higher = sooner)
            const insertIndex = this.queue.findIndex(r => r.priority < priority);
            if (insertIndex === -1) {
                this.queue.push(request);
            } else {
                this.queue.splice(insertIndex, 0, request);
            }
            
            this.processQueue();
        });
    }
    
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            // Check rate limit
            const now = Date.now();
            if (now - this.windowStart >= 60000) {
                this.windowStart = now;
                this.requestCount = 0;
            }
            
            if (this.requestCount >= this.maxRequestsPerMinute) {
                const waitTime = 60000 - (now - this.windowStart) + 100;
                console.log(`[QUEUE] Rate limit reached, waiting ${waitTime}ms`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
            }
            
            // Enforce minimum delay
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minDelayMs) {
                await new Promise(r => setTimeout(r, this.minDelayMs - timeSinceLastRequest));
            }
            
            const request = this.queue.shift()!;
            this.lastRequestTime = Date.now();
            this.requestCount++;
            
            try {
                const result = await request.execute();
                request.resolve(result);
            } catch (error) {
                request.reject(error as Error);
            }
        }
        
        this.processing = false;
    }
    
    getQueueLength(): number {
        return this.queue.length;
    }
    
    clear(): void {
        this.queue.forEach(r => r.reject(new Error('Queue cleared')));
        this.queue = [];
    }
}

// Pre-configured queues for different API types
export const aiRequestQueue = new RateLimitedQueue(50, 150);
export const serperRequestQueue = new RateLimitedQueue(20, 500);
export const wpRequestQueue = new RateLimitedQueue(30, 200);



// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

/*
This store exports:

TYPES:
- OptimizationMode: 'full_rewrite' | 'surgical'
- OptimizationModeConfig: Full optimization configuration
- ImagePreservationData: Image tracking data
- SemanticCache: Cache structure for expensive operations
- TokenBudget: Token usage tracking

MAIN STORE:
- useAppStore: Main Zustand store hook

SELECTOR HOOKS:
- usePages(): Get all pages
- useApiKeys(): Get API keys
- useWpConfig(): Get WordPress config
- useGodModeLog(): Get activity log
- useIsProcessing(): Check if processing
- useAutonomousRunning(): Check autonomous mode
- useOptimizationMode(): Get current optimization mode
- useOptimizationConfig(): Get full optimization config
- usePagesWithScore(): Get pages that have scores
- useRunningJobs(): Get currently running jobs
- useCompletedJobs(): Get completed jobs
- useFailedJobs(): Get failed jobs
- usePagesAtTarget(): Get pages at target score
- useAverageScore(): Get average page score
- useTotalWords(): Get total word count
- useTokenBudget(): Get token usage
- useGlobalStats(): Get global statistics

UTILITY FUNCTIONS:
- getPageById(id): Get page by ID
- isPageProcessing(id): Check if page is processing
- getOptimizationSettings(): Get current optimization settings
- hasValidCacheEntry(type, key, maxAge): Check cache validity

KEY ACTIONS:
- setOptimizationMode(mode): Set optimization mode
- setOptimizationConfig(config): Set optimization config
- setSemanticCache(type, key, data): Set cache entry
- getSemanticCache(type, key, maxAge): Get cache entry
- trackTokenUsage(tokens, cost): Track token usage
- updateGlobalStats(updates): Update statistics
*/
