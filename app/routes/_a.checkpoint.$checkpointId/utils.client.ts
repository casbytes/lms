import { toast } from "~/components/ui/use-toast";

interface IHandleResponse {
  status: string;
  message: string;
}

export function handleResponse(checkpointResponse: IHandleResponse) {
  if (checkpointResponse.status === "success") {
    toast({
      title: checkpointResponse.message,
    });
  } else {
    toast({
      title: checkpointResponse.message,
      variant: "destructive",
    });
  }
}
