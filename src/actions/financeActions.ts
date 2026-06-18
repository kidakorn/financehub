'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function getFinanceData(month: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const [incomeSources, plannedExpenses, cars] = await Promise.all([
    db.incomeSource.findMany({
      where: { userId },
      include: {
        actuals: {
          where: { month },
        },
      },
    }),
    db.plannedExpense.findMany({
      where: { userId, month },
      orderBy: { expectedDate: 'asc' },
    }),
    db.car.findMany({
      where: { userId },
      include: {
        schedule: {
          where: { dueDate: { startsWith: month } },
        },
      },
    }),
  ]);

  return { incomeSources, plannedExpenses, cars };
}

export async function addIncomeSource(data: {
  name: string;
  estimatedAmount: number;
  payday: string; // YYYY-MM-DD
  shiftWeekend: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;
  
  await db.incomeSource.create({
    data: {
      userId,
      name: data.name,
      estimatedAmount: data.estimatedAmount,
      payday: data.payday,
      shiftWeekend: data.shiftWeekend,
    },
  });

  revalidatePath('/');
}

export async function confirmMonthlyIncome(sourceId: string, month: string, actualAmount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Verify ownership
  const source = await db.incomeSource.findFirst({
    where: { id: sourceId, userId },
  });
  if (!source) throw new Error('Income source not found');

  await db.monthlyIncome.upsert({
    where: {
      sourceId_month: {
        sourceId,
        month,
      },
    },
    update: {
      actualAmount,
      isConfirmed: true,
    },
    create: {
      sourceId,
      month,
      actualAmount,
      isConfirmed: true,
    },
  });

  revalidatePath('/');
}

export async function addPlannedExpense(data: {
  name: string;
  category: string;
  amount: number;
  expectedDate: string; // YYYY-MM-DD
  month: string; // YYYY-MM
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await db.plannedExpense.create({
    data: {
      userId,
      name: data.name,
      category: data.category,
      amount: data.amount,
      expectedDate: data.expectedDate,
      month: data.month,
    },
  });

  revalidatePath('/');
}
