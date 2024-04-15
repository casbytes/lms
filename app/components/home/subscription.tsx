import { Container } from "~/components/container";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";

export function Subscription() {
  return (
    <Container id="subscription">
      <div className="bg-[url('https://cdn.casbytes.com/assets/icon.png')] bg-no-repeat bg-cover bg-opacity-30">
        <div className="mx-auto bg-sky-300/95 rounded-md py-20 px-12">
          <div className="max-w-3xl md:py-12 mx-auto">
            <h1 className="text-center text-2xl mb-16">
              Start our introductory courses for free. When you are prepared and
              ready to move forward, it's just a step away.
              <p className="text-zinc-600 text-sm">Cancel anytime</p>
            </h1>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 items-center justify-evenly rounded-md mb-14">
                {paymentOptions.map((option, index) => (
                  <div key={`item-${index}`}>
                    <h1 className="text-2xl capitalize opacity-60 mb-2">
                      {option.season === "year" ? "annual" : option.season}ly
                    </h1>
                    <h2 className="font-bold text-2xl">
                      $ <span className="text-5xl">{option.price}</span>
                    </h2>
                    <p className="font-bold text-sm">per {option.season}</p>
                  </div>
                ))}
              </div>
              <DialogTrigger>Get started</DialogTrigger>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

const paymentOptions = [
  { season: "month", price: 49 },
  { season: "quarter", price: 69 },
  { season: "biannual", price: 119 },
  { season: "year", price: 149 },
];
