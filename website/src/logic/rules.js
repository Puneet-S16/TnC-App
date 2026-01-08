/**
 * rules.js
 * Optimized logic with Additive Scoring System & Strict Grading
 */

// 1. SCORING RULES
const SCORING_RULES = {
    RISK: [
        {
            id: 'data_sale',
            score: 3,
            name: 'Sale of Personal Data',
            description: 'Explicitly mentions selling data or sharing for commercial purposes.',
            regex: /(sell your data|sell personal data|sell personal information|share.*commercial purposes|share.*business partners|monetize user data)/i
        },
        {
            id: 'data_share',
            score: 3,
            name: 'Third-Party Data Sharing',
            description: 'Explicit sharing with third parties.',
            regex: /(share.*third parties|share.*affiliates|share.*partners|data.*third party|provide.*third parties|disclose.*third parties)/i
        },
        {
            id: 'auto_renew',
            score: 3,
            name: 'Auto-Renewal / Recurring',
            description: 'Auto-renewal without explicit reminder.',
            regex: /(auto-renew|automatic renewal|automatically renew|recurring billing|charged automatically|until you cancel|subscription will continue)/i
        },
        {
            id: 'no_refund',
            score: 2,
            name: 'No Refunds',
            description: 'Non-refundable or all sales final.',
            regex: /(no refunds|non-refundable|all sales are final|cannot be returned|no obligation to refund)/i
        },
        {
            id: 'waiver',
            score: 2,
            name: 'Liability / Arbitration',
            description: 'Mandatory arbitration or liability waiver.',
            regex: /(limit.*liability|limitation of liability|not liable|as is|no warranty|arbitration|class action waiver|waive right to trial|binding arbitration)/i
        }
    ],
    VAGUE: [
        {
            id: 'partners',
            score: 1,
            name: 'Vague Partner Sharing',
            regex: /(partners help us|third parties help us)/i
        },
        {
            id: 'commercial',
            score: 1,
            name: 'Commercial Purposes',
            regex: /(business purposes|commercial purposes|marketing purposes)/i
        },
        {
            id: 'improve',
            score: 0.5,
            name: 'Improve Services',
            regex: /(improve our services|enhance user experience|analyze usage)/i
        },
        {
            id: 'collection',
            score: 0.5,
            name: 'Data Collection',
            regex: /(information we collect|data we collect)/i
        },
        {
            id: 'usage',
            score: 0.5,
            name: 'Vague Usage',
            regex: /(may be used|as necessary|reasonable efforts)/i
        }
    ],
    SAFETY: [
        {
            id: 'no_sell',
            score: -2,
            name: 'No Data Selling',
            regex: /(we do not sell|never sell|will not sell|no sale of personal)/i
        },
        {
            id: 'control',
            score: -1,
            name: 'User Control / Opt-Out',
            regex: /(opt-out|control your data|withdraw consent|delete your account)/i
        },
        {
            id: 'refund_policy',
            score: -1,
            name: 'Refund Policy',
            regex: /(cancel at any time|refund within|money-back guarantee|full refund)/i
        }
    ]
};

// Constraint #3: Treat Grade C as default for large platforms
const BIG_PLATFORMS = ['facebook.com', 'instagram.com', 'google.com', 'youtube.com', 'amazon', 'twitter.com', 'x.com', 'linkedin.com', 'medium.com'];

export function analyzeText(text, domain = '') {
    // Constraint #1 checks (basic length check to avoid empty/tiny UI snippets)
    if (!text || typeof text !== 'string' || text.length < 50) {
        return {
            flags: [],
            grade: 'E',
            riskLevel: 'UNKNOWN',
            classification: 'Unclear',
            classificationLabel: 'Input too short',
            explanation: 'Please provide more text for analysis.'
        };
    }

    let totalScore = 0;
    const detectedFlags = [];
    let explanations = [];

    // 1. Calculate Risk Score
    let riskScore = 0;
    SCORING_RULES.RISK.forEach(rule => {
        if (rule.regex.test(text)) {
            const match = text.match(rule.regex)[0];
            riskScore += rule.score;
            detectedFlags.push({
                ...rule,
                severity: 'HIGH',
                trigger: match,
                displayScore: `+${rule.score}`
            });
            explanations.push(`Explicit risk (+${rule.score}): "${match}"`);
        }
    });

    // 2. Calculate Safety Score
    let safetyScore = 0;
    SCORING_RULES.SAFETY.forEach(rule => {
        if (rule.regex.test(text)) {
            const match = text.match(rule.regex)[0];
            safetyScore += rule.score; // Score is negative
            explanations.push(`Safety signal (${rule.score}): "${match}"`);
        }
    });

    // 3. Calculate Vague Score
    let vagueScore = 0;
    let vagueMatches = [];
    SCORING_RULES.VAGUE.forEach(rule => {
        if (rule.regex.test(text)) {
            const matches = text.match(new RegExp(rule.regex, 'gi'));
            if (matches) {
                // Count vague categories found (once per rule to avoid explosion)
                vagueScore += rule.score;
                vagueMatches.push({ rule, match: matches[0] });
            }
        }
    });

    // 4. Guardrails & Penalties

    // Vague Guardrail: Ignore vague if < 1.5 unless no safety
    const hasExplicitSafety = safetyScore < 0;

    // Constraint #4: Grade A only when explicit safety statements exist.
    // We handle this in grading, but here we decide if vague score counts.
    if (vagueScore < 1.5 && !hasExplicitSafety) {
        if (vagueScore > 0) {
            explanations.push(`(Ignored ${vagueScore} vague points - below threshold)`);
        }
        vagueScore = 0;
    } else {
        vagueMatches.forEach(vm => {
            explanations.push(`Vague signal (+${vm.rule.score}): "${vm.match}"`);
            detectedFlags.push({
                ...vm.rule,
                severity: 'MEDIUM',
                trigger: vm.match,
                displayScore: `+${vm.rule.score}`
            });
        });
    }

    // Complexity Rules
    const wordCount = text.split(/\s+/).length;
    let complexityPenalty = 0;

    // "No Evidence of Safety Penalty"
    // If no explicit safety signals found AND document length > 150 words -> +1
    if (safetyScore === 0 && wordCount > 150) {
        complexityPenalty += 1;
        explanations.push(`Uncertainty Penalty (+1): No safety signals found.`);
    }

    // Explicit long-document complexity
    if (wordCount > 2000 && vagueScore >= 1.0 && safetyScore === 0) {
        complexityPenalty += 1.5;
        explanations.push(`Complexity Penalty (+1.5): Document is very long (${wordCount} words) with vague language.`);
    }

    totalScore = riskScore + vagueScore + safetyScore + complexityPenalty;

    // 5. Big Platform Bias
    let isBigPlatform = false;
    if (domain) {
        const lowerDomain = domain.toLowerCase();
        isBigPlatform = BIG_PLATFORMS.some(p => lowerDomain.includes(p));
        if (isBigPlatform) {
            explanations.push(`Big Platform Bias: Minimum grade limited due to complex ecosystem.`);
        }
    }

    // 6. Classification & Grading
    let classification = '';
    let classificationLabel = '';
    let grade = '';

    // Count explicit high severity flags
    const explicitRiskCount = detectedFlags.filter(f => f.severity === 'HIGH').length;

    // Constraint #2: Do not assign worst grade (D/E) unless at least TWO explicit risk signals are present.
    // (Constraint #5: "Downgrade weak E" is covered by this requirement)

    if (totalScore >= 3 && explicitRiskCount >= 2) {
        classification = 'EXPLICIT_RISK';
        classificationLabel = 'Explicit Risk';
        grade = 'D';
        if (totalScore >= 5) grade = 'E';
    }
    // Constraint #3: Treat Grade C (Vague / Unclear) as default for large platforms (or high scores without 2 risks)
    else if (totalScore >= 1) {
        classification = 'VAGUE';
        classificationLabel = 'Vague / Unclear';
        grade = 'C';

        // Explain downgrade if score highlight it
        if (totalScore >= 3) {
            explanations.push(`(Note: Score is high (${totalScore}), but grade capped at C because < 2 explicit risks were found)`);
        }
    }
    else {
        // Score <= 0 (or < 1)

        // Constraint #4: Grade A ONLY IF explicit safety exists
        if (hasExplicitSafety && totalScore <= 0) {
            classification = 'SAFE';
            classificationLabel = 'Explicitly Safe';
            grade = 'A';
        } else {
            // Default Fallback
            classification = 'VAGUE';
            classificationLabel = 'Vague / Unclear (No explicit safety)';
            grade = 'C';
            if (totalScore <= 0) {
                explanations.push(`Fallback to Grade C: Score is low, but no explicit safety guarantees found.`);
            }
        }
    }

    // Apply Big Platform Bias Check (Constraint #3 reinforcement)
    if (isBigPlatform) {
        if (grade === 'A' || grade === 'B') {
            grade = 'C';
            classification = 'VAGUE';
            classificationLabel = 'Vague / Unclear (Big Platform Bias)';
            explanations.push('Large platform default applied.');
        }
    }

    // Constraint #6: Document vague language note
    if (vagueScore > 0) {
        explanations.push('Note: Vague language often reflects standard legal drafting, not necessarily malicious intent.');
    }

    return {
        flags: detectedFlags,
        grade: grade,
        score: totalScore,
        riskLevel: classification === 'SAFE' ? 'LOW' : (classification === 'EXPLICIT_RISK' ? 'HIGH' : 'MEDIUM'),
        classification,
        classificationLabel,
        explanation: explanations.slice(0, 5).join('. ') + '.',
        stats: {
            wordCount,
            totalScore,
            riskScore,
            vagueScore,
            safetyScore
        }
    };
}
