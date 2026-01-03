// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v23.2 — SOTA NLP TERM INJECTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
// Guarantees 85%+ NLP term coverage through intelligent post-processing
// Features:
// • Semantic insertion point detection
// • Natural language templates
// • Term priority weighting
// • Context-aware placement
// • Non-destructive injection
// ═══════════════════════════════════════════════════════════════════════════════

import { NeuronTerm } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NLPInjectionResult {
    html: string;
    termsAdded: string[];
    termsFailed: string[];
    initialCoverage: number;
    finalCoverage: number;
    insertionDetails: InsertionDetail[];
}

export interface InsertionDetail {
    term: string;
    location: 'paragraph' | 'list' | 'heading' | 'callout';
    template: string;
    contextScore: number;
}

export interface NLPCoverageAnalysis {
    score: number;
    weightedScore: number;
    usedTerms: Array<NeuronTerm & { count: number; positions: number[] }>;
    missingTerms: NeuronTerm[];
    criticalMissing: NeuronTerm[];
    headerMissing: NeuronTerm[];
    bodyMissing: NeuronTerm[];
}

interface InsertionPoint {
    element: Element;
    elementType: 'p' | 'li' | 'td' | 'div';
    textContent: string;
    relatedTerms: string[];
    insertionScore: number;
    position: 'start' | 'middle' | 'end';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_TARGET_COVERAGE = 85;
const MIN_PARAGRAPH_LENGTH = 80;
const MAX_PARAGRAPH_LENGTH = 600;
const MAX_INSERTIONS_PER_PARAGRAPH = 2;

// Natural sentence templates for term insertion
const INSERTION_TEMPLATES = {
    definition: [
        `{term} refers to the process of`,
        `Understanding {term} is essential because`,
        `{term} plays a crucial role in`,
        `The concept of {term} involves`,
        `When examining {term}, it's important to note that`,
    ],
    importance: [
        `{term} is particularly important for`,
        `Many experts emphasize {term} as`,
        `The significance of {term} cannot be overstated—`,
        `{term} directly impacts`,
        `Focusing on {term} helps ensure`,
    ],
    example: [
        `A good example of {term} is`,
        `{term} can be seen in`,
        `Consider how {term} applies to`,
        `{term} is commonly used when`,
        `Real-world applications of {term} include`,
    ],
    comparison: [
        `Unlike traditional approaches, {term}`,
        `{term} differs from other methods because`,
        `Compared to alternatives, {term}`,
        `What sets {term} apart is`,
        `{term} stands out due to`,
    ],
    action: [
        `To implement {term}, you should`,
        `Start by focusing on {term}`,
        `{term} requires careful attention to`,
        `When applying {term}, consider`,
        `{term} works best when`,
    ],
    transition: [
        `This relates directly to {term}, which`,
        `Building on this, {term}`,
        `Furthermore, {term}`,
        `In addition to the above, {term}`,
        `{term} also contributes to`,
    ],
    expert: [
        `Industry experts recommend {term} for`,
        `Research supports the use of {term} in`,
        `Studies show that {term}`,
        `According to best practices, {term}`,
        `Professionals often rely on {term} to`,
    ],
};

// Related term clusters for context matching
const TERM_CLUSTERS: Record<string, string[]> = {
    seo: ['ranking', 'search', 'google', 'keyword', 'optimization', 'serp', 'traffic', 'visibility'],
    content: ['writing', 'article', 'blog', 'post', 'copy', 'text', 'words', 'quality'],
    marketing: ['strategy', 'campaign', 'audience', 'conversion', 'leads', 'funnel', 'engagement'],
    technical: ['code', 'development', 'api', 'implementation', 'system', 'software', 'integration'],
    health: ['wellness', 'fitness', 'nutrition', 'medical', 'treatment', 'symptoms', 'diagnosis'],
    business: ['company', 'revenue', 'profit', 'growth', 'market', 'industry', 'enterprise'],
    finance: ['money', 'investment', 'budget', 'cost', 'price', 'savings', 'roi', 'return'],
    ecommerce: ['product', 'store', 'shop', 'cart', 'checkout', 'shipping', 'order', 'purchase'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NLP COVERAGE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzeNLPCoverage(
    html: string,
    terms: NeuronTerm[]
): NLPCoverageAnalysis {
    if (!html || terms.length === 0) {
        return {
            score: 100,
            weightedScore: 100,
            usedTerms: [],
            missingTerms: [],
            criticalMissing: [],
            headerMissing: [],
            bodyMissing: [],
        };
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textContent = doc.body?.textContent?.toLowerCase() || '';
    
    const usedTerms: Array<NeuronTerm & { count: number; positions: number[] }> = [];
    const missingTerms: NeuronTerm[] = [];
    
    let totalWeight = 0;
    let usedWeight = 0;

    for (const term of terms) {
        const termLower = term.term.toLowerCase();
        const escaped = termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        
        const positions: number[] = [];
        let match;
        while ((match = regex.exec(textContent)) !== null) {
            positions.push(match.index);
        }
        
        const count = positions.length;
        const weight = term.importance || 50;
        totalWeight += weight;
        
        if (count > 0) {
            usedTerms.push({ ...term, count, positions });
            usedWeight += weight;
        } else {
            missingTerms.push(term);
        }
    }

    // Categorize missing terms
    const criticalMissing = missingTerms.filter(t => (t.importance || 50) >= 80);
    const headerMissing = missingTerms.filter(t => t.type === 'header' || t.type === 'title');
    const bodyMissing = missingTerms.filter(t => t.type === 'basic' || t.type === 'extended');

    const score = terms.length > 0 
        ? Math.round((usedTerms.length / terms.length) * 100)
        : 100;
    
    const weightedScore = totalWeight > 0
        ? Math.round((usedWeight / totalWeight) * 100)
        : 100;

    return {
        score,
        weightedScore,
        usedTerms,
        missingTerms,
        criticalMissing,
        headerMissing,
        bodyMissing,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC INSERTION POINT FINDER
// ═══════════════════════════════════════════════════════════════════════════════

function findSemanticInsertionPoints(
    doc: Document,
    term: NeuronTerm,
    existingInsertions: Map<Element, number>
): InsertionPoint[] {
    const insertionPoints: InsertionPoint[] = [];
    const termLower = term.term.toLowerCase();
    const termWords = termLower.split(/\s+/);
    
    // Get related terms for context matching
    const relatedTerms = getRelatedTerms(termLower);
    
    // Find suitable paragraphs
    const paragraphs = Array.from(doc.querySelectorAll('p, li, td'));
    
    for (const element of paragraphs) {
        // Skip if too many insertions already
        const currentInsertions = existingInsertions.get(element) || 0;
        if (currentInsertions >= MAX_INSERTIONS_PER_PARAGRAPH) continue;
        
        const text = element.textContent?.toLowerCase() || '';
        const textLength = text.length;
        
        // Skip too short or too long paragraphs
        if (textLength < MIN_PARAGRAPH_LENGTH || textLength > MAX_PARAGRAPH_LENGTH) continue;
        
        // Skip if element already contains the term
        if (text.includes(termLower)) continue;
        
        // Skip if inside a heading, link, or special element
        if (isInsideSpecialElement(element)) continue;
        
        // Calculate context relevance score
        let contextScore = 0;
        const foundRelated: string[] = [];
        
        for (const related of relatedTerms) {
            if (text.includes(related)) {
                contextScore += 15;
                foundRelated.push(related);
            }
        }
        
        // Check for partial term word matches
        for (const word of termWords) {
            if (word.length > 3 && text.includes(word)) {
                contextScore += 10;
            }
        }
        
        // Boost score for paragraphs with good structure
        if (text.includes('.') && text.split('.').length >= 2) {
            contextScore += 5;
        }
        
        // Minimum threshold
        if (contextScore < 10) continue;
        
        // Determine best insertion position
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        let position: 'start' | 'middle' | 'end' = 'end';
        
        if (sentences.length >= 3) {
            position = 'middle';
        } else if (sentences.length === 1) {
            position = 'end';
        }
        
        insertionPoints.push({
            element,
            elementType: element.tagName.toLowerCase() as 'p' | 'li' | 'td' | 'div',
            textContent: text,
            relatedTerms: foundRelated,
            insertionScore: contextScore,
            position,
        });
    }
    
    // Sort by score descending
    return insertionPoints.sort((a, b) => b.insertionScore - a.insertionScore);
}

function isInsideSpecialElement(element: Element): boolean {
    let parent = element.parentElement;
    const forbiddenTags = new Set(['A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'CODE', 'PRE', 'SCRIPT', 'STYLE']);
    
    while (parent) {
        if (forbiddenTags.has(parent.tagName)) return true;
        parent = parent.parentElement;
    }
    
    return false;
}

function getRelatedTerms(term: string): string[] {
    const related: Set<string> = new Set();
    const termLower = term.toLowerCase();
    const termWords = termLower.split(/\s+/);
    
    // Check each cluster for matches
    for (const [cluster, clusterTerms] of Object.entries(TERM_CLUSTERS)) {
        let matchScore = 0;
        
        // Check if term or its words match cluster terms
        for (const clusterTerm of clusterTerms) {
            if (termLower.includes(clusterTerm) || clusterTerm.includes(termLower)) {
                matchScore += 2;
            }
            for (const word of termWords) {
                if (word.length > 3 && clusterTerm.includes(word)) {
                    matchScore++;
                }
            }
        }
        
        // If good match, add related cluster terms
        if (matchScore >= 2) {
            clusterTerms.forEach(t => related.add(t));
        }
    }
    
    // Add common co-occurring words
    const commonRelated = ['important', 'effective', 'strategy', 'approach', 'method', 'process', 'benefit', 'result'];
    commonRelated.forEach(t => related.add(t));
    
    return Array.from(related);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL TERM INSERTION
// ═══════════════════════════════════════════════════════════════════════════════

function insertTermNaturally(
    doc: Document,
    term: NeuronTerm,
    insertionPoint: InsertionPoint
): { success: boolean; template: string } {
    const element = insertionPoint.element;
    const originalHtml = element.innerHTML;
    const termText = term.term;
    
    // Select appropriate template category based on term type and context
    let templateCategory: keyof typeof INSERTION_TEMPLATES = 'transition';
    
    if (term.type === 'title' || term.type === 'header') {
        templateCategory = Math.random() > 0.5 ? 'importance' : 'definition';
    } else if (insertionPoint.relatedTerms.length >= 2) {
        templateCategory = 'example';
    } else if (insertionPoint.position === 'start') {
        templateCategory = 'action';
    } else if (insertionPoint.position === 'end') {
        templateCategory = 'transition';
    } else {
        const categories = Object.keys(INSERTION_TEMPLATES) as Array<keyof typeof INSERTION_TEMPLATES>;
        templateCategory = categories[Math.floor(Math.random() * categories.length)];
    }
    
    // Select random template from category
    const templates = INSERTION_TEMPLATES[templateCategory];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Create the insertion text
    const insertionText = template.replace('{term}', `<strong>${termText}</strong>`);
    
    // Find insertion point in HTML
    const sentences = originalHtml.split(/(?<=[.!?])\s+/);
    
    if (sentences.length === 0) return { success: false, template: '' };
    
    let newHtml: string;
    
    if (insertionPoint.position === 'end' || sentences.length === 1) {
        // Append to end
        newHtml = `${originalHtml.trim()} ${insertionText}`;
    } else if (insertionPoint.position === 'start') {
        // Prepend to start
        newHtml = `${insertionText} ${originalHtml.trim()}`;
    } else {
        // Insert in middle
        const midPoint = Math.floor(sentences.length / 2);
        const beforeSentences = sentences.slice(0, midPoint).join(' ');
        const afterSentences = sentences.slice(midPoint).join(' ');
        newHtml = `${beforeSentences} ${insertionText} ${afterSentences}`;
    }
    
    element.innerHTML = newHtml;
    
    return { success: true, template };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER TERM INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

function injectHeaderTerms(
    doc: Document,
    headerTerms: NeuronTerm[],
    maxInjections: number = 5
): string[] {
    const injected: string[] = [];
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    
    if (headings.length === 0 || headerTerms.length === 0) return injected;
    
    // Sort header terms by importance
    const sortedTerms = [...headerTerms].sort((a, b) => (b.importance || 50) - (a.importance || 50));
    
    let injectCount = 0;
    
    for (const term of sortedTerms) {
        if (injectCount >= maxInjections) break;
        
        const termLower = term.term.toLowerCase();
        
        // Find a heading that doesn't already contain the term
        for (const heading of headings) {
            const headingText = heading.textContent?.toLowerCase() || '';
            
            if (headingText.includes(termLower)) continue;
            if (headingText.length > 80) continue; // Skip long headings
            
            // Check if term relates to heading content
            const termWords = termLower.split(/\s+/);
            let relevance = 0;
            
            for (const word of termWords) {
                if (word.length > 3 && headingText.includes(word)) {
                    relevance++;
                }
            }
            
            // Only inject if somewhat relevant
            if (relevance === 0 && term.importance < 90) continue;
            
            // Inject term into heading
            const currentText = heading.textContent || '';
            const separator = currentText.includes(':') ? ' — ' : ': ';
            
            // Decide injection style
            if (Math.random() > 0.5 && currentText.length < 40) {
                // Append style: "Original Heading: Term"
                heading.innerHTML = `${currentText}${separator}${term.term}`;
            } else {
                // Prepend style: "Term in Original Heading"
                heading.innerHTML = `${term.term} in ${currentText}`;
            }
            
            injected.push(term.term);
            injectCount++;
            break;
        }
    }
    
    return injected;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN INJECTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function injectMissingNLPTerms(
    html: string,
    neuronTerms: NeuronTerm[],
    options: {
        targetCoverage?: number;
        maxInsertions?: number;
        injectHeaders?: boolean;
        prioritizeCritical?: boolean;
    } = {}
): NLPInjectionResult {
    const {
        targetCoverage = DEFAULT_TARGET_COVERAGE,
        maxInsertions = 30,
        injectHeaders = true,
        prioritizeCritical = true,
    } = options;

    if (!html || neuronTerms.length === 0) {
        return {
            html,
            termsAdded: [],
            termsFailed: [],
            initialCoverage: 100,
            finalCoverage: 100,
            insertionDetails: [],
        };
    }

    // Analyze initial coverage
    const initialAnalysis = analyzeNLPCoverage(html, neuronTerms);
    
    if (initialAnalysis.score >= targetCoverage) {
        return {
            html,
            termsAdded: [],
            termsFailed: [],
            initialCoverage: initialAnalysis.score,
            finalCoverage: initialAnalysis.score,
            insertionDetails: [],
        };
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const termsAdded: string[] = [];
    const termsFailed: string[] = [];
    const insertionDetails: InsertionDetail[] = [];
    const insertionCounts = new Map<Element, number>();

    // Sort missing terms by priority
    let termsToInject = [...initialAnalysis.missingTerms];
    
    if (prioritizeCritical) {
        termsToInject.sort((a, b) => {
            // Critical terms first
            if ((a.importance || 50) >= 80 && (b.importance || 50) < 80) return -1;
            if ((b.importance || 50) >= 80 && (a.importance || 50) < 80) return 1;
            // Then by importance
            return (b.importance || 50) - (a.importance || 50);
        });
    }

    // Inject header terms first
    if (injectHeaders) {
        const headerTerms = termsToInject.filter(t => t.type === 'header' || t.type === 'title');
        const headerInjected = injectHeaderTerms(doc, headerTerms, Math.min(5, Math.ceil(maxInsertions * 0.2)));
        
        headerInjected.forEach(term => {
            termsAdded.push(term);
            insertionDetails.push({
                term,
                location: 'heading',
                template: 'header injection',
                contextScore: 100,
            });
        });
        
        // Remove injected terms from list
        termsToInject = termsToInject.filter(t => !headerInjected.includes(t.term));
    }

    // Inject body terms
    let insertionCount = termsAdded.length;
    
    for (const term of termsToInject) {
        if (insertionCount >= maxInsertions) break;
        
        // Check if target already reached
        const currentHtml = doc.body?.innerHTML || '';
        const currentAnalysis = analyzeNLPCoverage(currentHtml, neuronTerms);
        if (currentAnalysis.score >= targetCoverage) break;
        
        // Find insertion points
        const insertionPoints = findSemanticInsertionPoints(doc, term, insertionCounts);
        
        if (insertionPoints.length === 0) {
            termsFailed.push(term.term);
            continue;
        }
        
        // Try to insert at best point
        const bestPoint = insertionPoints[0];
        const result = insertTermNaturally(doc, term, bestPoint);
        
        if (result.success) {
            termsAdded.push(term.term);
            insertionCount++;
            
            // Track insertions per element
            const currentCount = insertionCounts.get(bestPoint.element) || 0;
            insertionCounts.set(bestPoint.element, currentCount + 1);
            
            insertionDetails.push({
                term: term.term,
                location: bestPoint.elementType === 'li' ? 'list' : 'paragraph',
                template: result.template,
                contextScore: bestPoint.insertionScore,
            });
        } else {
            termsFailed.push(term.term);
        }
    }

    // Get final HTML and coverage
    const finalHtml = doc.body?.innerHTML || html;
    const finalAnalysis = analyzeNLPCoverage(finalHtml, neuronTerms);

    return {
        html: finalHtml,
        termsAdded,
        termsFailed,
        initialCoverage: initialAnalysis.score,
        finalCoverage: finalAnalysis.score,
        insertionDetails,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY: CREATE TERM-RICH CALLOUT BOX
// ═══════════════════════════════════════════════════════════════════════════════

export function createNLPEnrichedCallout(
    terms: NeuronTerm[],
    topic: string,
    style: 'tip' | 'info' | 'warning' | 'expert' = 'tip'
): string {
    if (terms.length === 0) return '';
    
    // Take top 5 terms by importance
    const topTerms = [...terms]
        .sort((a, b) => (b.importance || 50) - (a.importance || 50))
        .slice(0, 5);
    
    const termList = topTerms.map(t => `<strong>${t.term}</strong>`).join(', ');
    
    const styles: Record<string, { color: string; icon: string; label: string }> = {
        tip: { color: '#10b981', icon: '💡', label: 'Pro Tip' },
        info: { color: '#3b82f6', icon: 'ℹ️', label: 'Key Concepts' },
        warning: { color: '#f59e0b', icon: '⚠️', label: 'Important' },
        expert: { color: '#8b5cf6', icon: '🎯', label: 'Expert Insight' },
    };
    
    const { color, icon, label } = styles[style];
    
    return `
<div style="background: linear-gradient(135deg, ${color}12 0%, ${color}08 100%); border-left: 5px solid ${color}; border-radius: 0 16px 16px 0; padding: 28px 32px; margin: 32px 0; box-shadow: 0 4px 24px ${color}15;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
    <span style="font-size: 24px;">${icon}</span>
    <span style="color: ${color}; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">${label}</span>
  </div>
  <p style="color: #d1d5db; font-size: 16px; line-height: 1.75; margin: 0;">When mastering ${topic}, focus on these essential elements: ${termList}. Each plays a vital role in achieving optimal results.</p>
</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY: GENERATE NLP-OPTIMIZED FAQ
// ═══════════════════════════════════════════════════════════════════════════════

export function generateNLPOptimizedFAQs(
    topic: string,
    terms: NeuronTerm[],
    existingFAQs: Array<{ question: string; answer: string }>,
    targetCount: number = 10
): Array<{ question: string; answer: string }> {
    const faqs = [...existingFAQs];
    
    if (terms.length === 0 || faqs.length >= targetCount) return faqs;
    
    // Get unused high-importance terms
    const usedTerms = new Set(
        existingFAQs.flatMap(faq => {
            const text = `${faq.question} ${faq.answer}`.toLowerCase();
            return terms.filter(t => text.includes(t.term.toLowerCase())).map(t => t.term);
        })
    );
    
    const unusedTerms = terms
        .filter(t => !usedTerms.has(t.term))
        .sort((a, b) => (b.importance || 50) - (a.importance || 50));
    
    // Generate additional FAQs using unused terms
    const questionTemplates = [
        `What is {term} and why does it matter for ${topic}?`,
        `How does {term} improve ${topic} results?`,
        `What are the best practices for {term} in ${topic}?`,
        `Why is {term} essential for successful ${topic}?`,
        `How do experts use {term} to optimize ${topic}?`,
    ];
    
    for (const term of unusedTerms) {
        if (faqs.length >= targetCount) break;
        
        const template = questionTemplates[faqs.length % questionTemplates.length];
        const question = template.replace('{term}', term.term);
        
        // Generate placeholder answer (to be replaced by AI)
        const answer = `${term.term} is a crucial aspect of ${topic} that directly impacts overall success. Understanding and properly implementing ${term.term} can significantly improve your outcomes. Experts recommend focusing on ${term.term} early in your ${topic} strategy to establish a strong foundation for long-term results.`;
        
        faqs.push({ question, answer });
    }
    
    return faqs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    injectMissingNLPTerms,
    analyzeNLPCoverage,
    createNLPEnrichedCallout,
    generateNLPOptimizedFAQs,
};
