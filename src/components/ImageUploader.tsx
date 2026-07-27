import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedImage = acceptedFiles[0];

    if (selectedImage) {
      setImage(selectedImage);
      setPreviewUrl(URL.createObjectURL(selectedImage));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [],
      },
      maxFiles: 1,
    });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImage(null);
    setPreviewUrl("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (image && previewUrl) {
    return (
      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <img
          src={previewUrl}
          alt={`Preview of ${image.name}`}
          className="mx-auto max-h-96 rounded-xl object-contain"
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{image.name}</p>
            <p className="mt-1 text-sm text-zinc-400">
              {formatFileSize(image.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={removeImage}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            Remove image
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div
        {...getRootProps()}
        className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-violet-400 bg-violet-400/10"
            : "border-white/20 bg-zinc-900 hover:border-white/40"
        }`}
      >
        <input {...getInputProps()} />

        <p className="text-lg font-semibold">
          {isDragActive ? "Drop your image here" : "Drag and drop an image"}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Or click to choose a file
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          Please select a valid image file.
        </p>
      )}
    </section>
  );
}