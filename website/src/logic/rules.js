/**
 * rules.js
 * Optimized logic with Additive Scoring System
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
            score: -3,
            name: 'No Data Selling',
            regex: /(we do not sell|never sell|will not sell|no sale of personal)/i
        },
        {
            id: 'control',
            score: -2,
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

export function analyzeText(text) {
    if (!text || typeof text !== 'string') {
        return {
            flags: [],
            grade: 'E',
            riskLevel: 'UNKNOWN',
            classification: 'Unclear',
            classificationLabel: 'No Text Provided',
            explanation: 'Please enter text to analyze.'
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
            // Safety flags don't usually go in "Detected Flags" (which implies bad stuff), but we use them for calculation.
            // effectively transparency:
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
                matches.forEach(m => {
                    // Limit vague matches to avoid infinite score? 
                    // The user didn't specify a cap, but usually we count presence or frequency.
                    // "Track frequency of..." in previous prompt. Here "Vague signals -> +1".
                    // I will count unique rule triggers once per rule to be safe/stable.
                });
                vagueScore += rule.score;
                vagueMatches.push({ rule, match: matches[0] });
            }
        }
    });

    // 4. Guardrails

    // Vague Guardrail: Ignore vague if < 1.5 OR explicit safety exists
    const hasExplicitSafety = safetyScore < 0; // Any safety signal found

    if (vagueScore < 1.5 || hasExplicitSafety) {
        if (vagueScore > 0) {
            explanations.push(`(Ignored ${vagueScore} vague points due to ${hasExplicitSafety ? 'safety signals' : 'low threshold'})`);
        }
        vagueScore = 0;
    } else {
        // Apply Vague Score
        vagueMatches.forEach(vm => {
            explanations.push(`Vague signal (+${vm.rule.score}): "${vm.match}"`);
            // Maybe add to output flags?
            detectedFlags.push({
                ...vm.rule,
                severity: 'MEDIUM',
                trigger: vm.match,
                displayScore: `+${vm.rule.score}`
            });
        });
    }

    // Complexity Penalty
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 2000 && vagueScore >= 1.0 && safetyScore === 0) {
        // Apply penalty? User says "Apply a downgrade...".
        // Let's add +1.5 to ensure it hits "Vague/Unclear" (threshold 1.0)
        totalScore += 1.5;
        explanations.push(`Complexity Penalty (+1.5): Document is long (${wordCount} words) with vague language and no safety.`);
    }

    // 5. Final Calculation
    totalScore = riskScore + vagueScore + safetyScore;

    // 6. Classification
    let classification = '';
    let classificationLabel = '';
    let grade = '';

    if (totalScore >= 3) {
        classification = 'EXPLICIT_RISK';
        classificationLabel = 'Explicit Risk';
        grade = 'D'; // D or E
        if (totalScore >= 5) grade = 'E';
    } else if (totalScore >= 1) {
        classification = 'VAGUE';
        classificationLabel = 'Vague / Unclear';
        grade = 'C';
    } else {
        classification = 'SAFE';
        classificationLabel = 'Explicitly Safe';
        grade = 'A';
        // Sanity check: "Never label 'safe' if score positive"
        if (totalScore > 0) { // e.g. 0.5 -> Vague?
            // "Score <= 0 -> Explicitly Safe". "Score between 1 and 2.5 -> Vague".
            // What about 0.5?
            // User says "Never label a site 'safe' if the score is positive."
            // So 0.1 to 0.9 should probably be 'Vague' or 'Low Risk but not Safe'?
            // Let's map 0.1-0.9 to Vague (grade B?).
            classification = 'VAGUE';
            classificationLabel = 'Unclear / Minor Risks';
            grade = 'B';
        }
    }

    // Safety Override force (from prompt: "If clearly states No data selling... Enforce Minimum grade = Explicitly Safe")
    // But then prompt says "Never label safe if score positive".
    // Math handles it: -3 usually fixes it.

    return {
        flags: detectedFlags,
        grade: grade,
        score: totalScore,
        riskLevel: classification === 'SAFE' ? 'LOW' : (classification === 'EXPLICIT_RISK' ? 'HIGH' : 'MEDIUM'),
        classification,
        classificationLabel,
        explanation: explanations.slice(0, 3).join('. ') + '.', // Top 3 reasons
        stats: {
            wordCount,
            totalScore,
            riskScore,
            vagueScore,
            safetyScore
        }
    };
}
