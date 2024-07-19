import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import { Container } from "../container";
import { FaQuoteLeft } from "react-icons/fa6";

export function Testimonial() {
  return (
    <Container
      className="max-w-6xl overflo-x-auto py-20 relative"
      id="testimonials"
    >
      <h2 className="mb-12 text-3xl text-center">
        Voices of Success:{" "}
        <span className="text-blue-600">Hear What Our Students Say</span>
      </h2>
      <Carousel
        opts={{
          // align: "s",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 sm:basis-1/2 lg:basis-1/3"
            >
              <div className="p-2">
                <Card className="border-blue-500 drop-shadow-md bg-slate-100">
                  <CardContent className="flex flex-col aspect-square items-start justify-center p-4">
                    <FaQuoteLeft size={45} className="text-blue-300" />
                    <p className="mt-4 mb-10">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Labore doloremque possimus dolores ab vitae. Vero,
                      molestias sed nisi itaque natus illum error nesciunt
                      repellat nostrum odio distinctio, et rerum iusto? Lorem
                      ipsum dolor sit amet consectetur adipisicing elit. Labore
                      doloremque possimus dolores ab vitae. Vero, molestias sed
                      nisi itaque natus illum error nesciunt repellat nostrum
                      odio distinctio, et rerum iusto?
                    </p>
                    <div className="relative bg-zinc-600 text-white h-36 rounded-md rounded-t-[50%] w-full p-2 mx-auto">
                      <img
                        src="https://cdn.casbytes.com/assets/avatar.png"
                        width={100}
                        height={100}
                        alt="avatar"
                        className="rounded-full absolute -top-10 bottom-0 left-0 right-0 mx-auto"
                      />
                      <h1 className="text-lg text-center text-slate-100 font-black mt-12">
                        Christopher Sesugh
                      </h1>
                      <h2 className="text-blue-100 text-center">
                        Software engineer
                      </h2>
                      <p className="text-bold text-xl text-blue-200 text-center">
                        {index < 3 ? " Google" : "Microsoft"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="font-black bg-blue-600 text-white border-2 border-blue-400 absolute -left-2.5" />
        <CarouselNext className="font-black bg-blue-600 text-white border-2 border-blue-400 absolute -right-2.5" />
      </Carousel>
    </Container>
  );
}
