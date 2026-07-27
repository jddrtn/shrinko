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
      <section className="space-y-8">
        <div className="rounded-[2rem] border-2 border-[#24202c] bg-[#ffd84d] p-6 playful-shadow sm:p-8">
          <div className="rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4">
            <img
              src={previewUrl}
              alt={`Preview of ${image.name}`}
              className="mx-auto max-h-96 rounded-xl object-contain"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold">{image.name}</p>

              <p className="mt-1 text-sm font-medium text-[#554f5d]">
                Original size: {formatFileSize(image.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={removeImage}
              disabled={isCompressing}
              className="rounded-full border-2 border-[#24202c] bg-[#fff8ec] px-5 py-2 text-sm font-bold playful-shadow-small transition hover:-translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove image
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border-2 border-[#24202c] bg-[#9de3c2] p-6 playful-shadow sm:p-8">
          <label
            htmlFor="target-size"
            className="font-display block text-2xl font-bold"
          >
            Choose your target size
          </label>

          <p className="mt-2 text-sm font-medium text-[#554f5d]">
            Enter the maximum file size you would like Shrinko to aim for.
          </p>

          <div className="mt-5 flex items-center gap-3">
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
              className="w-full rounded-xl border-2 border-[#24202c] bg-[#fff8ec] px-4 py-3 font-semibold outline-none transition focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            />

            <span className="font-bold">KB</span>
          </div>

          <button
            type="button"
            onClick={handleCompress}
            disabled={isCompressing}
            className="mt-6 w-full rounded-full border-2 border-[#24202c] bg-[#5267ff] px-4 py-3 font-bold text-white playful-shadow-small transition hover:-translate-y-0.5 hover:bg-[#6678ff] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompressing ? "Compressing…" : "Compress image"}
          </button>

          {isCompressing && (
            <div
              className="mt-6 rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4"
              aria-live="polite"
            >
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span>Compressing image</span>
                <span>{progress}%</span>
              </div>

              <div
                className="h-3 overflow-hidden rounded-full border-2 border-[#24202c] bg-white"
                role="progressbar"
                aria-label="Image compression progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full bg-[#5267ff] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p
              className="mt-5 rounded-xl border-2 border-[#24202c] bg-[#ff735c] p-4 text-sm font-semibold"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {compressedImage && compressedUrl && (
          <section className="rounded-[2rem] border-2 border-[#24202c] bg-[#6678ff] p-6 playful-shadow sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-3xl font-bold">
                Compression complete
              </h2>

              <span className="w-fit rounded-full border-2 border-[#24202c] bg-[#ffd84d] px-4 py-2 text-sm font-bold">
                {getPercentageSaved()}% smaller
              </span>
            </div>

            <div className="mt-6 rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4">
              <img
                src={compressedUrl}
                alt={`Compressed preview of ${image.name}`}
                className="mx-auto max-h-96 rounded-xl object-contain"
              />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4">
                <dt className="text-sm font-medium text-[#554f5d]">
                  Original size
                </dt>

                <dd className="mt-1 text-lg font-bold">
                  {formatFileSize(image.size)}
                </dd>
              </div>

              <div className="rounded-2xl border-2 border-[#24202c] bg-[#9de3c2] p-4">
                <dt className="text-sm font-medium text-[#554f5d]">
                  Compressed size
                </dt>

                <dd className="mt-1 text-lg font-bold">
                  {formatFileSize(compressedImage.size)}
                </dd>
              </div>
            </dl>

            <a
              href={compressedUrl}
              download={getDownloadName()}
              className="mt-6 block rounded-full border-2 border-[#24202c] bg-[#ffd84d] px-4 py-3 text-center font-bold playful-shadow-small transition hover:-translate-y-0.5 hover:shadow-none"
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
        className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#24202c] p-8 text-center transition ${
          isDragActive
            ? "scale-[1.01] bg-[#9de3c2]"
            : "bg-[#ffd84d] hover:bg-[#ffe477]"
        }`}
      >
        <input {...getInputProps()} />

        <span
          aria-hidden="true"
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#24202c] bg-[#fff8ec] text-3xl playful-shadow-small"
        >
          ↑
        </span>

        <p className="font-display text-2xl font-bold">
          {isDragActive ? "Drop your image here" : "Drag and drop an image"}
        </p>

        <p className="mt-2 text-sm font-medium text-[#554f5d]">
          Or click to choose a JPG, PNG or WebP file
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p
          className="mt-4 rounded-xl border-2 border-[#24202c] bg-[#ff735c] p-3 text-sm font-semibold"
          role="alert"
        >
          Please select a valid JPG, PNG or WebP image.
        </p>
      )}
    </section>
  );
}