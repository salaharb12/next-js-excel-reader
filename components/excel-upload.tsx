'use client'
import { useState } from "react";
import { read, utils } from "xlsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JSX, SVGProps } from "react";
import { PersonTable } from "./person-table";

export function ExcelUpload() {
  const [fileName, setFileName] = useState("No file selected");
  const [fileData, setFileData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
  
        const result = await response.json();
        console.log(result); // Log to debug
        setFileData(result.data || []);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Excel File</CardTitle>
        <CardDescription>Select an Excel or CSV file to read and process its contents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="file" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center space-x-2 rounded-md border border-dashed border-input px-6 py-10 text-center">
              <UploadIcon className="h-6 w-6 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Select Excel or CSV File</span>
            </div>
            <Input id="file" type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleFileChange} required />
          </Label>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-medium">{fileName}</span>
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {fileData.length > 0 && <PersonTable data={fileData} />}
      </CardContent>
    </Card>
  );
}

function UploadIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
