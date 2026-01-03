// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v22.1 — SOTA NEURONWRITER INTEGRATION
// Enterprise NLP Optimization with CORS Proxy Support
// ═══════════════════════════════════════════════════════════════════════════════

import { NeuronTerm, NeuronAnalysisResult } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const NEURON_API_BASE = 'https://app.neuronwriter.com/neuron-api/0.5/writer';
const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_BASE = 2000;
const CACHE_TTL = 3600000; // 1 hour

// In-memory cache for NeuronWriter results
const neuronCache = new Map<string, { data: NeuronAnalysisResult; timestamp: number }>();

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NeuronProject {
    project: string;
    name: string;
    language: string;
    engine: string;
    domain?: string;
}

export interface NeuronConfig {
    enabled: boolean;
    apiKey: string;
    projectId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 CORS PROXY HELPER
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchWithCors(
    url: string, 
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    } = {}
): Promise<any> {
    const { method = 'POST', headers = {}, body } = options;
    
    // Method 1: Direct fetch (might work in some environments)
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('[NeuronWriter] Direct fetch failed, trying CORS proxy...');
    }
    
    // Method 2: CORS proxy (corsproxy.io)
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('[NeuronWriter] corsproxy.io failed, trying allorigins...');
    }
    
    // Method 3: allorigins proxy
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
            method: 'GET'
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('[NeuronWriter] allorigins failed');
    }
    
    throw new Error('All fetch methods failed (CORS blocked)');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔑 PROJECT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export async function listNeuronProjects(apiKey: string): Promise<NeuronProject[]> {
    if (!apiKey || apiKey.trim().length < 5) return [];
    
    const url = `${NEURON_API_BASE}/list-projects`;
    
    try {
        const data = await fetchWithCors(url, {
            method: 'POST',
            headers: { 'X-API-KEY': apiKey },
            body: JSON.stringify({})
        });
        
        if (Array.isArray(data)) {
            return data as NeuronProject[];
        } else if (data?.projects && Array.isArray(data.projects)) {
            return data.projects as NeuronProject[];
        }
        
        console.log('[NeuronWriter] Unexpected response format:', data);
        return [];
    } catch (error: any) {
        console.error('[NeuronWriter] List projects failed:', error.message);
        throw error;
    }
}

export async function getProjectDetails(
    apiKey: string, 
    projectId: string
): Promise<NeuronProject | null> {
    const projects = await listNeuronProjects(apiKey);
    return projects.find(p => p.project === projectId) || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 QUERY CREATION & POLLING
// ═══════════════════════════════════════════════════════════════════════════════

async function createNeuronQuery(
    keyword: string, 
    config: NeuronConfig,
    options: {
        engine?: string;
        language?: string;
    } = {}
): Promise<string> {
    const { engine = 'google.com', language = 'English' } = options;
    
    const url = `${NEURON_API_BASE}/new-query`;
    
    const data = await fetchWithCors(url, {
        method: 'POST',
        headers: { 'X-API-KEY': config.apiKey },
        body: JSON.stringify({
            project: config.projectId,
            keyword,
            engine,
            language,
            competitors_mode: 'top-intent',
            analyze_competitors: true
        })
    });
    
    if (!data.query) {
        throw new Error('NeuronWriter did not return a query ID');
    }
    
    return data.query;
}

async function pollNeuronQuery(
    queryId: string, 
    config: NeuronConfig, 
    maxAttempts = MAX_POLL_ATTEMPTS,
    onProgress?: (msg: string, progress: number) => void
): Promise<any> {
    const url = `${NEURON_API_BASE}/get-query`;
    
    const getDelay = (attempt: number) => {
        return Math.min(POLL_INTERVAL_BASE * Math.pow(1.15, attempt), 10000) + Math.random() * 500;
    };
    
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, getDelay(i)));
        
        const progress = Math.min(95, Math.round((i / maxAttempts) * 100));
        if (i % 3 === 0) {
            onProgress?.(`🧬 Analyzing SERP competitors... (${progress}%)`, progress);
        }
        
        try {
            const data = await fetchWithCors(url, {
                method: 'POST',
                headers: { 'X-API-KEY': config.apiKey },
                body: JSON.stringify({ query: queryId })
            });
            
            if (data.status === 'ready') {
                onProgress?.('✅ NeuronWriter analysis complete!', 100);
                return data;
            }
            
            if (data.status === 'not found') {
                throw new Error('NeuronWriter query not found or expired');
            }
            
            if (data.status === 'error') {
                throw new Error(`NeuronWriter analysis error: ${data.message || 'Unknown'}`);
            }
            
        } catch (e: any) {
            if (e.message.includes('API KEY') || e.message.includes('Forbidden') || e.message.includes('Credits')) {
                throw e;
            }
            console.warn(`NeuronWriter poll attempt ${i + 1} failed:`, e.message);
        }
    }
    
    throw new Error('NeuronWriter: Query polling timed out after ' + maxAttempts + ' attempts');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 TERM PARSING
// ═══════════════════════════════════════════════════════════════════════════════

function parseNeuronTerms(data: any): NeuronTerm[] {
    const terms: NeuronTerm[] = [];
    const seen = new Set<string>();
    
    const addTerm = (term: string, type: NeuronTerm['type'], index: number) => {
        const cleanTerm = term.trim();
        const lower = cleanTerm.toLowerCase();
        
        if (cleanTerm.length < 2 || seen.has(lower)) return;
        seen.add(lower);
        
        let importance = 80 - (index * 1.5);
        if (type === 'title') importance = 100 - (index * 2);
        else if (type === 'header') importance = 90 - (index * 1.5);
        else if (type === 'extended') importance = 60 - index;
        
        let recommended = 1;
        if (type === 'basic') recommended = importance >= 70 ? 3 : 2;
        else if (type === 'extended') recommended = 2;
        else if (type === 'header') recommended = 2;
        
        terms.push({
            term: cleanTerm,
            type,
            count: 0,
            recommended,
            importance: Math.max(10, Math.round(importance))
        });
    };
    
    const termsTxt = data.terms_txt || {};
    
    if (termsTxt.title) {
        termsTxt.title.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'title', i));
    }
    
    if (termsTxt.h1) {
        termsTxt.h1.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'header', i));
    }
    
    if (termsTxt.h2) {
        termsTxt.h2.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'header', i + 10));
    }
    
    if (termsTxt.h3) {
        termsTxt.h3.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'header', i + 20));
    }
    
    if (termsTxt.content_basic) {
        termsTxt.content_basic.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'basic', i));
    }
    
    if (termsTxt.content_extended) {
        termsTxt.content_extended.split(',').map((t: string) => t.trim()).filter(Boolean)
            .forEach((term: string, i: number) => addTerm(term, 'extended', i));
    }
    
    return terms.sort((a, b) => b.importance - a.importance);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function getNeuronWriterAnalysis(
    keyword: string,
    config: NeuronConfig,
    options: {
        engine?: string;
        language?: string;
        forceRefresh?: boolean;
    } = {},
    onProgress?: (msg: string, progress?: number) => void
): Promise<NeuronAnalysisResult | null> {
    if (!config.enabled || !config.apiKey || !config.projectId) {
        onProgress?.('⚠️ NeuronWriter not configured');
        return null;
    }

    // Check cache first
    const cacheKey = `${config.projectId}:${keyword.toLowerCase().trim()}`;
    const cached = neuronCache.get(cacheKey);
    
    if (cached && !options.forceRefresh && (Date.now() - cached.timestamp) < CACHE_TTL) {
        onProgress?.('🧬 Using cached NeuronWriter data');
        return cached.data;
    }

    try {
        onProgress?.('🧬 Initializing NeuronWriter NLP analysis...', 5);
        
        const project = await getProjectDetails(config.apiKey, config.projectId);
        const engine = options.engine || project?.engine || 'google.com';
        const language = options.language || project?.language || 'English';
        
        onProgress?.(`🔍 Analyzing "${keyword}" on ${engine}...`, 10);
        
        const queryId = await createNeuronQuery(keyword, config, { engine, language });
        onProgress?.(`📊 Query created, analyzing SERP competitors...`, 20);
        
        const data = await pollNeuronQuery(queryId, config, MAX_POLL_ATTEMPTS, onProgress);
        
        const terms = parseNeuronTerms(data);
        
        const targetWordCount = data.metrics?.word_count?.target || 
                                data.word_count?.recommended || 4500;
        
        const result: NeuronAnalysisResult = {
            status: 'ready',
            terms,
            targetWordCount,
            competitors: (data.competitors || []).map((c: any) => ({
                url: c.url,
                title: c.title,
                wordCount: c.word_count || c.wordCount || 0,
                score: c.score || 0
            })),
            contentScore: data.content_score || data.score || undefined
        };
        
        // Cache the result
        neuronCache.set(cacheKey, { data: result, timestamp: Date.now() });
        
        onProgress?.(`✅ NeuronWriter: ${terms.length} terms loaded | Target: ${targetWordCount}+ words`, 100);
        
        return result;
    } catch (err: any) {
        console.error('NeuronWriter Error:', err);
        onProgress?.(`⚠️ NeuronWriter failed: ${err.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 COVERAGE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateNeuronCoverage(
    content: string, 
    terms: NeuronTerm[]
): { score: number; usedTerms: NeuronTerm[]; missingTerms: NeuronTerm[] } {
    if (terms.length === 0) {
        return { score: 100, usedTerms: [], missingTerms: [] };
    }
    
    const contentLower = content.toLowerCase();
    const usedTerms: NeuronTerm[] = [];
    const missingTerms: NeuronTerm[] = [];
    
    terms.forEach(term => {
        const termLower = term.term.toLowerCase();
        const escaped = termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = contentLower.match(regex) || [];
        const count = matches.length;
        
        if (count > 0) {
            usedTerms.push({ ...term, count, isUsed: true });
        } else {
            missingTerms.push({ ...term, count: 0, isUsed: false });
        }
    });
    
    const score = terms.length > 0 
        ? Math.round((usedTerms.length / terms.length) * 100) 
        : 100;
    
    return { score, usedTerms, missingTerms };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function clearNeuronCache(): void {
    neuronCache.clear();
}

export async function validateNeuronApiKey(apiKey: string): Promise<boolean> {
    try {
        const projects = await listNeuronProjects(apiKey);
        return projects.length > 0;
    } catch {
        return false;
    }
}
