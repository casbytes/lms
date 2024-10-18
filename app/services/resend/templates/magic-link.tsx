import { Button, Link } from '@react-email/components'
import { Base } from './base'

interface MagicLinkTemplate {
	link: string
	baseUrl?: string
}

export function MagicLinkTemplate({
	link,
}: // baseUrl = "https://casbytes.com",
MagicLinkTemplate) {
	return <Base />
}

{
	/* <Link href={link}>
        <Button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">
          SIGN IN
        </Button>
      </Link>
    </Base> */
}
