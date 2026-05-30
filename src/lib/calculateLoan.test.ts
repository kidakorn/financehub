import { buildCar, getCarStats } from './calculateLoan';
import type { CarFormInput } from '@/types/index';

describe('calculateLoan', () => {
  describe('buildCar', () => {
    it('should build a valid Car object and calculate the exact monthly installments', () => {
      const input: CarFormInput = {
        vehicleType: 'car',
        name: 'Test Car',
        price: '1000000',
        downPayment: '200000',
        annualRate: '5',
        termMonths: '60',
        startDate: '2023-01-01',
      };

      const car = buildCar(input);
      expect(car).not.toBeNull();
      
      if (car) {
        expect(car.principal).toBe(800000); // 1,000,000 - 200,000
        
        // Interest: 800,000 * 5% * 5 years = 200,000
        expect(car.totalInterest).toBe(200000);
        
        // Monthly ex VAT: (800,000 + 200,000) / 60 = 16,666.666...
        // Monthly inc VAT (7%): 16,666.666 * 1.07 = 17,833.333...
        expect(Math.round(car.monthlyAmt)).toBe(17833);
        
        expect(car.schedule.length).toBe(60);
        expect(car.schedule[0].no).toBe(1);
        expect(car.schedule[0].amount).toBe(car.monthlyAmt);
        expect(car.schedule[0].isPaid).toBe(false);
      }
    });

    it('should return null for invalid inputs', () => {
      const input: CarFormInput = {
        vehicleType: 'car',
        name: '',
        price: 'abc', // invalid
        downPayment: '200000',
        annualRate: '5',
        termMonths: '60',
        startDate: '2023-01-01',
      };

      const car = buildCar(input);
      expect(car).toBeNull();
    });

    it('should return null if downPayment is greater than or equal to price', () => {
      const input: CarFormInput = {
        vehicleType: 'car',
        name: '',
        price: '100000',
        downPayment: '100000',
        annualRate: '5',
        termMonths: '60',
        startDate: '2023-01-01',
      };

      const car = buildCar(input);
      expect(car).toBeNull();
    });
  });

  describe('getCarStats', () => {
    it('should correctly calculate stats when some installments are paid', () => {
      const input: CarFormInput = {
        vehicleType: 'car',
        name: 'Test',
        price: '1000000',
        downPayment: '0',
        annualRate: '0', // 0 interest to make math easy
        termMonths: '10',
        startDate: '2023-01-01',
      };

      const car = buildCar(input)!;
      // Mark 3 as paid
      car.schedule[0].isPaid = true;
      car.schedule[1].isPaid = true;
      car.schedule[2].isPaid = true;

      const stats = getCarStats(car);
      expect(stats.paidCount).toBe(3);
      expect(stats.remainingCount).toBe(7);
      expect(stats.progressPct).toBe(30); // 3 out of 10
      expect(Math.round(stats.totalPaid)).toBe(Math.round(car.monthlyAmt * 3));
      expect(Math.round(stats.remaining)).toBe(Math.round(car.monthlyAmt * 7));
    });
  });
});
