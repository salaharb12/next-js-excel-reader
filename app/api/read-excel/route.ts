// app/api/read-excel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Person , GenderType } from '@/app/types/Person';

const requiredColumns: (keyof Person)[] = ['cin', 'address', 'phoneNumber', 'email', 'gender', 'dateOfBirth'];

function validateExcelData(data: any[]): { isValid: boolean; errors: string[]; validData: Person[] } {
  const errors: string[] = [];
  const validData: Person[] = [];

  // Check if all required columns are present
  const firstRow = data[0];
  requiredColumns.forEach(column => {
    if (!(column in firstRow)) {
      errors.push(`Missing column: ${column}`);
    }
  });

  // Check if there are any extra columns
  Object.keys(firstRow).forEach(column => {
    if (!requiredColumns.includes(column as keyof Person)) {
      errors.push(`Extra column found: ${column}`);
    }
  });

  // If the structure is invalid, return early
  if (errors.length > 0) {
    return { isValid: false, errors, validData: [] };
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    const validatedRow: Partial<Person> = {};

    // Validate CIN
    if (!row.cin || typeof row.cin !== 'string') {
      rowErrors.push('CIN is missing or invalid');
    } else {
      validatedRow.cin = row.cin;
    }

    // Validate address
    if (!row.address || typeof row.address !== 'string') {
      rowErrors.push('Address is missing or invalid');
    } else {
      validatedRow.address = row.address;
    }

    // Validate phoneNumber
    if (!row.phoneNumber || typeof row.phoneNumber !== 'number') {
      rowErrors.push('Phone number is missing or invalid');
    } else {
      validatedRow.phoneNumber = row.phoneNumber;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!row.email || typeof row.email !== 'string' || !emailRegex.test(row.email)) {
      rowErrors.push('Email is missing or invalid');
    } else {
      validatedRow.email = row.email;
    }

    // Validate gender
    if (!row.gender || !['MALE', 'FEMALE', 'OTHER'].includes(row.gender.toUpperCase())) {
      rowErrors.push('Gender is missing or invalid (must be MALE, FEMALE, or OTHER)');
    } else {
      validatedRow.gender = row.gender.toUpperCase() as GenderType;
    }

    // Validate dateOfBirth
    const dateOfBirth = new Date(row.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      rowErrors.push('Date of birth is missing or invalid');
    } else {
      validatedRow.dateOfBirth = dateOfBirth.toISOString();
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
    } else {
      validData.push(validatedRow as Person);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validData
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const validation = validateExcelData(data);

    if (!validation.isValid) {
      return NextResponse.json({ error: 'Invalid Excel data', details: validation.errors }, { status: 400 });
    }

    return NextResponse.json({ data: validation.validData });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json({ error: 'Error processing Excel file' }, { status: 500 });
  }
}