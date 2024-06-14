import React from "react";
import { BsStars } from "react-icons/bs";
import { VscError } from "react-icons/vsc";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

type EmailAlertProps = {
  response: {
    email: string | null;
    success: boolean;
  } | null;
};
export function EmailAlert({ response }: EmailAlertProps) {
  return response?.success ? (
    <Alert className="bg-sky-200">
      <BsStars className="h-4 w-4 text-yellow-600" />
      <AlertTitle>Email sent successfully.</AlertTitle>
      <AlertDescription>
        A magic link has been sent to {response.email}.
      </AlertDescription>
    </Alert>
  ) : (
    <Alert variant="destructive">
      <VscError className="h-4 w-4 text-red-500" />
      <AlertTitle>Failed to send magic link. Please try again.</AlertTitle>
      <AlertDescription>
        We are unable to send a magic link to {response?.email}.
      </AlertDescription>
    </Alert>
  );
}
