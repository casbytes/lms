import { Container } from "../container";
import { Image } from "../image";

export function Partnerships() {
  return (
    <Container className="bg-white">
      <div className="max-3xl mx-auto my-12">
        <h2 className="text-blue-600 mb-12 text-3xl text-center">
          <span className="text-black">Pathway to Success:</span> Our Proud
          Partners And Employers
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mx-auto place-items-center">
          {partners.map((partner, index) => (
            <div key={`partner-${index}`}>
              <Image
                src={`assets/${partner}`}
                alt="partner"
                width={150}
                className="w-[150px] h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

const partners = [
  "atlassian.png",
  "marketo.svg",
  "digitalocean.svg",
  "gatsby.png",
  "hp.svg",
  "intel.svg",
  "linkedin.svg",
  "aws.png",
  "paypal.png",
];
