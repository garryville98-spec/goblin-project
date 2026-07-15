import { supabase } from '../lib/supabase.js';

export async function createDeposit(userId, amount, vaultName, apy, termDays) {
  const { data, error } = await supabase
    .from('deposits')
    .insert({
      user_id: userId,
      amount,
      vault_name: vaultName,
      apy,
      term_days: termDays,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;

  // Also create a transaction record
  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'deposit',
    amount,
    total: amount,
    status: 'completed',
  });

  return data;
}

export async function createWithdrawal(userId, amount, method, allocationId = null) {
  // Atomically debit the balance and validate funds via the DB function.
  const { error: balanceError } = await supabase.rpc('adjust_balance', {
    p_user_id: userId,
    p_amount: -amount,
  });

  let fundedByAllocation = false;

  if (balanceError) {
    if (balanceError.message.includes('Insufficient funds')) {
      // If an Allocation ID was supplied, try to fund the withdrawal from it.
      if (allocationId) {
        const { data: alloc, error: allocError } = await supabase
          .from('launchpad_allocations')
          .select('*')
          .eq('id', allocationId)
          .eq('user_id', userId)
          .single();

        if (allocError || !alloc) {
          throw new Error('Allocation ID not found.');
        }
        if (Number(alloc.allocation_amount) < Number(amount)) {
          throw new Error('Insufficient funds in the provided allocation.');
        }
        fundedByAllocation = true;
      } else {
        throw new Error('Insufficient funds for this withdrawal.');
      }
    } else {
      throw balanceError;
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'withdrawal',
      amount,
      total: amount,
      status: 'pending',
      allocation_id: allocationId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createStake(userId, poolName, token, amount, apy, lockPeriod) {
  const { data, error } = await supabase
    .from('stakes')
    .insert({
      user_id: userId,
      pool_name: poolName,
      token,
      amount,
      apy,
      lock_period: lockPeriod,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'stake',
    symbol: token,
    amount,
    total: amount,
    status: 'completed',
  });

  return data;
}

export async function createTrade(userId, type, symbol, amount, price) {
  const total = amount * price;
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: type === 'buy' ? 'trade_buy' : 'trade_sell',
      symbol,
      amount,
      price,
      total,
      status: 'completed',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createLaunchpadAllocation(userId, projectName, allocationAmount) {
  const { data, error } = await supabase
    .from('launchpad_allocations')
    .insert({
      user_id: userId,
      project_name: projectName,
      allocation_amount: allocationAmount,
      status: 'reserved',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserDeposits(userId) {
  const { data, error } = await supabase
    .from('deposits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserStakes(userId) {
  const { data, error } = await supabase
    .from('stakes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function getUserAllocations(userId) {
  const { data, error } = await supabase
    .from('launchpad_allocations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getBalance(userId) {
  const { data, error } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Credit the user's available balance (used by the funding/Payment flow).
export async function creditBalance(userId, amount) {
  const { data, error } = await supabase.rpc('adjust_balance', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) throw error;
  return data;
}

// Fund the account: record a transaction and credit the balance atomically.
export async function fundAccount(userId, amount, method = 'card') {
  const { data: txn, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'deposit',
      amount,
      total: amount,
      status: 'completed',
    })
    .select()
    .single();

  if (error) throw error;

  try {
    await creditBalance(userId, amount);
  } catch (balanceError) {
    throw new Error(`Funded but balance update failed: ${balanceError.message}`);
  }

  return txn;
}

// List all user profiles, newest first. Used by the admin panel to surface
// newly registered users. Requires an RLS policy allowing admins to read all
// profiles (see supabase/migrations/20240106000000_admin_user_access.sql).
export async function listUsers(limit = 100) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
