import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { uploadToCloudinary, CLOUDINARY_CONFIG } from '@/lib/cloudinary';

export function CloudinaryTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const testUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Cloudinary upload with config:', CLOUDINARY_CONFIG);
      
      const uploadResult = await uploadToCloudinary(file);
      setResult(uploadResult);
      
    } catch (err) {
      console.error('Upload test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  const testPresetValidity = async () => {
    try {
      const testFormData = new FormData();
      testFormData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload_presets/${CLOUDINARY_CONFIG.uploadPreset}`,
        {
          method: 'GET',
        }
      );
      
      if (response.ok) {
        const presetData = await response.json();
        console.log('Upload preset is valid:', presetData);
        setError(null);
      } else {
        console.error('Upload preset validation failed:', response.status);
        setError(`Upload preset '${CLOUDINARY_CONFIG.uploadPreset}' may not exist or is not accessible`);
      }
    } catch (err) {
      console.error('Error checking preset:', err);
      setError('Could not validate upload preset');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Cloudinary Upload Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Display */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Configuration:</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Cloud Name:</strong> {CLOUDINARY_CONFIG.cloudName}</p>
            <p><strong>Upload Preset:</strong> {CLOUDINARY_CONFIG.uploadPreset}</p>
            <p><strong>Upload URL:</strong> https://api.cloudinary.com/v1_1/{CLOUDINARY_CONFIG.cloudName}/image/upload</p>
          </div>
        </div>

        {/* Preset Validation */}
        <div>
          <Button onClick={testPresetValidity} variant="outline" size="sm">
            Validate Upload Preset
          </Button>
        </div>

        {/* File Selection */}
        <div>
          <Label htmlFor="test-file">Select Image File</Label>
          <Input
            id="test-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mt-1"
          />
          {file && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Upload Test */}
        <div>
          <Button 
            onClick={testUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Upload...
              </>
            ) : (
              'Test Upload to Cloudinary'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
              <div className="mt-2 text-xs">
                <strong>Common fixes:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Check if upload preset 'ml_default' exists in your Cloudinary dashboard</li>
                  <li>Ensure the upload preset is set to "unsigned" mode</li>
                  <li>Verify the cloud name is correct</li>
                  <li>Check network connectivity</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Upload Successful!</strong>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Public ID:</strong> {result.publicId}</p>
                <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.url}</a></p>
              </div>
              {result.url && (
                <div className="mt-3">
                  <img 
                    src={result.url} 
                    alt="Uploaded test" 
                    className="max-w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Go to your Cloudinary Dashboard → Settings → Upload</li>
            <li>Check if "ml_default" upload preset exists</li>
            <li>If not, create it or use an existing unsigned preset</li>
            <li>Ensure the preset is set to "Unsigned" mode</li>
            <li>Check browser console for detailed error messages</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}