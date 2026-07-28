import { Link } from "react-router";

export default function Home() {
  return (
    <div>
      <section className="rounded-[2rem] border-2 border-[#24202c] bg-[#ff735c] px-6 py-16 playful-shadow sm:px-12 sm:py-24">
        <div className="max-w-4xl">
          <h1 className="font-display max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-tight">
            Give your images a little{" "}
            <span className="font-logo text-[#fff8ec]">shrink.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl">
            Compress, resize and convert images in your browser for free 
            without installing anything.
          </p>

          <Link
            to="/compress"
            className="mt-8 inline-block rounded-full border-2 border-[#24202c] bg-[#5267ff] px-7 py-4 font-bold text-white playful-shadow-small transition hover:-translate-y-1 hover:shadow-none"
          >
            Shrink an image →
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>

            <h2 className="font-display mt-2 text-4xl font-bold sm:text-5xl">
              What does your image need?
            </h2>
          </div>


        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <article className="flex flex-col rounded-[2rem] border-2 border-[#24202c] bg-[#ffd84d] p-7 playful-shadow transition hover:-translate-y-1">
            <span
              aria-hidden="true"
              className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#24202c] bg-[#fff8ec] text-2xl"
            >
              ↓
            </span>

            <h3 className="font-display text-3xl font-bold">Compress</h3>

            <p className="mt-3 flex-1 leading-relaxed">
              Make image files smaller while keeping them looking crisp and
              clear.
            </p>

            <Link
              to="/compress"
              className="mt-8 font-bold underline decoration-2 underline-offset-4"
            >
              Compress an image →
            </Link>
          </article>

          <article className="flex flex-col rounded-[2rem] border-2 border-[#24202c] bg-[#9de3c2] p-7 playful-shadow transition hover:-translate-y-1">
            <span
              aria-hidden="true"
              className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#24202c] bg-[#fff8ec] text-2xl"
            >
              ↔
            </span>

            <h3 className="font-display text-3xl font-bold">Resize</h3>

            <p className="mt-3 flex-1 leading-relaxed">
              Change an image's width and height while keeping its proportions
              intact.
            </p>

            <Link
              to="/resize"
              className="mt-8 font-bold underline decoration-2 underline-offset-4"
            >
              Resize an image →
            </Link>
          </article>

          <article className="flex flex-col rounded-[2rem] border-2 border-[#24202c] bg-[#6678ff] p-7 playful-shadow transition hover:-translate-y-1">
            <span
              aria-hidden="true"
              className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#24202c] bg-[#fff8ec] text-2xl"
            >
              ✦
            </span>

            <h3 className="font-display text-3xl font-bold">Convert</h3>

            <p className="mt-3 flex-1 leading-relaxed">
              Turn JPG, PNG or WebP images into the format you need.
            </p>

            <Link
              to="/convert"
              className="mt-8 font-bold underline decoration-2 underline-offset-4"
            >
              Convert an image →
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}