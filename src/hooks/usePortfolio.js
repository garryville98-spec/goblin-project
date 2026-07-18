import { useEffect, useState } from 'react';
import {
  getBalance,
  getUserDeposits,
  getUserStakes,
  getUserTransactions,
  getUserAllocations,
} from '../services/db.js';

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Aggregates the user's real data into the shapes the Dashboard renders.
export function usePortfolio(userId) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    balance: 0,
    portfolioTotal: 0,
    metrics: [],
    allocation: [],
    activity: [],
    transactions: [],
  });

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function load() {
      try {
        const [balanceRes, deposits, stakes, transactions, allocations] = await Promise.all([
          getBalance(userId).catch(() => ({ available_balance: 0 })),
          getUserDeposits(userId).catch(() => []),
          getUserStakes(userId).catch(() => []),
          getUserTransactions(userId).catch(() => []),
          getUserAllocations(userId).catch(() => []),
        ]);

        if (cancelled) return;

        const available = Number(balanceRes?.available_balance || 0);
        const depositTotal = deposits.reduce((s, d) => s + Number(d.amount || 0), 0);
        const stakeTotal = stakes.reduce((s, s2) => s + Number(s2.amount || 0), 0);
        const allocationTotal = allocations.reduce(
          (s, a) => s + Number(a.allocation_amount || 0),
          0
        );
        const portfolioTotal = available + depositTotal + stakeTotal + allocationTotal;

        const metrics = [
          {
            label: 'Portfolio balance',
            value: fmt(portfolioTotal),
            delta: 'Live from your account',
            tone: 'positive',
          },
          {
            label: 'Available cash',
            value: fmt(available),
            delta: 'Spendable balance',
            tone: 'neutral',
          },
          {
            label: 'Staked assets',
            value: fmt(stakeTotal),
            delta: `${stakes.length} active position${stakes.length === 1 ? '' : 's'}`,
            tone: 'neutral',
          },
          {
            label: 'Fixed deposit',
            value: fmt(depositTotal),
            delta: `${deposits.length} vault${deposits.length === 1 ? '' : 's'}`,
            tone: 'positive',
          },
        ];

        const allocation = [
          { label: 'Available cash', value: pct(available, portfolioTotal), amount: fmt(available), color: '#59ff9b' },
          { label: 'Fixed deposits', value: pct(depositTotal, portfolioTotal), amount: fmt(depositTotal), color: '#ffd166' },
          { label: 'Stakepools', value: pct(stakeTotal, portfolioTotal), amount: fmt(stakeTotal), color: '#a78bfa' },
          { label: 'Launchpad reserve', value: pct(allocationTotal, portfolioTotal), amount: fmt(allocationTotal), color: '#ff5f7a' },
        ];

        const activity = transactions.slice(0, 5).map((t) => ({
          title: labelForType(t.type),
          detail: `${fmt(t.total)} · ${t.status}`,
          time: timeAgo(t.created_at),
        }));

        setState({
          loading: false,
          error: null,
          balance: available,
          portfolioTotal,
          metrics,
          allocation,
          activity,
          transactions,
        });
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}

function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function labelForType(type) {
  const map = {
    deposit: 'Funds added',
    withdrawal: 'Withdrawal requested',
    trade_buy: 'Buy trade',
    trade_sell: 'Sell trade',
    stake: 'Stake created',
    unstake: 'Unstake',
  };
  return map[type] || type;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
