
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import NoName from "./pages/NoName";
import WritersSpotlight from "./pages/WritersSpotlight";
import Auth from "./pages/Auth";
import ContentDetail from "./pages/ContentDetail";
import Followers from "./pages/Followers";
import Vilayattu from "./pages/Vilayattu";
import Quizz from "./pages/quizz/Quizz";
import LevelOne from "./pages/cross-word-game/level1";
import LevelTwo from "./pages/cross-word-game/level2";
// import LevelThree from "./pages/cross-word-game/level3";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/noname" element={<NoName />} />
      <Route path="/spotlight" element={<WritersSpotlight />} />
      <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
      <Route path="/vilayattu" element={<Vilayattu />} />
      <Route path="/quizz/Quizz" element={<Quizz />} />
      <Route path="/cross-word-game/level1" element={<LevelOne />} />
      <Route path="/cross-word-game/level2" element={<LevelTwo />} />
      {/* <Route path="/cross-word-game/level3" element={<LevelThree />} /> */}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
