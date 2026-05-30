import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCarModal from './AddCarModal';

// Mock the store hooks
jest.mock('@/store/useAppStore', () => ({
  useAddCar: () => jest.fn(),
}));

const mockDict = {
  modalTitleAdd: 'Add Vehicle',
  btnCancel: 'Cancel',
  btnSave: 'Save',
  labelCarName: 'Car Name',
  placeholderCarName: 'Enter name',
  labelPrice: 'Price',
  labelDown: 'Down',
  labelRate: 'Rate',
  labelStartDate: 'Start',
  labelTerm: 'Term',
  labelTermPresets: 'Presets',
  unitMonths: 'mo',
  errorInvalid: 'Invalid',
} as any;

describe('AddCarModal CSS (Tailwind)', () => {
  it('should apply the correct tailwind utility classes for the active vehicle type tab', () => {
    render(<AddCarModal isOpen={true} onClose={() => {}} dict={mockDict} />);

    // By default, 'Car' is active
    const carTab = screen.getByText('Car');
    const motoTab = screen.getByText('Motorcycle');

    // Car button should have the active classes
    expect(carTab).toHaveClass('bg-white', 'text-foreground');

    // Motorcycle button should have the inactive classes
    expect(motoTab).toHaveClass('text-muted-foreground');
    expect(motoTab).not.toHaveClass('bg-white');
    expect(motoTab).not.toHaveClass('text-foreground');

    // Click the Motorcycle button
    fireEvent.click(motoTab);

    // Now Motorcycle button should have the active classes
    expect(motoTab).toHaveClass('bg-white', 'text-foreground');

    // And Car button should have the inactive classes
    expect(carTab).toHaveClass('text-muted-foreground');
    expect(carTab).not.toHaveClass('bg-white');
    expect(carTab).not.toHaveClass('text-foreground');
  });

  it('should apply the error class when form is submitted with invalid data', () => {
    render(<AddCarModal isOpen={true} onClose={() => {}} dict={mockDict} />);

    // Submit the form immediately (it's empty, so it's invalid)
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    // The error alert should be visible
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    
    // Check for specific Tailwind classes on the error element (from AddCarModal.tsx)
    expect(errorAlert).toHaveClass('px-4', 'py-3', 'rounded-md', 'bg-red-50', 'border-red-100', 'text-red-600');
  });
});
