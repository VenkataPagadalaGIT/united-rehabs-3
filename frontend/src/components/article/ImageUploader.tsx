import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

export const ImageUploader = ({ onUpload, currentImage }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage || "");

  const handleUrlSubmit = () => {
    if (imageUrl) {
      onUpload(imageUrl);
      toast.success("Image URL set successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <Button type="button" onClick={handleUrlSubmit} disabled={!imageUrl}>
            Set URL
          </Button>
        </div>
      </div>
      
      {imageUrl && (
        <div className="border rounded-lg p-2">
          <img src={imageUrl} alt="Preview" className="max-h-48 mx-auto object-contain" />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
