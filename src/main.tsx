import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import "./index.css"

// biome-ignore lint/style/noNonNullAssertion: #root element exists in index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
