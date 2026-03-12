import { useState, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  initialImage?: string;
  onCropComplete: (base64Image: string) => void;
}

export function ImageCropper({ initialImage, onCropComplete }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState(initialImage || "");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect] = useState<number>(16 / 9);

  // Kapag nag-select ng file
  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  // Kapag nag-load yung image, iset ang default crop area
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 100 }, aspect, width, height),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop({
      unit: 'px',
      x: initialCrop.x,
      y: initialCrop.y,
      width: (initialCrop.width * width) / 100,
      height: (initialCrop.height * height) / 100
    });
  }

  // AUTOMATIC OPTIMIZATION
  useEffect(() => {
    async function generate() {
      const img = document.querySelector(".ReactCrop img") as HTMLImageElement;
      if (img && completedCrop && completedCrop.width > 0) {
        const canvas = document.createElement("canvas");
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        
        // Optimize resolution to 1000px width (Perfect balance of quality and size)
        const targetWidth = 1000;
        const targetHeight = targetWidth / aspect;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0, 0, targetWidth, targetHeight
        );

        // Convert to small Base64 string
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        onCropComplete(base64);
      }
    }
    
    const timeout = setTimeout(generate, 200);
    return () => clearTimeout(timeout);
  }, [completedCrop]);

  return (
    <div className="w-full space-y-4">
      {!imgSrc ? (
        <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 transition-all group overflow-hidden">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Select Banner</p>
              <p className="text-[9px] text-slate-300 font-bold uppercase mt-1">Direct upload to Ledger</p>
            </div>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
        </label>
      ) : (
        <div className="relative">
          <div className="overflow-hidden rounded-[3rem] border-4 border-white dark:border-slate-900 shadow-2xl">
            <ReactCrop 
              crop={crop} 
              onChange={(c) => setCrop(c)} 
              onComplete={(c) => setCompletedCrop(c)} 
              aspect={aspect}
              className="w-full"
            >
              <img src={imgSrc} onLoad={onImageLoad} alt="Crop" className="w-full h-auto block" />
            </ReactCrop>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute -bottom-4 right-8 flex gap-2">
            <button 
              type="button"
              onClick={() => setImgSrc("")}
              className="bg-rose-500 text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-colors"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
