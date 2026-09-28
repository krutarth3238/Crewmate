import { AutonomyLevel, TeammateProfile, MissionDocket, SkillItem, ApprovalQuest, RelationshipMilestone } from '../types';

export const AUTONOMY_LEVELS: AutonomyLevel[] = [
  {
    id: 1,
    name: 'Shadow',
    tagline: 'Observes orders and workflows, drafts proposals, zero mutation access. Cannot email or alter customer records.',
    requiredXp: 0,
    unlockedPermissions: [
      'Read-only observation of incoming orders, POS transactions & supplier invoices',
      'Generate suggested reply drafts & daily operational diary memos',
      'Continuous anomaly detection (late deliveries, sudden sales dips, price hikes)',
      'Simulate state diffs in sandboxed buffer without external system writes'
    ],
    restrictedPermissions: [
      'Zero mutation rights: cannot send external emails, SMS, or WhatsApp messages',
      'Cannot execute financial payouts or refund customer card charges',
      'Cannot alter live inventory counts or submit supplier purchase orders'
    ],
    failureBound: 'Hard air-gap: zero write permissions (read-only observer sandbox)',
    color: '#38BDF8',
    bgLight: '#0E1726',
    accentBorder: 'border-[#38BDF8]'
  },
  {
    id: 2,
    name: 'Assistant',
    tagline: 'Performs low-risk housekeeping and stages drafts. Every external action requires human tap.',
    requiredXp: 25,
    unlockedPermissions: [
      'Draft personalized replies to delayed delivery & customer support inquiries',
      'Stage weekly ingredient re-stock orders for 1-tap owner confirmation',
      'Flag price mismatches between supplier contracts and delivery receipts',
      'Prepare automated morning prep digests & daily sales summaries'
    ],
    restrictedPermissions: [
      'Cannot dispatch customer emails or offers without explicit human tap',
      'Cannot execute automated refunds above $0.00',
      'Cannot modify accounting chart of accounts or banking routing credentials'
    ],
    failureBound: 'Halts immediately if human approval signature is not present',
    color: '#1842FF',
    bgLight: '#10172A',
    accentBorder: 'border-[#1842FF]'
  },
  {
    id: 3,
    name: 'Operator',
    tagline: 'Executes verified daily operations autonomously within strict mathematical bounds.',
    requiredXp: 65,
    unlockedPermissions: [
      'Auto-reconcile POS transactions & payment settlements with zero variance ($0.00)',
      'Dispatch tracking updates & automated delivery delay notifications to customers',
      'Synchronize live inventory between online store and physical shop shelves',
      'Trigger pre-approved automated re-orders for staple goods with trusted suppliers'
    ],
    restrictedPermissions: [
      'Cannot issue customer goodwill refunds or discounts exceeding $50.00 without Quest approval',
      'Cannot terminate supplier contracts or change payment destinations',
      'Cannot delete customer historical order data'
    ],
    failureBound: 'Fail-closed invariant: balance variance must strictly equal $0.000',
    color: '#00C853',
    bgLight: '#0A1E14',
    accentBorder: 'border-[#00C853]'
  },
  {
    id: 4,
    name: 'Partner',
    tagline: 'Authorizes medium-stakes decisions and proactively unblocks operational bottlenecks.',
    requiredXp: 110,
    unlockedPermissions: [
      'Approve customer compensation and store credits up to $250.00',
      'Negotiate volume discount pricing tiers with suppliers based on purchase velocity',
      'Execute multi-channel promotional re-engagement for dormant customer segments',
      'Dynamically adjust batch production forecasts based on weather and local footfall patterns'
    ],
    restrictedPermissions: [
      'Cannot sign new vendor master agreements without owner authorization',
      'Cannot modify business banking mandates or legal ownership records'
    ],
    failureBound: 'Policy breaker locks execution if budget spend exceeds monthly cap',
    color: '#D8F040',
    bgLight: '#1B1E0A',
    accentBorder: 'border-[#D8F040]'
  },
  {
    id: 5,
    name: 'Co-Founder',
    tagline: 'Cross-functional autonomous leadership with deep institutional memory.',
    requiredXp: 180,
    unlockedPermissions: [
      'Full autonomous operation across POS, accounting, inventory, and supplier APIs',
      'Self-healing inventory buffer reallocation across physical storefront and online orders',
      'Continuous margin optimization across all product lines with zero manual upkeep',
      'Autonomous weekly strategic synthesis, profitability forecasting & growth modeling'
    ],
    restrictedPermissions: [
      'Cannot override human emergency killswitch (immutable safety root)'
    ],
    failureBound: 'Cryptographic Merkle seal required on 100% of state transitions',
    color: '#A855F7',
    bgLight: '#1F1235',
    accentBorder: 'border-[#A855F7]'
  }
];

export const INITIAL_TEAMMATE: TeammateProfile = {
  name: 'Ren',
  avatarSeed: 'RN',
  visualMark: '⚡',
  roleTitle: 'Autonomous Operations Teammate',
  businessType: "Meera's Artisan Bakery (Fresh Baked Goods & Cafe)",
  currentLevel: 1, // Starts at Level 1 Shadow as in Chapter 4!
  currentXp: 14,
  nextLevelXp: 25,
  streakDays: 12,
  streakShields: 2,
  totalMissionsCompleted: 14,
  hoursSaved: 18.5,
  accuracyRate: 100.0,
  activeSkills: ['skill-weekend-anomaly', 'skill-supplier-price', 'skill-restock-radar', 'skill-payment-reconcile']
};

export const INITIAL_MISSIONS: MissionDocket[] = [
  {
    id: 'm-001',
    refCode: 'DOCKET #RN-884',
    title: 'Supplier Price Fluctuation Alert: Organic Butter Hiked +14%',
    category: 'inventory',
    status: 'verified',
    timestamp: 'Today at 07:15 AM',
    executionDuration: '0.8 SEC',
    systemsTouched: ['Supplier Invoices API', 'QuickBooks Ledger', 'Inventory Buffer'],
    summary: 'Detected unannounced price hike by Valley Dairy Co. on Tuesday delivery invoice #8841 ($4.80 → $5.47/kg for 120kg European unsalted butter). Calculated batch margin compression (-2.4%) and prepared supplier credit claim memo.',
    auditedValue: '+$80.40 Overcharge Flagged',
    confidenceScore: 99.8,
    verificationSeal: '0x94f2b1a8...c841',
    beforeState: 'Valley Dairy invoice #8841 processed with higher rate unflagged',
    afterState: 'Overcharge isolated; supplier dispute credit request drafted with PO contract attached',
    journalLinesCount: 42,
    xpAwarded: 15
  },
  {
    id: 'm-002',
    refCode: 'DOCKET #RN-879',
    title: 'Footfall Pattern Analysis: Slow Tuesday Walk-in Correlation',
    category: 'sales',
    status: 'verified',
    timestamp: 'Yesterday at 04:30 PM',
    executionDuration: '1.2 SEC',
    systemsTouched: ['Square POS', 'City Works Feed', 'Footfall Sensor'],
    summary: 'Identified -28% dip in Tuesday afternoon walk-in counter revenue ($1,420 vs $1,970 typical). Cross-referenced municipal utility logs to reveal emergency water main repair closing 4th Avenue parking. Adjusted Wednesday morning croissant bake sheet down 20% to prevent waste.',
    auditedValue: '20% Waste Avoided',
    confidenceScore: 98.6,
    verificationSeal: '0x4c89da01...e309',
    beforeState: 'Unexplained Tuesday revenue dip risking Wednesday over-bake waste',
    afterState: 'Correlated root cause with street repairs; production recipe batches calibrated down',
    journalLinesCount: 68,
    xpAwarded: 18
  },
  {
    id: 'm-003',
    refCode: 'DOCKET #RN-862',
    title: 'Weekend Sourdough Sales Anomaly: Delayed Delivery Investigation',
    category: 'finance',
    status: 'verified',
    timestamp: '3 days ago',
    executionDuration: '1.4 SEC',
    systemsTouched: ['Square POS', 'Logistics GPS', 'Customer Order Book'],
    summary: 'Analyzed weekend sales dip: isolated Saturday 7:00 AM – 10:30 AM window. Organic sourdough flour shipment arrived 3 hours late, forcing cancellation of 18 catering pre-orders ($740 lost). Isolated delivery vendor SLA breach for carrier reimbursement claim.',
    auditedValue: '$740 SLA Claim Prepared',
    confidenceScore: 100.0,
    verificationSeal: '0x7129bc89...994e',
    beforeState: 'Owner suspected customer footfall decline or competition',
    afterState: 'Proven root cause was 3-hr late ingredient arrival; footfall was actually +8% higher',
    journalLinesCount: 112,
    xpAwarded: 20
  },
  {
    id: 'm-004',
    refCode: 'DOCKET #RN-845',
    title: 'Flour Buffer Restock Reminder: Organic Rye & Baker Wheat Runout',
    category: 'inventory',
    status: 'verified',
    timestamp: '4 days ago',
    executionDuration: '0.6 SEC',
    systemsTouched: ['Inventory Weight Scales', 'Order Pipeline', 'Supplier Catalog'],
    summary: 'Monitored daily flour consumption velocity. Alerted bakery owner that stoneground organic rye reached 2.4 days safety buffer. Prepared standard replenishment PO #108 for Stone Mill Artisans ready for 1-tap dispatch.',
    auditedValue: 'Zero Prep Disruption',
    confidenceScore: 100.0,
    verificationSeal: '0x18a9ef33...b712',
    beforeState: 'Rye flour stock dropping below weekend safety threshold unnoticed',
    afterState: 'Replenishment order staged and confirmed; delivery arrived Friday 5:30 AM',
    journalLinesCount: 28,
    xpAwarded: 15
  },
  {
    id: 'm-005',
    refCode: 'DOCKET #RN-831',
    title: 'Payment Settlement Reconciliation: 142 POS Settlements Balanced',
    category: 'finance',
    status: 'verified',
    timestamp: '5 days ago',
    executionDuration: '1.1 SEC',
    systemsTouched: ['Square POS', 'Stripe Terminal', 'QuickBooks Online'],
    summary: 'Autonomously audited 142 contactless card and mobile payment batches against the day\'s cash register and bank deposit slip. Reconciled $3,842.50 with exactly $0.00 mathematical variance and zero unresolved discrepancies.',
    auditedValue: '$3,842.50 Balanced',
    confidenceScore: 100.0,
    verificationSeal: '0x55dc9910...aa02',
    beforeState: '142 unlinked transaction slips requiring 45 minutes manual tally',
    afterState: 'Dual-entry balanced to zero drift; journal entry committed to accounting books',
    journalLinesCount: 284,
    xpAwarded: 20
  }
];

export const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'skill-weekend-anomaly',
    title: 'Weekend Sales & Footfall Anomaly Detector',
    category: 'sales',
    categoryLabel: 'Sales & Revenue Analysis',
    levelRequired: 1,
    description: 'Watches POS hourly receipts, detects unexplained drops, and cross-references external causes (weather, traffic, delayed shipments).',
    inActionSummary: 'Builds a 3-step investigation plan and delivers a clear narrative finding instead of raw spreadsheets.',
    equipped: true,
    sampleObjective: 'Figure out why my weekend sales dropped and compare with last month',
    supportedTools: ['Square POS', 'Stripe', 'Weather API', 'Google Maps'],
    accentColor: '#38BDF8'
  },
  {
    id: 'skill-supplier-price',
    title: 'Supplier Price & Invoice Fluctuation Radar',
    category: 'inventory',
    categoryLabel: 'Inventory & Procurement',
    levelRequired: 1,
    description: 'Flags when ingredient suppliers quietly raise unit prices on delivery receipts compared to pre-negotiated contracts.',
    inActionSummary: 'Compares line-item invoice rates against purchase order agreements and drafts credit dispute memos.',
    equipped: true,
    sampleObjective: 'Flag which supplier prices changed on this week\'s invoices compared to last month',
    supportedTools: ['QuickBooks', 'PDF Invoices', 'Gmail API'],
    accentColor: '#D8F040'
  },
  {
    id: 'skill-restock-radar',
    title: 'Restocking Reminders & Buffer Guard',
    category: 'inventory',
    categoryLabel: 'Inventory & Procurement',
    levelRequired: 1,
    description: 'Calculates consumption velocity for key ingredients (butter, flour, yeast, packaging) and alerts before safety buffers deplete.',
    inActionSummary: 'Turns raw inventory counts into proactive replenishment alerts with pre-filled supplier orders.',
    equipped: true,
    sampleObjective: 'Check flour and butter inventory levels before tomorrow\'s 6:00 AM bake prep',
    supportedTools: ['Inventory Database', 'Order Book', 'Supplier Catalog'],
    accentColor: '#00C853'
  },
  {
    id: 'skill-customer-replies',
    title: 'Customer Inquiry & Delayed Delivery Reply Drafter',
    category: 'support',
    categoryLabel: 'Customer Relations',
    levelRequired: 2,
    description: 'Drafts empathetic, accurate responses to customer order questions, delivery updates, and catering inquiries. Needs Meera\'s tap to send.',
    inActionSummary: 'Extracts real-time bakery status and writes ready-to-send draft replies for 1-tap confirmation.',
    equipped: false,
    sampleObjective: 'Draft empathetic replies to 12 delayed delivery inquiries with fresh morning bake ETAs',
    supportedTools: ['Zendesk', 'Gmail', 'Square Orders', 'WhatsApp'],
    accentColor: '#1842FF'
  },
  {
    id: 'skill-payment-reconcile',
    title: 'POS & Card Settlement Auto-Reconciliation',
    category: 'finance',
    categoryLabel: 'Financials & Invoicing',
    levelRequired: 3,
    description: 'Matches card reader batches, cash deposits, and delivery platform payouts against the accounting ledger with $0.00 mathematical variance.',
    inActionSummary: 'Eliminates hours of manual bookkeeping by balancing dual-entry ledgers automatically.',
    equipped: true,
    sampleObjective: 'Reconcile today\'s POS card batches ($3,842) against the bank ledger and highlight any fee drift',
    supportedTools: ['Square POS', 'Stripe Terminal', 'QuickBooks', 'Bank Feed'],
    accentColor: '#00C853'
  },
  {
    id: 'skill-dormant-offers',
    title: 'Dormant Customer Re-Engagement & Offers',
    category: 'sales',
    categoryLabel: 'Sales & Revenue Analysis',
    levelRequired: 3,
    description: 'Identifies loyal regulars who haven\'t visited in 30 days and stages personalized invite offers for owner sign-off.',
    inActionSummary: 'Proposes targeted friendly promotions without ever sending anything without explicit permission.',
    equipped: false,
    sampleObjective: 'Prepare a warm 15% comeback offer for 40 regulars who haven\'t visited in 30 days',
    supportedTools: ['Customer CRM', 'Email Campaign', 'Square Loyalty'],
    accentColor: '#FF441F'
  }
];

export const INITIAL_APPROVAL_QUESTS: ApprovalQuest[] = [
  {
    id: 'quest-001',
    refCode: 'QUEST #RN-01',
    title: 'Ren wants to send a 15% discount offer to 40 customers who haven\'t ordered in a month. Approve?',
    reason: 'Safety valve: Requires human owner approval before sending external promotions or discounts.',
    amountOrScope: '40 Inactive Regulars · 15% Off Sourdough Batch',
    systems: ['Customer Order CRM', 'Email Dispatch API', 'Square Loyalty'],
    timestamp: '15 minutes ago',
    xpReward: 20,
    details: 'Ren identified 40 customers who visited 3+ times in July but had zero orders in the last 30 days. Proposes sending a friendly "We baked something fresh for you" email with a 1-week 15% discount code on artisan sourdough loaves. Projected revenue recovery: $540. One tap approves dispatch.',
    status: 'pending'
  },
  {
    id: 'quest-002',
    refCode: 'QUEST #RN-02',
    title: 'Ren wants to dispatch weekly bakery flour & butter restocking order ($1,420). Approve?',
    reason: 'Expenditure threshold: Purchase order exceeds $500 standard Assistant limit.',
    amountOrScope: '$1,420 Weekly Ingredient Procurement',
    systems: ['Stone Mill Artisans API', 'Valley Dairy Co', 'QuickBooks'],
    timestamp: '2 hours ago',
    xpReward: 25,
    details: 'Calculated 7-day bake schedule consumption: 350kg unbleached organic wheat flour, 80kg rye flour, and 100kg European butter. Order pre-negotiated with volume discount saving $68. Requires Meera\'s tap to authorize vendor payment.',
    status: 'pending'
  }
];

export const SAMPLE_SIMULATOR_PRESETS = [
  {
    label: '🥐 Figure out why weekend sales dropped',
    objective: 'Figure out why my weekend sales dropped and compare with last month',
    tools: ['Square POS', 'Logistics GPS', 'Customer Order Book'],
    estDuration: '1.4s',
    expectedValue: 'Root cause isolated (late supplier van delayed bake 3 hrs)',
    xp: 20
  },
  {
    label: '🔍 Flag supplier price changes on invoices',
    objective: 'Flag which supplier prices changed on this week\'s delivery invoices compared to contract',
    tools: ['QuickBooks', 'PDF Invoices', 'Supplier Catalog'],
    estDuration: '1.1s',
    expectedValue: 'Valley Dairy +14% butter hike isolated',
    xp: 15
  },
  {
    label: '🌾 Check flour & butter restocking buffer',
    objective: 'Check flour and butter inventory levels before tomorrow\'s 6:00 AM bake prep',
    tools: ['Inventory Scale DB', 'Order Pipeline', 'Stone Mill API'],
    estDuration: '0.9s',
    expectedValue: 'Rye flour 2.4-day buffer alert staged',
    xp: 15
  },
  {
    label: '📑 Reconcile POS settlements to ledger',
    objective: 'Reconcile today\'s POS card batches ($3,842) against the bank ledger and highlight fee drift',
    tools: ['Square POS', 'Stripe Terminal', 'QuickBooks Online'],
    estDuration: '1.2s',
    expectedValue: '142 slips balanced to $0.00 drift',
    xp: 20
  }
];

export const RELATIONSHIP_TIMELINE: RelationshipMilestone[] = [
  {
    day: 'Day 01',
    title: 'Recruited in Shadow Mode (Feature G → A → H)',
    description: 'Meera typed "Figure out why my weekend sales dropped", watched it think, and hired Ren. Ren initialized with Level 1 Shadow clearance (0 mutation access). Watched 40 orders and surfaced 2 supplier price fluctuations.',
    levelBadge: 'Level 1 · Shadow',
    highlightStat: 'Zero mutations made (100% safe)'
  },
  {
    day: 'Day 05',
    title: '14 Verified Tasks → Unlocking Assistant Level',
    description: 'Ren recorded 14 verified findings in the Mission Log (price hikes, delivery anomalies, inventory warnings) with 100% accuracy. Unlocked Assistant clearance to draft customer replies.',
    levelBadge: 'Level 2 · Assistant',
    highlightStat: '14/14 findings verified'
  },
  {
    day: 'Day 12',
    title: 'Promoted to Operator Autonomy',
    description: 'Cleared for direct operational balancing. Reconciled $18,400 in POS card batches across Square and Stripe with zero mathematical variance and zero manual bookkeeping.',
    levelBadge: 'Level 3 · Operator',
    highlightStat: '$18.4K reconciled'
  },
  {
    day: 'Day 19 (Today)',
    title: '12-Day Flawless Reliability Streak',
    description: '142 total tasks completed without a single human rollback or error. 18.5 hours saved every week for Meera and her bakery team.',
    levelBadge: '12-Day Streak · 100% Reliable',
    highlightStat: '18.5 hrs saved / wk'
  }
];
