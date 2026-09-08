export const cryptoPrices = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64492.41, change: -0.54, volume: '$42.8B' },
  { symbol: 'SOL', name: 'Solana', price: 75.91, change: 0.90, volume: '$4.1B' },
  { symbol: 'ETH', name: 'Ethereum', price: 1863.50, change: 0.05, volume: '$18.6B' },
  { symbol: 'BNB', name: 'BNB', price: 567.53, change: -0.72, volume: '$1.7B' },
];

// Shared Solana treasury wallet used for all SOL-denominated payments
// (stakepool deposits, allocation ID service fees, launchpad allocations).
export const SOL_WALLET =
  import.meta.env.VITE_SOL_WALLET || '3rXXcwzLBGcpDQw7HmWFyJWC5FeDyVCAH4vwGU4pAh9w';

export const dashboardSnapshot = {
  title: 'Private Desk',
  caption: 'Markets, yield, and launches.',
  healthScore: 92,
  riskScore: 68,
  liquidity: '$18.6K',
  alphaScore: '72/100',
};

export const metrics = [
  { label: 'Portfolio balance', value: '$45,313.00', delta: '+18.4% this month', tone: 'positive' },
  { label: 'Today PnL', value: '+$2,424.00', delta: '+5.6% today', tone: 'positive' },
  { label: 'Staked assets', value: '$12,450.00', delta: '6.8% avg APY', tone: 'neutral' },
  { label: 'Fixed deposit', value: '14.5% APY', delta: 'Best Goblin Vault', tone: 'positive' },
];

export const portfolioAllocation = [
  { label: 'Crypto trading', value: '48%', amount: '$22,914', color: '#59ff9b' },
  { label: 'Fixed deposits', value: '32%', amount: '$15,276', color: '#ffd166' },
  { label: 'Stakepools', value: '15%', amount: '$7,161', color: '#a78bfa' },
  { label: 'Launchpad reserve', value: '5%', amount: '$2,387', color: '#ff5f7a' },
  { label: 'Liquid Asset', value: '37%', amount: '$18,600', color: '#4dd0e1' },
];

export const topStocks = [
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 394.11, change: -2.18, sector: 'EV / Energy', marketCap: '$789B', allocation: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 196.93, change: 0.71, sector: 'AI Chips', marketCap: '$2.9T', allocation: 0 },
  { symbol: 'COIN', name: 'Coinbase Global', price: 427.91, change: 1.84, sector: 'Crypto Exchange', marketCap: '$68B', allocation: 0 },
  { symbol: 'MSTR', name: 'Strategy Inc.', price: 520.67, change: 3.26, sector: 'Bitcoin Treasury', marketCap: '$31B', allocation: 0 },
];

export const fixedDeposits = [
  { name: 'Goblin Starter Vault', apy: '9.5%', term: '30 days', min: '$50', max: '$5,000', risk: 'Low', color: '#20e080' },
  { name: 'Goblin Growth Vault', apy: '14.5%', term: '90 days', min: '$500', max: '$25,000', risk: 'Medium', color: '#a7ff4f' },
  { name: 'Goblin Titan Vault', apy: '21.0%', term: '180 days', min: '$5,000', max: '$100,000', risk: 'High', color: '#ffcc4d' },
];

export const stakePools = [
  { name: 'GOBLIN Single Stake', token: 'GOBLIN', apy: '18.4%', tvl: '$4.8M', lock: 'Flexible', progress: 76 },
  { name: 'ETH Goblin Yield', token: 'ETH', apy: '7.2%', tvl: '$12.1M', lock: '14 days', progress: 58 },
  { name: 'USDC Goblin Vault', token: 'USDC', apy: '12.8%', tvl: '$8.6M', lock: '30 days', progress: 69 },
];

export const launchpadProjects = [
  {
    name: 'GoblinSwap',
    tag: 'DEX',
    raised: '$2.4M',
    target: '$3.5M',
    allocation: '$1000',
    progress: 68,
    details:
      'GoblinSwap is a community-owned decentralized exchange built for speed and low fees. This allocation secures early supporters a discounted tier with reduced trading fees and governance weight. Raised funds expand liquidity and cover independent smart-contract audits.',
  },
  {
    name: 'MemeForge',
    tag: 'Launchpad',
    raised: '$1.1M',
    target: '$2M',
    allocation: '$1500',
    progress: 55,
    details:
      'MemeForge is a fair-launch meme incubator that lets holders forge utility-backed meme tokens. Your allocation reserves a launchpad slot with bundled marketing and a seeded liquidity pool, plus early access to future forge drops.',
  },
  {
    name: 'ChainWarden',
    tag: 'Security',
    raised: '$4.7M',
    target: '$5M',
    allocation: '$2000',
    progress: 94,
    details:
      'ChainWarden is a real-time on-chain security monitor that flags exploits and rug-pull patterns before they spread. This allocation funds ongoing threat-intelligence research and an open alert API available to all Goblin users.',
  },
];

export const leveragePositions = [
  { pair: 'BTC/USDT', side: 'Long', leverage: '5x', entry: 64492.41, liquidation: 54190, pnl: '+$420.18' },
  { pair: 'ETH/USDT', side: 'Short', leverage: '3x', entry: 1863.50, liquidation: 1938, pnl: '+$118.92' },
  { pair: 'SOL/USDT', side: 'Long', leverage: '8x', entry: 75.91, liquidation: 68.16, pnl: '-$63.20' },
];
