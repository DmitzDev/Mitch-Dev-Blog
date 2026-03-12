import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Image as ImageIcon, X, Check, Upload } from "lucide-react";

interface ImageCropperProps {
    initialImage?: string;
    onCropComplete: (blob: Blob, previewUrl: string) => void;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export function ImageCropper({ initialImage, onCropComplete }: ImageCropperProps) {
    const [imgSrc, setImgSrc] = useState<string>(initialImage || "");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect] = useState<number>(1); // Facebook / IG Square is 1:1
    const [isModalOpen, setIsModalOpen] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialImage && initialImage !== imgSrc) {
            setImgSrc(initialImage);
        }
    }, [initialImage]);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImgSrc(reader.result?.toString() || "");
                setIsModalOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    };

    const handleSaveCrop = async () => {
        if (completedCrop && imgRef.current) {
            const canvas = document.createElement("canvas");
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                return;
            }

            let cropWidth = completedCrop.width * scaleX;
            let cropHeight = completedCrop.height * scaleY;

            const MAX_DIMENSION = 1080;
            if (cropWidth > MAX_DIMENSION || cropHeight > MAX_DIMENSION) {
                const ratio = Math.min(MAX_DIMENSION / cropWidth, MAX_DIMENSION / cropHeight);
                cropWidth *= ratio;
                cropHeight *= ratio;
            }

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                cropWidth,
                cropHeight
            );

            canvas.toBlob((blob) => {
                if (!blob) return;
                const previewUrl = URL.createObjectURL(blob);
                onCropComplete(blob, previewUrl);
                setImgSrc(previewUrl);
                setIsModalOpen(false);
            }, "image/jpeg", 0.8);
        }
    };

    return (
        <div className="w-full">
            {/* File Input hidden */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onSelectFile}
                className="hidden"
            />

            {/* Preview area */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {imgSrc ? (
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <img src={imgSrc} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full sm:w-auto self-start"
                    >
                        <Upload className="w-4 h-4" />
                        {imgSrc ? "Change Image" : "Choose Image"}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                        Upload an image and crop it to 1:1 square (optimal for Facebook & Instagram).
                    </p>
                </div>
            </div>

            {/* Modal for Cropping */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crop Image (1:1 Square)</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-auto flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950/50">
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspect}
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        className="max-h-[60vh] w-auto object-contain"
                                    />
                                </ReactCrop>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCrop}
                                disabled={!completedCrop?.width || !completedCrop?.height}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                Save Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
