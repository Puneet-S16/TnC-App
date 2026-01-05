/**
 * rules.js
 * Ported logic for the React website.
 */

export const RED_FLAGS = [
    {
        id: 'auto_renewal',
        name: 'Automatically renews and charges you',
        description: 'Service will auto-renew and charge you unless cancelled. Often difficult to track.',
        severity: 'HIGH',
        regex: /(auto-renew|automatic renewal|automatically renew|recurring billing|subscription will continue|charged automatically|until you cancel|without notice|monthly fee)/i
    },
    {
        id: 'price_change',
        name: 'Prices can change at any time',
        description: 'Terms allow the company to modify fees or increase rates without explicit consent.',
        severity: 'MEDIUM',
        regex: /(change prices|modify fees|increase rates|change the fees|reserve the right to change|price adjustment|subject to change|fees are non-refundable)/i
    },
    {
        id: 'data_sharing',
        name: 'Shares your data with third parties',
        description: 'Personal data may be shared with or sold to third-party partners and affiliates.',
        severity: 'HIGH',
        regex: /(share your data|share your information|sell your data|sell personal information|third party partners|marketing partners|advertising partners|affiliates|share with third parties)/i
    },
    {
        id: 'no_refund',
        name: 'No refunds / All sales final',
        description: 'You may not get your money back even if you are unhappy with the service.',
        severity: 'HIGH',
        regex: /(no refunds|non-refundable|all sales are final|cannot be returned|no obligation to refund|refunds are not available)/i
    },
    {
        id: 'cancellation',
        name: 'Cancellation is difficult or restricted',
        description: 'May require written notice, phone calls, or have strict notice periods.',
        severity: 'MEDIUM',
        regex: /(must call|written notice|in writing|certified mail|cannot cancel|cancellation fee|terminate usage|notice period|30 days prior)/i
    },
    {
        id: 'liability',
        name: 'Waives liability for damages',
        description: 'The company claims no responsibility for damages, even if they are at fault.',
        severity: 'MEDIUM',
        regex: /(limit liability|limitation of liability|not liable|as is|no warranty|disclaim all warranties|maximum liability|indirect damages)/i
    },
    {
        id: 'arbitration',
        name: 'Waives your right to sue (Arbitration)',
        description: 'Forces you into private arbitration and waives your right to a jury trial or class action.',
        severity: 'HIGH',
        regex: /(arbitration|class action waiver|waive right to trial|dispute resolution|binding arbitration|jury trial|waive any right)/i
    }
];

export function analyzeText(text) {
    if (!text || typeof text !== 'string') {
        return { flags: [], grade: 'E', riskLevel: 'UNKNOWN' };
    }

    const detectedFlags = [];
    let highCount = 0;
    let mediumCount = 0;

    RED_FLAGS.forEach(rule => {
        if (rule.regex.test(text)) {
            detectedFlags.push({
                id: rule.id,
                name: rule.name,
                description: rule.description,
                severity: rule.severity,
            });

            if (rule.severity === 'HIGH') highCount++;
            if (rule.severity === 'MEDIUM') mediumCount++;
        }
    });

    let grade = 'A';
    if (highCount >= 2) {
        grade = 'E';
    } else if (highCount === 1) {
        grade = 'D';
    } else if (mediumCount >= 2) {
        grade = 'C';
    } else if (mediumCount === 1) {
        grade = 'B';
    }

    let riskLevel = 'LOW';
    if (['D', 'E'].includes(grade)) riskLevel = 'HIGH';
    else if (['B', 'C'].includes(grade)) riskLevel = 'MEDIUM';

    return {
        flags: detectedFlags,
        grade: grade,
        riskLevel: riskLevel,
        stats: {
            totalFlags: detectedFlags.length,
            high: highCount,
            medium: mediumCount
        }
    };
}
