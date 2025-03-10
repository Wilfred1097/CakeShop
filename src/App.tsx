import { Suspense } from "react";
import { useRoutes, Route, Routes } from "react-router-dom";
import routes from "./routes";
import tempoRoutes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          {routes.map((route) => {
            if (route.children) {
              return (
                <Route
                  key={route.path as string}
                  path={route.path as string}
                  element={route.element}
                >
                  {route.children.map((childRoute) => (
                    <Route
                      key={childRoute.path || "index"}
                      path={childRoute.path}
                      index={childRoute.index}
                      element={childRoute.element}
                    />
                  ))}
                </Route>
              );
            }
            return (
              <Route
                key={route.path as string}
                path={route.path as string}
                element={route.element}
              />
            );
          })}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && (
          <div style={{ display: "none" }}>{useRoutes(tempoRoutes)}</div>
        )}
      </>
    </Suspense>
  );
}

export default App;
