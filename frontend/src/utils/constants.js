export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
};

export const CAMPAIGN_STATUSES = {
  DRAFT: { label: 'Draft', color: 'slate' },
  ACTIVE: { label: 'Active', color: 'emerald' },
  COMPLETED: { label: 'Completed', color: 'cyan' },
  CANCELLED: { label: 'Cancelled', color: 'rose' }
};

export const EVENT_SEVERITIES = {
  CRITICAL: { label: 'Critical', color: 'rose', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  HIGH: { label: 'High', color: 'amber', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  MEDIUM: { label: 'Medium', color: 'yellow', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  LOW: { label: 'Low', color: 'blue', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
};

export const EVENT_STATUSES = {
  OPEN: { label: 'Open', color: 'rose' },
  INVESTIGATING: { label: 'Investigating', color: 'amber' },
  RESOLVED: { label: 'Resolved', color: 'emerald' },
  DISMISSED: { label: 'Dismissed', color: 'slate' }
};

// 1-Click Quick Demo accounts for evaluators
export const DEMO_USERS = [
  {
    label: 'Tenant A — Admin',
    desc: 'CyberShield Corp • Full Admin Access',
    email: 'admin@cybershield.io',
    password: 'Password123!',
    role: 'ADMIN',
    tenant: 'CyberShield Corp',
    color: 'emerald'
  },
  {
    label: 'Tenant A — Manager',
    desc: 'CyberShield Corp • Campaigns & Events',
    email: 'manager@cybershield.io',
    password: 'Password123!',
    role: 'MANAGER',
    tenant: 'CyberShield Corp',
    color: 'amber'
  },
  {
    label: 'Tenant A — Analyst',
    desc: 'CyberShield Corp • Read-Only View',
    email: 'analyst@cybershield.io',
    password: 'Password123!',
    role: 'USER',
    tenant: 'CyberShield Corp',
    color: 'cyan'
  },
  {
    label: 'Tenant B — Admin (Cross-Tenant Test)',
    desc: 'SentinelOps Inc • Isolated Organization',
    email: 'admin@sentinelops.io',
    password: 'Password123!',
    role: 'ADMIN',
    tenant: 'SentinelOps Inc',
    color: 'purple'
  }
];
