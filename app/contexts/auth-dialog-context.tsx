import * as React from "react";
import invariant from "tiny-invariant";

interface AuthDialogContextProps {
  isAuthDialogOpen: boolean;
  closeAuthDialog: () => void;
  openAuthDialog: () => void;
}

const AuthDialogContext = React.createContext<
  AuthDialogContextProps | undefined
>(undefined);

function AuthDialogProvider(props: { children: React.ReactNode }) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);

  const closeAuthDialog = () => setIsAuthDialogOpen(false);
  const openAuthDialog = () => setIsAuthDialogOpen(true);

  const value = { isAuthDialogOpen, closeAuthDialog, openAuthDialog };

  return <AuthDialogContext.Provider value={value} {...props} />;
}

function useAuthDialog() {
  const context = React.useContext(AuthDialogContext);
  invariant(
    context,
    "useAuthDialog must be used within an AuthDialogProvider."
  );
  return context;
}

export { AuthDialogProvider, useAuthDialog };
