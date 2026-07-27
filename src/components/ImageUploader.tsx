import { useCallback, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { useDropzone } from "react-dropzone";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [targetSize, setTargetSize] = useState(500);

  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState("");

  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedImage = acceptedFiles[0];

    if (selectedImage) {
      setImage(selectedImage);
      setPreviewUrl(URL.createObjectURL(selectedImage));
      setCompressedImage(null);
      setCompressedUrl("");
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
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

  useEffect(() => {
    return () => {
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }
    };
  }, [compressedUrl]);

  const handleCompress = async () => {
    if (!image) {
      return;
    }

    if (targetSize <= 0) {
      setError("Enter a target size greater than 0 KB.");
      return;
    }

    if (targetSize * 1024 >= image.size) {
      setError("Choose a target size smaller than the original image.");
      return;
    }

    setIsCompressing(true);
    setError("");
    setCompressedImage(null);
    setCompressedUrl("");

    try {
      const result = await imageCompression(image, {
        maxSizeMB: targetSize / 1024,
        useWebWorker: true,
        maxIteration: 15,
      });

      setCompressedImage(result);
      setCompressedUrl(URL.createObjectURL(result));
    } catch {
      setError("Shrinko couldn't compress this image. Please try another file.");
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl("");
    setCompressedImage(null);
    setCompressedUrl("");
    setError("");
  };

  const getDownloadName = () => {
    if (!image) {
      return "shrinko-image";
    }

    const dotPosition = image.name.lastIndexOf(".");
    const name = dotPosition === -1 ? image.name : image.name.slice(0, dotPosition);
    const extension = dotPosition === -1 ? "" : image.name.slice(dotPosition);

    return `${name}-compressed${extension}`;
  };

  if (image && previewUrl) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <img
            src={previewUrl}
            alt={`Preview of ${image.name}`}
            className="mx-auto max-h-96 rounded-xl object-contain"
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{image.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                Original size: {formatFileSize(image.size)}
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
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <label
            htmlFor="target-size"
            className="block text-sm font-medium"
          >
            Target file size
          </label>

          <div className="mt-2 flex items-center gap-3">
            <input
              id="target-size"
              type="number"
              min="1"
              value={targetSize}
              onChange={(event) => setTargetSize(Number(event.target.value))}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-400"
            />

            <span className="text-zinc-400">KB</span>
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={isCompressing}
            className="mt-5 w-full rounded-lg bg-violet-500 px-4 py-3 font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompressing ? "Compressing…" : "Compress image"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {compressedImage && compressedUrl && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6">
            <h2 className="text-lg font-semibold">Compression complete</h2>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p className="text-zinc-400">
                Original:{" "}
                <span className="text-white">
                  {formatFileSize(image.size)}
                </span>
              </p>

              <p className="text-zinc-400">
                Compressed:{" "}
                <span className="text-white">
                  {formatFileSize(compressedImage.size)}
                </span>
              </p>
            </div>

            <a
              href={compressedUrl}
              download={getDownloadName()}
              className="mt-6 block rounded-lg bg-emerald-500 px-4 py-3 text-center font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Download compressed image
            </a>
          </div>
        )}
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
          Or click to choose a JPG, PNG or WebP file
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          Please select a valid JPG, PNG or WebP image.
        </p>
      )}
    </section>
  );
}