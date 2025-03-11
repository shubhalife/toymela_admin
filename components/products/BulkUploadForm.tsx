"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const BulkUpload = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx")) {
      toast.error("Please upload a valid Excel file.");
      return;
    }

    setFile(selectedFile);
    readExcelFile(selectedFile);
  };

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const binaryStr = e.target?.result as string;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      // Convert Excel data to ProductType format
      const formattedProducts = jsonData.map((row) => ({
        title: row["Title"] || "",
        description: row["Description"] || "",
        media: row["Images"] ? row["Images"].split(",") : [],
        category: row["Category"] || "",
        collections: row["Collections"] ? row["Collections"].split(",") : [],
        tags: row["Tags"] ? row["Tags"].split(",") : [],
        sizes: row["Sizes"] ? row["Sizes"].split(",") : [],
        colors: row["Colors"] ? row["Colors"].split(",") : [],
        price: parseFloat(row["Price"]) || 0.1,
        expense: parseFloat(row["Expense"]) || 0.1,
      }));

      setProducts(formattedProducts);
      toast.success("File uploaded successfully!");
    };
  };

  const handleSubmit = async () => {
    if (products.length === 0) {
      toast.error("No products to upload.");
      return;
    }

    try {
      const res = await fetch("/api/products/bulk-upload", {
        method: "POST",
        body: JSON.stringify(products),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Products uploaded successfully!");
        window.location.href = "/products";
        router.push("/products");
      } else {
        toast.error("Upload failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-10">
      <p className="text-heading2-bold">Bulk Upload Products</p>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="border p-2 mt-4"
      />
      {file && <p className="mt-2">File: {file.name}</p>}

      {products.length > 0 && (
        <div className="mt-4">
          <p>{products.length} products ready for upload.</p>
          <Button onClick={handleSubmit} className="bg-blue-1 text-white mt-4">
            Upload Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
