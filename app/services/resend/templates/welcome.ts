interface IWelcome {
  name: string;
  email: string;
}

export function Welcome({ name, email }: IWelcome) {
  return `<div>some</div>;`;
}
