import ImageUploader from "../components/ImageUploader";

export default function Compress() {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Compress an image</h1>

        <p className="mt-4">
          Reduce an image's file size.
        </p>
      </div>

      <ImageUploader />
    </section>
  );
}