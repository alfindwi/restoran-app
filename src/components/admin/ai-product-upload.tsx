"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Wand2, Loader2 } from "lucide-react";
import Image from "next/image";

interface AIProductUploadProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function AIProductUpload({ onSuccess, onClose }: AIProductUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedData(null);
    }
  };

  const processImageWithAI = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/admin/ai-extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedData(data);
      } else {
        alert("Gagal memproses gambar: " + data.error);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Terjadi kesalahan saat memproses gambar");
    } finally {
      setIsProcessing(false);
    }
  };

  const createProduct = async () => {
    if (!extractedData) return;

    setIsCreating(true);

    try {
      const productData = {
        ...extractedData,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || "Gagal membuat produk");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Terjadi kesalahan saat membuat produk");
    } finally {
      setIsCreating(false);
    }
  };

  const updateExtractedData = (field: string, value: string | number) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value,
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Product Upload
        </CardTitle>
        <CardDescription>
          Upload foto produk dan biarkan AI mengekstrak informasi produk secara
          otomatis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Foto Produk</Label>
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && !extractedData && (
              <Button
                onClick={processImageWithAI}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Ekstrak dengan AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview Gambar</Label>
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        )}

        {/* AI Processing Status */}
        {isProcessing && (
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-purple-700 dark:text-purple-300">
                  AI sedang menganalisis gambar dan mengekstrak informasi
                  produk...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Form */}
        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Wand2 className="h-4 w-4" />
              <span className="font-medium">
                Informasi berhasil diekstrak! Silakan review dan edit jika
                diperlukan.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-name">Nama Produk</Label>
                <Input
                  id="ai-name"
                  value={extractedData.name}
                  onChange={(e) => updateExtractedData("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ai-price">Harga (IDR)</Label>
                <Input
                  id="ai-price"
                  type="number"
                  value={extractedData.price}
                  onChange={(e) =>
                    updateExtractedData("price", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ai-description">Deskripsi</Label>
              <Textarea
                id="ai-description"
                value={extractedData.description}
                onChange={(e) =>
                  updateExtractedData("description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ai-category">Kategori</Label>
              <Select
                value={extractedData.category}
                onValueChange={(value) =>
                  updateExtractedData("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Makanan</SelectItem>
                  <SelectItem value="drink">Minuman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={createProduct}
                disabled={isCreating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat Produk...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Buat Produk
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-transparent"
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
