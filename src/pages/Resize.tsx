import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

type ImageDimensions = {
  width: number;
  height: number;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Resize() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalDimensions, setOriginalDimensions] =
    useState<ImageDimensions | null>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const [resizedImage, setResizedImage] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [error, setError] = useState("");

  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedImage = acceptedFiles[0];

    if (!selectedImage) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (resizedUrl) {
      URL.revokeObjectURL(resizedUrl);
    }

    const newPreviewUrl = URL.createObjectURL(selectedImage);
    const imageElement = new Image();

    imageElement.onload = () => {
      setOriginalDimensions({
        width: imageElement.naturalWidth,
        height: imageElement.naturalHeight,
      });

      setWidth(imageElement.naturalWidth);
      setHeight(imageElement.naturalHeight);
      imageElementRef.current = imageElement;
    };

    imageElement.onerror = () => {
      URL.revokeObjectURL(newPreviewUrl);
      setError("Please try another file.");
    };

    imageElement.src = newPreviewUrl;

    setImage(selectedImage);
    setPreviewUrl(newPreviewUrl);
    setResizedImage(null);
    setResizedUrl("");
    setError("");
  };

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
      if (resizedUrl) {
        URL.revokeObjectURL(resizedUrl);
      }
    };
  }, [resizedUrl]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setError("");
    setResizedImage(null);
    setResizedUrl("");

    if (keepAspectRatio && originalDimensions && newWidth > 0) {
      const aspectRatio =
        originalDimensions.width / originalDimensions.height;

      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setError("");
    setResizedImage(null);
    setResizedUrl("");

    if (keepAspectRatio && originalDimensions && newHeight > 0) {
      const aspectRatio =
        originalDimensions.width / originalDimensions.height;

      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleResize = () => {
    if (!image || !imageElementRef.current) {
      return;
    }

    if (width <= 0 || height <= 0) {
      setError("Width and height must both be greater than 0 pixels.");
      return;
    }

    setIsResizing(true);
    setError("");
    setResizedImage(null);

    if (resizedUrl) {
      URL.revokeObjectURL(resizedUrl);
      setResizedUrl("");
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Shrinko couldn't resize this image. Please try again.");
      setIsResizing(false);
      return;
    }

    canvas.width = Math.round(width);
    canvas.height = Math.round(height);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      imageElementRef.current,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const outputType =
      image.type === "image/png" ||
      image.type === "image/webp" ||
      image.type === "image/jpeg"
        ? image.type
        : "image/png";

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Shrinko couldn't resize this image. Please try again.");
          setIsResizing(false);
          return;
        }

        setResizedImage(blob);
        setResizedUrl(URL.createObjectURL(blob));
        setIsResizing(false);
      },
      outputType,
      0.92,
    );
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl("");
    setOriginalDimensions(null);
    setWidth(0);
    setHeight(0);
    setResizedImage(null);
    setResizedUrl("");
    setIsResizing(false);
    setError("");
    imageElementRef.current = null;
  };

  const getDownloadName = () => {
    if (!image) {
      return "shrinko-resized-image";
    }

    const dotPosition = image.name.lastIndexOf(".");
    const name =
      dotPosition === -1 ? image.name : image.name.slice(0, dotPosition);
    const extension =
      dotPosition === -1 ? ".png" : image.name.slice(dotPosition);

    return `${name}-${width}x${height}${extension}`;
  };

  return (
    <div className="mb-10 text-center">
      <header className="mb-10">

        <h1 className="text-4xl font-bold tracking-tight">
          Re-size an image
        </h1>

        <p className="mt-4">
          Change your image's dimensions without losing quality.
        </p>
      </header>

      {!image && (
        <section>
          <div
            {...getRootProps()}
            className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#24202c] p-8 text-center transition ${
              isDragActive
                ? "scale-[1.01] bg-[#9de3c2]"
                : "bg-[#9de3c2] hover:bg-[#b4ebd1]"
            }`}
          >
            <input {...getInputProps()} />

            <span
              aria-hidden="true"
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#24202c] bg-[#fff8ec] text-3xl playful-shadow-small"
            >
              ↔
            </span>

            <p className="font-display text-2xl font-bold">
              {isDragActive
                ? "Drop your image here"
                : "Drag and drop an image"}
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
      )}

      {image && previewUrl && originalDimensions && (
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
                  {originalDimensions.width} × {originalDimensions.height} px
                  {" · "}
                  {formatFileSize(image.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={removeImage}
                disabled={isResizing}
                className="rounded-full border-2 border-[#24202c] bg-[#fff8ec] px-5 py-2 text-sm font-bold playful-shadow-small transition hover:-translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove image
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-[#24202c] bg-[#9de3c2] p-6 playful-shadow sm:p-8">
            <h2 className="font-display text-2xl font-bold">
              Choose your new dimensions
            </h2>

            <p className="mt-2 text-sm font-medium text-[#554f5d]">
              Enter the width and height you want in pixels.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="font-bold">
                Width

                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={width}
                    disabled={isResizing}
                    onChange={(event) =>
                      handleWidthChange(Number(event.target.value))
                    }
                    className="min-w-0 w-full rounded-xl border-2 border-[#24202c] bg-[#fff8ec] px-4 py-3 font-semibold outline-none transition focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span>px</span>
                </div>
              </label>

              <label className="font-bold">
                Height

                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={height}
                    disabled={isResizing}
                    onChange={(event) =>
                      handleHeightChange(Number(event.target.value))
                    }
                    className="min-w-0 w-full rounded-xl border-2 border-[#24202c] bg-[#fff8ec] px-4 py-3 font-semibold outline-none transition focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span>px</span>
                </div>
              </label>
            </div>

            <label className="mt-6 flex cursor-pointer items-center gap-3 font-semibold">
              <input
                type="checkbox"
                checked={keepAspectRatio}
                disabled={isResizing}
                onChange={(event) =>
                  setKeepAspectRatio(event.target.checked)
                }
                className="h-5 w-5 accent-[#5267ff]"
              />

              Keep the original aspect ratio
            </label>

            <button
              type="button"
              onClick={handleResize}
              disabled={isResizing}
              className="mt-6 w-full rounded-full border-2 border-[#24202c] bg-[#5267ff] px-4 py-3 font-bold text-white playful-shadow-small transition hover:-translate-y-0.5 hover:bg-[#6678ff] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResizing ? "Resizing…" : "Resize image"}
            </button>

            {error && (
              <p
                className="mt-5 rounded-xl border-2 border-[#24202c] bg-[#ff735c] p-4 text-sm font-semibold"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {resizedImage && resizedUrl && (
            <section className="rounded-[2rem] border-2 border-[#24202c] bg-[#6678ff] p-6 playful-shadow sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-3xl font-bold">
                  Resize complete
                </h2>

                <span className="w-fit rounded-full border-2 border-[#24202c] bg-[#ffd84d] px-4 py-2 text-sm font-bold">
                  {width} × {height} px
                </span>
              </div>

              <div className="mt-6 rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4">
                <img
                  src={resizedUrl}
                  alt={`Resized preview of ${image.name}`}
                  className="mx-auto max-h-96 rounded-xl object-contain"
                />
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-[#24202c] bg-[#fff8ec] p-4">
                  <dt className="text-sm font-medium text-[#554f5d]">
                    Original dimensions
                  </dt>

                  <dd className="mt-1 text-lg font-bold">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </dd>
                </div>

                <div className="rounded-2xl border-2 border-[#24202c] bg-[#9de3c2] p-4">
                  <dt className="text-sm font-medium text-[#554f5d]">
                    New dimensions
                  </dt>

                  <dd className="mt-1 text-lg font-bold">
                    {width} × {height} px
                  </dd>
                </div>
              </dl>

              <a
                href={resizedUrl}
                download={getDownloadName()}
                className="mt-6 block rounded-full border-2 border-[#24202c] bg-[#ffd84d] px-4 py-3 text-center font-bold playful-shadow-small transition hover:-translate-y-0.5 hover:shadow-none"
              >
                Download resized image
              </a>
            </section>
          )}
        </section>
      )}
    </div>
  );
}