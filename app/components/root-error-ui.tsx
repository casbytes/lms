import {
  useNavigation,
  useNavigate,
  isRouteErrorResponse,
} from "@remix-run/react";
import { Container } from "./container";
import { XCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ErrorUIProps = {
  error: Error | null | undefined | unknown;
};

export function RootErrorUI({ error }: ErrorUIProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isLoading = navigation.state === "loading";
  return (
    <Container className="bg-header-2 bg-no-repeat bg-cover h-screen">
      <Card className="flex flex-col gap-4 max-w-xl mx-auto bg-red-200 overflow-x-auto">
        <CardHeader>
          <img
            src="https://cdn.casbytes.com/assets/logo.png"
            className="w-40 h-8 mx-auto mb-4"
            alt="CASBytes"
          />
          <XCircle size={100} className="text-red-500  mx-auto font-bold" />
          <CardTitle className="capitalize text-4xl font-medium text-center">
            Error!
          </CardTitle>
          <CardDescription className="capitalize text-2xl font-medium text-center">
            {isRouteErrorResponse(error) ? (
              <>
                <p>{error.status}</p>
                <br />
                <p>{error.statusText}</p>
              </>
            ) : (
              "Ooops! An error occured."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-center">
            {isRouteErrorResponse(error) ? (
              error.data
            ) : error instanceof Error ? (
              <>
                Message: <span className="text-red-500">{error.message}</span>
                <br />
                <br />
                Stack: <span className="text-red-500">{error.stack}</span>
              </>
            ) : (
              "An unknown error occured."
            )}
          </p>
          <Button
            onClick={() => navigate(0)}
            // variant="destructive"
            className="!uppercase drop-shadow-xl w-full"
          >
            {isLoading ? "retrying..." : "try again"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
