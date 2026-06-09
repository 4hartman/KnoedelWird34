// Root component: wires routing and the auth guard. Every route is protected —
// editors must be signed in. The published gift runtime is served separately
// (runtime/), not through this SPA.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { ProjectList } from './projects/ProjectList';
import { ProjectEditor } from './editor/ProjectEditor';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RequireAuth>
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:id" element={<ProjectEditor />} />
          </Routes>
        </RequireAuth>
      </BrowserRouter>
    </AuthProvider>
  );
}
