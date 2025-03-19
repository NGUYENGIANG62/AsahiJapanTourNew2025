import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { CalculatorProvider } from "@/context/CalculatorContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import AdminPanel from "@/pages/AdminPanel";
import Calculator from "@/pages/Calculator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import i18n from "@/lib/i18n";

// Protected route component
const ProtectedRoute = ({ component: Component, admin = false, ...rest }: any) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  // If still loading auth state, show nothing
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  
  // If admin route but user is not admin, redirect to calculator
  if (admin && !isAdmin) return <Redirect to="/calculator" />;
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  // Otherwise, render the protected component
  return <Component {...rest} />;
};

// Main router
function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/admin">
            <ProtectedRoute component={AdminPanel} admin={true} />
          </Route>
          <Route path="/calculator">
            <ProtectedRoute component={Calculator} />
          </Route>
          <Route path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="/:rest*">
            <NotFound />
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Initialize i18next
  useEffect(() => {
    // Just ensure i18n is initialized
    i18n.changeLanguage(i18n.language);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CalculatorProvider>
          <Router />
          <Toaster />
        </CalculatorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
