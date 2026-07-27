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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedImage = acceptedFiles[0];

    if (selectedImage) {
      setImage(selectedImage);
      setPreviewUrl(URL.createObjectURL(selectedImage));
      setCompressedImage(null);
      setCompressedUrl("");
      setProgress(0);
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
    setProgress(0);
    setError("");
    setCompressedImage(null);
    setCompressedUrl("");

    try {
      const result = await imageCompression(image, {
        maxSizeMB: targetSize / 1024,
        useWebWorker: true,
        maxIteration: 15,
        onProgress: (percentage) => {
          setProgress(Math.round(percentage));
        },
      });

      setCompressedImage(result);
      setCompressedUrl(URL.createObjectURL(result));
      setProgress(100);
    } catch {
      setError("Shrinko couldn't compress this image. Please try another file.");
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl("");
    setCompressedImage(null);
    setCompressedUrl("");
    setIsCompressing(false);
    setProgress(0);
    setError("");
  };

  const getDownloadName = () => {
    if (!image) {
      return "shrinko-image";
    }

    const dotPosition = image.name.lastIndexOf(".");
    const name =
      dotPosition === -1 ? image.name : image.name.slice(0, dotPosition);
    const extension =
      dotPosition === -1 ? "" : image.name.slice(dotPosition);

    return `${name}-compressed${extension}`;
  };

  const getPercentageSaved = () => {
    if (!image || !compressedImage) {
      return 0;
    }

    return Math.max(
      0,
      Math.round(((image.size - compressedImage.size) / image.size) * 100),
    );
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
              disabled={isCompressing}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove image
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <label htmlFor="target-size" className="block text-sm font-medium">
            Target file size
          </label>

          <div className="mt-2 flex items-center gap-3">
            <input
              id="target-size"
              type="number"
              min="1"
              value={targetSize}
              disabled={isCompressing}
              onChange={(event) => {
                setTargetSize(Number(event.target.value));
                setError("");
              }}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
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

          {isCompressing && (
            <div className="mt-4" aria-live="polite">
              <div className="mb-2 flex justify-between text-sm text-zinc-400">
                <span>Compressing image</span>
                <span>{progress}%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-zinc-800"
                role="progressbar"
                aria-label="Image compression progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {compressedImage && compressedUrl && (
          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Compression complete</h2>

              <span className="w-fit rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                {getPercentageSaved()}% smaller
              </span>
            </div>

            <img
              src={compressedUrl}
              alt={`Compressed preview of ${image.name}`}
              className="mx-auto mt-6 max-h-96 rounded-xl object-contain"
            />

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-black/20 p-4">
                <dt className="text-sm text-zinc-400">Original size</dt>

                <dd className="mt-1 text-lg font-semibold">
                  {formatFileSize(image.size)}
                </dd>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <dt className="text-sm text-zinc-400">Compressed size</dt>

                <dd className="mt-1 text-lg font-semibold text-emerald-300">
                  {formatFileSize(compressedImage.size)}
                </dd>
              </div>
            </dl>

            <a
              href={compressedUrl}
              download={getDownloadName()}
              className="mt-6 block rounded-lg bg-emerald-500 px-4 py-3 text-center font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Download compressed image
            </a>
          </section>
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