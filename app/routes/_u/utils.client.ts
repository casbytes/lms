import { toast } from "~/components/ui/use-toast";

type Response = {
  email: string | null;
  error: string | null;
  success: boolean;
};

export async function handleResponse(response: Response) {
  if (!response.success) {
    if (response.email && response?.error) {
      toast({
        title: "Failed to send magic link",
        description: response.error,
        variant: "destructive",
      });
    } else if (!response.email && response?.error) {
      toast({
        title: "De play, Invalid token.",
        description: response?.error,
        variant: "destructive",
      });
    }
  } else {
    toast({
      title: "✨ Magic link sent!",
      description: `A magic link has been sent to ${response.email}`,
    });
  }
}
