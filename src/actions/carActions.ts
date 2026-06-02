'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { buildCar } from '@/lib/calculateLoan';
import type { CarFormInput } from '@/types/index';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return { userId: session.user.id };
}

// ─── Get all cars for the logged-in user ─────────────────────────────────────

export async function getCars() {
  const session = await requireAuth();
  const cars = await db.car.findMany({
    where:   { userId: session.userId },
    include: { schedule: { orderBy: { no: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return cars.map(car => ({
    ...car,
    vehicleType: car.vehicleType as 'car' | 'motorcycle',
    createdAt: car.createdAt.toISOString(),
    monthlyExcVAT: (car.principal + car.totalInterest) / car.termMonths,
    monthlyIncVAT: ((car.principal + car.totalInterest) / car.termMonths) * (car.includeVat ? 1.07 : 1),
  }));
}

// ─── Add a car ───────────────────────────────────────────────────────────────

export async function addCarAction(input: CarFormInput) {
  const session = await requireAuth();

  const built = buildCar({
    ...input,
    price:       String(input.price).replace(/,/g, ''),
    downPayment: String(input.downPayment).replace(/,/g, ''),
    ppi:         String(input.ppi ?? '0').replace(/,/g, ''),
  });
  if (!built) throw new Error('Invalid car data');

  await db.car.create({
    data: {
      userId:        session.userId,
      vehicleType:   built.vehicleType,
      name:          built.name,
      price:         built.price,
      downPayment:   built.downPayment,
      ppi:           built.ppi ?? 0,
      principal:     built.principal,
      annualRate:    built.annualRate,
      termMonths:    built.termMonths,
      startDate:     built.startDate,
      includeVat:    built.includeVat ?? true,
      monthlyAmt:    built.monthlyAmt,
      totalInterest: built.totalInterest,
      totalWithVAT:  built.totalWithVAT,
      schedule: {
        create: built.schedule.map(inst => ({
          no:      inst.no,
          dueDate: inst.dueDate,
          amount:  inst.amount,
          isPaid:  inst.isPaid,
        })),
      },
    },
  });

  revalidatePath('/');
}

// ─── Update a car (edit) ─────────────────────────────────────────────────────

export async function updateCarAction(carId: string, input: CarFormInput) {
  const session = await requireAuth();

  // Verify ownership
  const existing = await db.car.findFirst({ where: { id: carId, userId: session.userId } });
  if (!existing) throw new Error('Car not found');

  const built = buildCar({
    ...input,
    price:       String(input.price).replace(/,/g, ''),
    downPayment: String(input.downPayment).replace(/,/g, ''),
    ppi:         String(input.ppi ?? '0').replace(/,/g, ''),
  });
  if (!built) throw new Error('Invalid car data');

  // Fetch existing installments to preserve isPaid state
  const existingInstallments = await db.installment.findMany({ where: { carId } });

  await db.$transaction([
    db.installment.deleteMany({ where: { carId } }),
    db.car.update({
      where: { id: carId },
      data: {
        vehicleType:   built.vehicleType,
        name:          built.name,
        price:         built.price,
        downPayment:   built.downPayment,
        ppi:           built.ppi ?? 0,
        principal:     built.principal,
        annualRate:    built.annualRate,
        termMonths:    built.termMonths,
        startDate:     built.startDate,
        includeVat:    built.includeVat ?? true,
        monthlyAmt:    built.monthlyAmt,
        totalInterest: built.totalInterest,
        totalWithVAT:  built.totalWithVAT,
        schedule: {
          create: built.schedule.map(inst => ({
            no:      inst.no,
            dueDate: inst.dueDate,
            amount:  inst.amount,
            isPaid:  existingInstallments[inst.no - 1]?.isPaid ?? false,
          })),
        },
      },
    }),
  ]);

  revalidatePath('/');
}

// ─── Delete a car ─────────────────────────────────────────────────────────────

export async function deleteCarAction(carId: string) {
  const session = await requireAuth();
  await db.car.deleteMany({ where: { id: carId, userId: session.userId } });
  revalidatePath('/');
}

// ─── Toggle installment paid status ──────────────────────────────────────────

export async function togglePaidAction(carId: string, installmentId: string) {
  const session = await requireAuth();

  // Verify car ownership
  const car = await db.car.findFirst({ where: { id: carId, userId: session.userId } });
  if (!car) throw new Error('Car not found');

  const inst = await db.installment.findFirst({ where: { id: installmentId, carId } });
  if (!inst) throw new Error('Installment not found');

  await db.installment.update({
    where: { id: installmentId },
    data:  { isPaid: !inst.isPaid },
  });

  revalidatePath('/');
}
