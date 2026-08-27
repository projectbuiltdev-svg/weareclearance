import { renderToString } from "react-dom/server"

import App from "./App"
import { ErrorBoundary } from "@/components/error-boundary"
import "./index.css"

export function render(url = "/") {
  return renderToString(
    <ErrorBoundary>
      <App ssrPath={url} />
    </ErrorBoundary>,
  )
}