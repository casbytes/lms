import * as React from 'react'
import {
	Html,
	Head,
	Preview,
	Body,
	Section,
	Row,
	Column,
	Font,
	Text,
	Link,
	Container,
	Tailwind,
} from '@react-email/components'
import { Image } from '~/components/image'
import {
	FaFacebook,
	FaLinkedinIn,
	FaXTwitter,
	FaYoutube,
} from 'react-icons/fa6'

export function Base({ children }: { children?: React.ReactNode }) {
	const baseUrl = 'https://casbytes.com'

	const links = [
		{ name: 'About', href: baseUrl },
		{ name: 'FAQs', href: `${baseUrl}/faqs` },
		{ name: 'Articles', href: `${baseUrl}/articles` },
	]

	const socials = [
		{
			icon: <FaLinkedinIn className="bg-slate-600" size={36} />,
			href: 'https://www.linkedin.com/company/casdev',
		},
		{
			icon: <FaYoutube className="bg-slate-600" size={36} />,
			href: 'https://www.youtube.com/@casbytes',
		},
		{
			icon: <FaXTwitter size={36} className="bg-slate-600" />,
			href: 'https://x.com/casbytes',
		},
		{
			icon: <FaFacebook size={36} className="bg-slate-600" />,
			href: 'https://www.facebook.com/casbytes',
		},
	]
	return (
		<Html>
			{/* <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Magic link</Preview> */}
			<Tailwind>
				<Body className="mx-auto my-auto bg-slate-100 font-sans antialiased">
					<Container className="mx-auto mt-4 rounded border border-solid border-gray-200 bg-white px-4">
						<Section className="py-8">
							<Row>
								<Column className="w-[80%]">
									<Image
										src={`assets/logo.png`}
										width={100}
										height={60}
										alt="CASBytes"
									/>
								</Column>
								<Column align="right">
									<Row align="right">
										{links.map(link => (
											<Column key={link.href}>
												<Link className="mx-2 text-gray-600 no-underline" href={link.href}>
													{link.name}
												</Link>
											</Column>
										))}
									</Row>
								</Column>
							</Row>
						</Section>
						<div>{children}</div>
						<Section>
							<Row>
								<Column className="w-[45%]">
									<Image
										src={`assets/icon.png`}
										width={60}
										height={60}
										alt="company-logo"
									/>
									<Text className="my-2 text-[16px] font-semibold text-gray-900">
										CASBytes
									</Text>
									<Text className="mt-1 text-[16px] text-gray-500">
										Crafting exceptional software solutions for tomorrow&apos;s
										challenges.
									</Text>
								</Column>
								<Column align="left" className="table-cell align-bottom">
									<Row className="table-cell h-[42px] w-[56px] align-bottom">
										<Column>
											{socials.map(social => (
												<Link href={social.href} key={social.href}>
													{social.icon}
												</Link>
											))}
										</Column>
									</Row>
									<Row>
										<Text className="my-2 text-[16px] text-gray-500">
											Kaduna, Nigeria
										</Text>
										<Text className="mt-1 text-[16px] text-gray-500">
											<Link href="mailto:support@casbytes.com"></Link>
										</Text>
									</Row>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
