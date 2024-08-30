// app/components/ExcelReader.tsx
'use client';

import React, { useState } from 'react';
import { Person } from '@/app/types/Person';

export default function ExcelReader() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setValidationErrors([]);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/read-excel', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        if (result.error === 'Invalid Excel data') {
          setValidationErrors(result.details);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Upload Excel File
          </label>
          <input
            type="file"
            id="file"
            accept=".xlsx, .xls , .csv"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-violet-50 file:text-violet-700
                      hover:file:bg-violet-100"
          />
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Read Excel'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="text-red-500 mb-4">
          <p>Excel data is invalid:</p>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">CIN</th>
                <th className="py-2 px-4 border-b">Address</th>
                <th className="py-2 px-4 border-b">Phone Number</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Gender</th>
                <th className="py-2 px-4 border-b">Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {data.map((person, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{person.cin}</td>
                  <td className="py-2 px-4 border-b">{person.address}</td>
                  <td className="py-2 px-4 border-b">{person.phoneNumber}</td>
                  <td className="py-2 px-4 border-b">{person.email}</td>
                  <td className="py-2 px-4 border-b">{person.gender}</td>
                  <td className="py-2 px-4 border-b">{new Date(person.dateOfBirth).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}