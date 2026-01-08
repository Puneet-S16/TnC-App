/**
 * rules.js
 * Optimized logic for 3-tier risk classification
 */

// 1. EXPLICIT RISK FLAGS (Red Flags)
const EXPLICIT_RISK_FLAGS = [
  {
    id: 'data_sale',
    name: 'Sale of Personal Data',
    description: 'Document explicitly mentions selling data or sharing for commercial purposes.',
    severity: 'HIGH',
    regex: /(sell your data|sell personal data|sell personal information|share.*commercial purposes|share.*business partners|monetize user data)/i
  },
  {
    id: 'third_party_share',
    name: 'Third-Party Data Sharing',
    description: 'Explicit sharing with affiliates, partners, or third parties.',
    severity: 'HIGH',
    regex: /(share.*third parties|share.*affiliates|share.*partners|data.*third party|provide.*third parties)/i
  },
  {
    id: 'auto_renew',
    name: 'Auto-Renewal / Recurring',
    description: 'Service auto-renews without clear consent or ignores cancellation.',
    severity: 'HIGH',
    regex: /(auto-renew|automatic renewal|automatically renew|recurring billing|charged automatically|until you cancel|subscription will continue)/i
  },
  {
    id: 'no_refund',
    name: 'No Refunds',
    description: 'Strict no-refund policy.',
    severity: 'HIGH',
    regex: /(no refunds|non-refundable|all sales are final|cannot be returned|no obligation to refund)/i
  },
  {
    id: 'liability',
    name: 'Limitation of Liability',
    description: 'Company waives responsibility for damages.',
    severity: 'MEDIUM',
    regex: /(limit.*liability|limitation of liability|not liable|as is|no warranty|maximum liability)/i
  },
  {
    id: 'arbitration',
    name: 'Mandatory Arbitration',
    description: 'Waives right to sue or join class actions.',
    severity: 'HIGH',
    regex: /(arbitration|class action waiver|waive right to trial|dispute resolution|binding arbitration)/i
  }
];

// 2. EXPLICIT SAFETY FLAGS (Green Flags)
const EXPLICIT_SAFE_FLAGS = [
  {
    id: 'no_sell',
    regex: /(we do not sell|never sell|will not sell|no sale of personal)/i
  },
  {
    id: 'no_share',
    regex: /(we do not share|never share|will not share|data stays with us|not share.*third parties)/i
  },
  {
    id: 'easy_cancel',
    regex: /(cancel at any time|easy cancellation|refund within|money-back guarantee)/i
  }
];

// 3. VAGUE / EVASIVE LANGUAGE (Yellow Flags)
const VAGUE_FLAGS = [
  { regex: /(partners help us|third parties help us)/i },
  { regex: /(improve our services|enhance user experience)/i },
  { regex: /(business purposes|commercial purposes)/i },
  { regex: /(information we collect|may be used)/i },
  { regex: /(as necessary|reasonable efforts)/i },
  { regex: /(may share|might share)/i }
];

function analyzeText(text) {
  if (!text || typeof text !== 'string') {
    return {
      flags: [],
      grade: 'E',
      riskLevel: 'UNKNOWN',
      classification: 'Unclear',
      explanation: 'No text provided.'
    };
  }

  // A. Detect Explicit Risks
  const detectedRiskFlags = [];
  EXPLICIT_RISK_FLAGS.forEach(rule => {
    if (rule.regex.test(text)) {
      detectedRiskFlags.push({
        ...rule,
        trigger: text.match(rule.regex)[0] // Transparency: Store exact trigger
      });
    }
  });

  // B. Detect Explicit Safety
  let safetyCount = 0;
  const safetyTriggers = [];
  EXPLICIT_SAFE_FLAGS.forEach(rule => {
    if (rule.regex.test(text)) {
      safetyCount++;
      safetyTriggers.push(text.match(rule.regex)[0]);
    }
  });

  // C. Detect Vague Language
  let vagueCount = 0;
  const vagueTriggers = [];
  VAGUE_FLAGS.forEach(rule => {
    const matches = text.match(new RegExp(rule.regex, 'gi'));
    if (matches) {
      vagueCount += matches.length;
      vagueTriggers.push(matches[0]);
    }
  });

  // D. Complexity Heuristic
  const wordCount = text.split(/\s+/).length;
  const isComplex = wordCount > 1000;

  // --- CLASSIFICATION LOGIC ---

  let classification = '';
  let classificationLabel = '';
  let grade = '';
  let explanation = '';

  // 1. Explicit Risk Detected
  if (detectedRiskFlags.length > 0) {
    classification = 'EXPLICIT_RISK';
    classificationLabel = 'Explicit Risk – clear red flags detected';
    grade = detectedRiskFlags.length >= 2 ? 'E' : 'D';
    explanation = `Explicit risk detected due to: "${detectedRiskFlags[0].name}".`;
  }
  // 2. Explicitly Safe (Must have safety + NO vague + NO risk)
  else if (safetyCount > 0 && vagueCount === 0 && !isComplex) {
    classification = 'SAFE';
    classificationLabel = 'Explicitly Safe (based on clear statements)';
    grade = 'A';
    explanation = 'Marked safe due to explicit no-sharing statements and lack of vague language.';
  }
  // 3. Vague / Unclear (Default)
  else {
    classification = 'VAGUE';
    classificationLabel = 'Vague / Unclear – risk may exist';
    grade = 'C';

    if (vagueCount > 3 || isComplex) {
      explanation = 'Marked unclear due to vague legal language and complexity.';
      grade = 'C';
    } else {
      explanation = 'Marked unclear due to lack of explicit safety guarantees.';
      grade = 'B';
    }
  }

  // Map to old structure mostly, but add new fields
  return {
    flags: detectedRiskFlags,
    grade: grade,
    riskLevel: classification === 'SAFE' ? 'LOW' : (classification === 'EXPLICIT_RISK' ? 'HIGH' : 'MEDIUM'),
    classification,
    classificationLabel,
    explanation,
    stats: {
      wordCount,
      vagueCount,
      safetyCount,
      riskCount: detectedRiskFlags.length
    }
  };
}

// Ensure it's available globally in the extension context
if (typeof window !== 'undefined') {
  window.RedFlagLogic = {
    analyzeText,
    EXPLICIT_RISK_FLAGS
  };
}

// For testing environments (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeText, EXPLICIT_RISK_FLAGS };
}
